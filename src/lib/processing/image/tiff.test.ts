import { describe, expect, it } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "../types";
import { PIXELS, tiff, type TiffPage } from "./tiff-files.fixture";

/** Behaviour tests for TIFF, driven through processFile as the app drives it.
 *  Checked first on real files on 8 Nov 2026: Pillow and libtiff TIFFs
 *  (uncompressed, LZW, Deflate, JPEG, PackBits, tiled, 16-bit, alpha,
 *  big-endian, three pages) loaded with exiftool came out pixel-identical on
 *  every page, exiftool found only structure tags left, and libtiff read every
 *  cleaned file without an error. */

const ALL: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

const ascii = (tag: number, value: string) => ({ tag, type: 2 as const, value });

const SCAN: TiffPage = {
  tags: [
    ascii(0x010f, "Epson"), // Make
    ascii(0x0110, "Perfection V600"), // Model
    ascii(0x0131, "SilverFast 9"), // Software
    ascii(0x0132, "2026:11:02 08:41:17"), // DateTime
    ascii(0x013b, "Lars Holmstrom"), // Artist
    ascii(0x8298, "2026 Lars"), // Copyright
  ],
  exif: [ascii(0x9003, "2026:11:02 08:41:17"), ascii(0xa431, "X1234")], // DateTimeOriginal, BodySerialNumber
  gps: [
    { tag: 0x0001, type: 2, value: "S" },
    { tag: 0x0002, type: 5, value: [37, 1, 48, 1, 4896, 100] },
  ],
};
const SCAN_FOUND = [
  "author:Artist", "copyright:Copyright", "dates:DateTime", "dates:DateTimeOriginal",
  "device:BodySerialNumber", "device:Make", "device:Model",
  "gps:GPSLatitude", "gps:GPSLatitudeRef", "software:Software",
];

async function run(bytes: Uint8Array, options = ALL, name = "scan.tif") {
  const file = new File([bytes as BlobPart], name, { type: "image/tiff" });
  return { file, result: await processFile(file, options) };
}

async function bytesOf(result: ProcessingResult) {
  return new Uint8Array(await result.cleanedBlob.arrayBuffer());
}

async function reread(result: ProcessingResult) {
  return summary((await run(await bytesOf(result))).result.report.fieldsFound);
}

/** Where each page's pixels sit: every occurrence of the strip pattern. */
function stripsAt(b: Uint8Array): number[] {
  const at: number[] = [];
  for (let i = 0; i + PIXELS.length <= b.length; i++) if (PIXELS.every((v, j) => b[i + j] === v)) at.push(i);
  return at;
}

const has = (b: Uint8Array, text: string) => new TextDecoder("latin1").decode(b).includes(text);

describe("TIFF", () => {
  it("finds the metadata and none of the image's own structure", async () => {
    const { result } = await run(tiff([SCAN]));
    expect(result.error).toBeUndefined();
    expect(result.report.fileType).toBe("tiff");
    // ImageWidth, StripOffsets, Compression and the rest are never listed.
    expect(summary(result.report.fieldsFound)).toEqual(SCAN_FOUND);
  });

  it("removes it all and leaves the pixels where they were", async () => {
    const input = tiff([SCAN]);
    const { result } = await run(input);
    const out = await bytesOf(result);
    expect(summary(result.report.fieldsRemoved)).toEqual(SCAN_FOUND);
    expect(out.length).toBe(input.length);
    expect(stripsAt(out)).toEqual(stripsAt(input));
    expect(has(out, "Lars Holmstrom")).toBe(false);
    expect(has(out, "X1234")).toBe(false);
    expect(await reread(result)).toEqual([]);
  });

  it("keeps a category that is off, and only that", async () => {
    const { result } = await run(tiff([SCAN]), { ...ALL, gps: false });
    expect(summary(result.report.fieldsKept)).toEqual(["gps:GPSLatitude", "gps:GPSLatitudeRef"]);
    expect(await reread(result)).toEqual(["gps:GPSLatitude", "gps:GPSLatitudeRef"]);
  });

  it("strips every page, listing a tag repeated on each page once", async () => {
    const page = { tags: [ascii(0x0131, "SilverFast 9"), ascii(0x013b, "Lars Holmstrom")] };
    const input = tiff([page, page, { tags: [ascii(0x013b, "Jane Doe")] }]);
    const { result } = await run(input);
    expect(result.report.fieldsFound.map((f) => `${f.key}=${f.value}`).sort()).toEqual([
      "Artist=Jane Doe", "Artist=Lars Holmstrom", "Software=SilverFast 9",
    ]);
    const out = await bytesOf(result);
    expect(has(out, "Lars Holmstrom") || has(out, "Jane Doe") || has(out, "SilverFast")).toBe(false);
    expect(stripsAt(out)).toEqual(stripsAt(input));
    expect(stripsAt(out)).toHaveLength(3);
  });

  it("works in big-endian byte order", async () => {
    const input = tiff([SCAN], { bigEndian: true });
    const { result } = await run(input);
    expect(summary(result.report.fieldsFound)).toEqual(SCAN_FOUND);
    expect(stripsAt(await bytesOf(result))).toEqual(stripsAt(input));
    expect(await reread(result)).toEqual([]);
  });

  it("files GeoTIFF georeferencing under GPS", async () => {
    const geo = { tags: [{ tag: 33922, type: 5 as const, value: [0, 1, 0, 1, 144963, 1000, 37813, 1000] }] };
    const { result } = await run(tiff([geo]), { ...ALL, gps: false });
    expect(result.report.fieldsFound.map((f) => [f.category, f.label])).toEqual([["gps", "GeoTIFF tie points"]]);
    expect(summary(result.report.fieldsKept)).toEqual(["gps:GeoTIFF_33922"]);
  });

  it("refuses a DNG renamed .tif rather than risk its image", async () => {
    const dng = { tags: [{ tag: 0xc612, type: 3 as const, value: [1, 4, 0, 0] }] };
    const { file, result } = await run(tiff([dng]));
    expect(result.reason).toBe("unreadable: tiff");
    expect(result.cleanedBlob).toBe(file);
  });

  it("refuses a page chain that loops back on itself", async () => {
    const { result } = await run(tiff([SCAN, SCAN], { loop: true }));
    expect(result.reason).toBe("unreadable: tiff");
  });

  it("hands back the original bytes when there is nothing to remove", async () => {
    const input = tiff([{}]);
    const { file, result } = await run(input);
    expect(result.report.fieldsFound).toEqual([]);
    expect(await bytesOf(result)).toEqual(new Uint8Array(await file.arrayBuffer()));
  });
});

/** What a converted JPG carries: nothing by default, and, for each category
 *  the person keeps, the source's EXIF for it and nothing else. Checked the
 *  way the tool checks, by reading the output again with every category on. */

import { describe, expect, it } from "vitest";
import { processFile } from "../processing/coordinator";
import type { MetadataCategory, MetadataField, StripOptions } from "../processing/types";
import { Reader } from "../processing/image/exif";
import { jpegExif } from "../processing/image/jpeg";
import {
  concat,
  exifTiff,
  heicWithExif,
  jpegWithExif,
  pngWithExif,
  webpWithExif,
  type Bytes,
} from "../processing/image/image-files.fixture";
import {
  LONG,
  MAKER_NOTE_SERIAL,
  SHORT,
  THUMBNAIL_JPEG,
  largeExif,
  phoneExif,
  tiff,
  unwalkableExif,
} from "../processing/image/exif.fixture";
import { finishJpeg, sourceExif, uprightExif } from "./metadata";

const ALL_ON: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};
const ALL_OFF = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;
const CATEGORIES = Object.keys(ALL_ON) as MetadataCategory[];

/** What a canvas hands back in Chrome: SOI, JFIF, the image, no metadata. */
const JFIF = concat([0xff, 0xe0, 0, 16], "JFIF\0", [1, 1, 0, 0, 1, 0, 1, 0, 0]);
const canvasJpeg = (): Bytes => concat([0xff, 0xd8], JFIF, THUMBNAIL_JPEG.subarray(2));

/** What a canvas hands back in Safari: the same, with the size as EXIF. */
const safariJpeg = (): Bytes =>
  jpegWithExif(
    tiff({
      ifd0: [{ tag: 0x0112, type: SHORT, value: [1] }],
      exif: [
        { tag: 0xa002, type: LONG, value: [3024] },
        { tag: 0xa003, type: LONG, value: [4032] },
      ],
    })
  );

const keys = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

/** Every field a second read with everything on finds in the output. */
async function reread(bytes: Uint8Array): Promise<MetadataField[]> {
  const file = new File([bytes as Uint8Array<ArrayBuffer>], "out.jpg", { type: "image/jpeg" });
  const r = await processFile(file, ALL_ON);
  expect(r.error).toBeUndefined();
  return r.report.fieldsFound;
}

const contains = (haystack: Uint8Array, needle: Uint8Array) =>
  Buffer.from(haystack).indexOf(Buffer.from(needle)) >= 0;

describe("finishJpeg", () => {
  it("leaves nothing when every category goes, not even what the encoder wrote", async () => {
    const out = finishJpeg(safariJpeg(), phoneExif(), ALL_ON, 3024, 4032);
    expect(await reread(out.bytes)).toEqual([]);
    expect(out.kept).toEqual([]);
  });

  it("carries nothing when there's no source EXIF", async () => {
    const out = finishJpeg(safariJpeg(), null, ALL_OFF, 3024, 4032);
    expect(await reread(out.bytes)).toEqual([]);
  });

  // exifTiff holds every category EXIF can (gps, device, dates, author,
  // software, copyright, custom); AI and comments it doesn't.
  it.each(CATEGORIES)("keeps %s, and only it, when only it is switched off", async (category) => {
    const out = finishJpeg(canvasJpeg(), exifTiff(), { ...ALL_ON, [category]: false }, 10, 10);
    const found = await reread(out.bytes);
    expect(found.every((f) => f.category === category)).toBe(true);
    expect(found.length > 0).toBe(!["ai", "comments"].includes(category));
    expect(keys(out.kept)).toEqual(keys(found));
  });

  it("keeps every field when every category is switched off", async () => {
    const out = finishJpeg(canvasJpeg(), exifTiff(), ALL_OFF, 10, 10);
    const found = await reread(out.bytes);
    expect(found.length).toBe(14);
    expect(keys(out.kept)).toEqual(keys(found));
  });

  it("turns the photo upright and leaves the old thumbnail behind", async () => {
    const out = finishJpeg(canvasJpeg(), phoneExif(), { ...ALL_ON, device: false }, 3024, 4032);
    const r = new Reader(jpegExif(out.bytes)!);
    const ifd0 = r.ifd("0th", r.u32(4));
    const orientation = ifd0.entries.find((e) => e.tag === 0x0112);
    // Orientation 1 is the default, so it isn't kept at all.
    expect(orientation === undefined || r.u16(orientation.valueAt) === 1).toBe(true);
    expect(r.u32(r.nextAt(ifd0))).toBe(0);
    expect(contains(out.bytes, THUMBNAIL_JPEG)).toBe(false);
    expect(contains(out.bytes, new TextEncoder().encode(MAKER_NOTE_SERIAL))).toBe(true);
  });

  it("carries nothing from EXIF it can't walk", async () => {
    const out = finishJpeg(canvasJpeg(), unwalkableExif(), ALL_OFF, 10, 10);
    expect(await reread(out.bytes)).toEqual([]);
    expect(out.kept).toEqual([]);
  });

  it("carries nothing when the kept EXIF won't fit in a JPEG segment", async () => {
    const out = finishJpeg(canvasJpeg(), largeExif(), { ...ALL_ON, device: false }, 10, 10);
    expect(await reread(out.bytes)).toEqual([]);
  });
});

describe("uprightExif", () => {
  it("writes the converted size and orientation 1, and drops IFD1", () => {
    const source = tiff({
      littleEndian: true,
      ifd0: [{ tag: 0x0112, type: SHORT, value: [6] }],
      exif: [
        { tag: 0xa002, type: LONG, value: [4032] },
        { tag: 0xa003, type: SHORT, value: [3024] },
      ],
      ifd1: [{ tag: 0x0103, type: SHORT, value: [6] }],
      thumbnail: THUMBNAIL_JPEG,
    });
    const before = source.slice();
    const out = uprightExif(source, 3024, 4032)!;
    expect(source).toEqual(before); // works on a copy
    const r = new Reader(out);
    const ifd0 = r.ifd("0th", r.u32(4));
    const tag = (entries: { tag: number; valueAt: number; type: number }[], t: number) => {
      const e = entries.find((x) => x.tag === t)!;
      return e.type === 3 ? r.u16(e.valueAt) : r.u32(e.valueAt);
    };
    expect(tag(ifd0.entries, 0x0112)).toBe(1);
    const exif = r.ifd("Exif", tag(ifd0.entries, 0x8769));
    expect([tag(exif.entries, 0xa002), tag(exif.entries, 0xa003)]).toEqual([3024, 4032]);
    expect(r.u32(r.nextAt(ifd0))).toBe(0);
    expect(contains(out, THUMBNAIL_JPEG)).toBe(false);
  });

  it("gives null for EXIF it can't walk", () => {
    expect(uprightExif(unwalkableExif(), 1, 1)).toBeNull();
  });
});

describe("sourceExif", () => {
  it.each([
    ["heic", heicWithExif(exifTiff())],
    ["jpeg", jpegWithExif(exifTiff())],
    ["png", pngWithExif(exifTiff())],
    ["webp", webpWithExif(exifTiff())],
  ] as const)("finds the EXIF in a %s", (format, bytes) => {
    expect(sourceExif(bytes, format)).toEqual(exifTiff());
  });

  it("finds none where there is none", () => {
    expect(sourceExif(canvasJpeg(), "jpeg")).toBeNull();
    expect(sourceExif(new Uint8Array(16), "heic")).toBeNull();
    expect(sourceExif(canvasJpeg(), "gif")).toBeNull();
  });
});

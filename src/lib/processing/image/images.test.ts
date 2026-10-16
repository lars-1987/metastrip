/** Behaviour tests for the image processors: JPEG, PNG, WebP, GIF, HEIC and
 *  AVIF, driven through processFile as the app drives them. They began as
 *  characterisation tests pinning the old behaviour; where the processor
 *  contract changed it, a comment says what it used to do. */

import { describe, expect, it } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "../types";
import {
  avifWithMetadata,
  gifWithMetadata,
  gifWithUnknownBlock,
  heicWithMetadata,
  jpegWithMetadata,
  pngWithBadChunkLength,
  pngWithMetadata,
  webpWithBadChunkSize,
  webpWithMetadata,
  concat,
  type Bytes,
} from "./image-files.fixture";
import { expectFoundIgnoresOptions } from "../contract-checks.fixture";

const ALL_ON: StripOptions = {
  gps: true,
  device: true,
  dates: true,
  author: true,
  software: true,
  copyright: true,
  ai: true,
  comments: true,
  custom: true,
};

/** "category:key" per field, sorted, so a list reads the same whatever order
 *  the processor found things in. */
const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

async function strip(bytes: Bytes, name: string, type: string, options: StripOptions = ALL_ON) {
  const file = new File([bytes], name, { type });
  return { file, result: await processFile(file, options) };
}

/** What a second pass with everything on finds in the cleaned output: the
 *  check that what was reported removed is really gone. */
async function reread(result: ProcessingResult, name: string, type: string) {
  const again = await processFile(new File([result.cleanedBlob], name, { type }), ALL_ON);
  expect(again.error).toBeUndefined();
  return summary(again.report.fieldsFound);
}

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());
const containsAscii = (b: Uint8Array, text: string) => new TextDecoder("latin1").decode(b).includes(text);

const DAMAGED = "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.";

/** The contract's one failure shape: the original file handed back untouched,
 *  a plain message for the person, and a stable reason for telemetry. */
function expectFailed(file: File, result: ProcessingResult, reason: string) {
  expect(result.error).toBe(DAMAGED);
  expect(result.reason).toBe(reason);
  expect(result.cleanedBlob).toBe(file);
  expect(result.report.cleanedFileSize).toBe(file.size);
  expect(result.report.fieldsFound).toEqual([]);
}

describe("JPEG", () => {
  const name = "photo.jpg";
  const type = "image/jpeg";

  it("strips every layer with everything on", async () => {
    const { result } = await strip(jpegWithMetadata(), name, type);
    expect(result.error).toBeUndefined();
    const all = [
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "author:Artist",
      "comments:COM",
      "copyright:Copyright",
      "custom:IPTC",
      "custom:ImageDescription",
      "custom:XMP",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ];
    expect(summary(result.report.fieldsFound)).toEqual(all);
    expect(summary(result.report.fieldsRemoved)).toEqual(all);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the author when that toggle is off", async () => {
    const { result } = await strip(jpegWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "comments:COM",
      "copyright:Copyright",
      "custom:IPTC",
      "custom:ImageDescription",
      "custom:XMP",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["author:Artist"]);
    expect(await reread(result, name, type)).toEqual(["author:Artist"]);
  });

  it("refuses a file truncated inside its EXIF segment", async () => {
    // Cut just after the camera model, so the EXIF segment's declared length
    // runs past the end of the file. This used to pass as clean, with the
    // camera model still in the "cleaned" file.
    const full = jpegWithMetadata();
    const cut = new TextDecoder("latin1").decode(full).indexOf("Canon EOS R5") + "Canon EOS R5".length;
    const { file, result } = await strip(full.slice(0, cut), name, type);
    expectFailed(file, result, "unreadable: jpeg");
  });
});

describe("PNG", () => {
  const name = "shot.png";
  const type = "image/png";

  it("strips every metadata chunk with everything on", async () => {
    const { result } = await strip(pngWithMetadata(), name, type);
    expect(result.error).toBeUndefined();
    // The eXIf chunk is one "device" field, whatever it holds: its GPS, dates
    // and author tags are never listed on their own.
    const all = [
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "ai:parameters",
      "author:Author",
      "comments:Comment",
      "copyright:Copyright",
      "custom:Title",
      "dates:tIME",
      "device:eXIf",
      "software:Software",
    ];
    expect(summary(result.report.fieldsFound)).toEqual(all);
    expect(summary(result.report.fieldsRemoved)).toEqual(all);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the author when that toggle is off", async () => {
    const { result } = await strip(pngWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "ai:parameters",
      "comments:Comment",
      "copyright:Copyright",
      "custom:Title",
      "dates:tIME",
      "device:eXIf",
      "software:Software",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["author:Author"]);
    expect(await reread(result, name, type)).toEqual(["author:Author"]);
  });

  it("refuses a file with a chunk whose length runs past the end", async () => {
    // This used to drop everything after the bad chunk without a word, image
    // data included, so the "cleaned" PNG had no picture.
    const { file, result } = await strip(pngWithBadChunkLength(), name, type);
    expectFailed(file, result, "unreadable: png");
  });
});

describe("WebP", () => {
  const name = "pic.webp";
  const type = "image/webp";

  it("strips every metadata chunk with everything on", async () => {
    const { result } = await strip(webpWithMetadata(), name, type);
    expect(result.error).toBeUndefined();
    // EXIF is read by string search, so only the make and software show, never
    // its GPS or dates. The XMP's dc:creator (in an rdf:Seq) and dc:rights (in
    // an rdf:Alt) are missed too: the reader only matches a bare text value.
    const all = [
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "custom:XMP",
      "dates:xmp-xmp:CreateDate",
      "device:EXIF",
      "device:exif-make",
      "software:exif-software",
      "software:xmp-xmp:CreatorTool",
    ];
    expect(summary(result.report.fieldsFound)).toEqual(all);
    expect(summary(result.report.fieldsRemoved)).toEqual(all);
    // With the EXIF and XMP chunks gone, VP8X's EXIF and XMP flags are cleared.
    expect((await bytesOf(result.cleanedBlob))[20]).toBe(0x00);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes a chunk whole when software is off but its other fields go", async () => {
    const { result } = await strip(webpWithMetadata(), name, type, { ...ALL_ON, software: false });
    expect(result.error).toBeUndefined();
    // Software shares the EXIF and XMP chunks with fields being removed, so
    // both chunks go and software is reported removed with them. This used to
    // keep both chunks while reporting their other fields removed, and the
    // re-read found every one of them still there.
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
    expect(result.report.fieldsKept).toEqual([]);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("refuses a file with a chunk whose size runs past the end", async () => {
    // This used to drop the image chunk and everything after it without a word.
    const { file, result } = await strip(webpWithBadChunkSize(), name, type);
    expectFailed(file, result, "unreadable: webp");
  });
});

describe("GIF", () => {
  const name = "anim.gif";
  const type = "image/gif";

  it("strips every metadata block with everything on", async () => {
    const { result } = await strip(gifWithMetadata(), name, type);
    expect(result.error).toBeUndefined();
    const all = [
      "author:XMP:dc:creator",
      "comments:GIF:Comment",
      "copyright:XMP:dc:rights",
      "custom:GIF:MSOFFICE9.0",
      "dates:XMP:xmp:CreateDate",
      "device:XMP:tiff:Make",
      "software:XMP:xmp:CreatorTool",
    ];
    expect(summary(result.report.fieldsFound)).toEqual(all);
    expect(summary(result.report.fieldsRemoved)).toEqual(all);
    // The loop count is not metadata and must survive.
    expect(containsAscii(await bytesOf(result.cleanedBlob), "NETSCAPE2.0")).toBe(true);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("removes the author anyway when that toggle is off", async () => {
    const { result } = await strip(gifWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    // Quirk the contract should change: the XMP block goes whole when any of
    // its categories is stripped, so the creator the user asked to keep is
    // removed, and reported as removed rather than kept.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "author:XMP:dc:creator",
      "comments:GIF:Comment",
      "copyright:XMP:dc:rights",
      "custom:GIF:MSOFFICE9.0",
      "dates:XMP:xmp:CreateDate",
      "device:XMP:tiff:Make",
      "software:XMP:xmp:CreatorTool",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual([]);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("refuses a file with a block it can't recognise", async () => {
    const { file, result } = await strip(gifWithUnknownBlock(), name, type);
    expectFailed(file, result, "unreadable: gif");
  });

  it("strips a file truncated inside its image data without complaint", async () => {
    // The last frame's data and the trailer are cut off. The walker runs out
    // of bytes rather than hitting a bad marker, so this reads as a whole GIF.
    const full = gifWithMetadata();
    const { file, result } = await strip(full.slice(0, full.length - 4), name, type);
    expect(result.error).toBeUndefined();
    expect(result.report.fieldsRemoved).toHaveLength(7);
    expect(result.cleanedBlob.size).toBe(58);
    expect(result.cleanedBlob === file).toBe(false);
  });
});

describe("HEIC", () => {
  const name = "IMG_0001.HEIC";
  const type = "image/heic";

  it("strips the Exif and XMP items and the C2PA box with everything on", async () => {
    const input = heicWithMetadata();
    const { result } = await strip(input, name, type);
    expect(result.error).toBeUndefined();
    expect(summary(result.report.fieldsFound)).toEqual([
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "author:Artist",
      "author:xmp:creator",
      "copyright:Copyright",
      "copyright:xmp:rights",
      "custom:ImageDescription",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "dates:xmp:dates",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "device:xmp:device",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ]);
    // Every field goes, the C2PA box's included. Only its first field used to
    // be reported removed, leaving the rest neither removed nor kept.
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
    expect(summary(result.report.fieldsKept)).toEqual([]);
    // Items are zeroed in place so the iloc offsets stay valid: same size.
    expect(result.cleanedBlob.size).toBe(input.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the EXIF author when that toggle is off, but not the XMP one", async () => {
    const { result } = await strip(heicWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    // The XMP item can only go whole, and its other categories are being
    // removed, so its creator goes too and is reported removed. EXIF is
    // rewritten per tag, so its Artist stays.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "author:xmp:creator",
      "copyright:Copyright",
      "copyright:xmp:rights",
      "custom:ImageDescription",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "dates:xmp:dates",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "device:xmp:device",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["author:Artist"]);
    expect(await reread(result, name, type)).toEqual(["author:Artist"]);
  });

  it("refuses a file whose meta box is cut off", async () => {
    // 100 bytes ends inside the meta box, so its declared size runs past EOF.
    const { file, result } = await strip(heicWithMetadata().slice(0, 100), name, type);
    expectFailed(file, result, "unreadable: heic");
  });

  it("reports a crash when iloc claims more items than it holds", async () => {
    // item_count sits after the iloc header (8), version and flags (4) and the
    // two size bytes; 0xFFFF sends the reader past the end of the file.
    const input = heicWithMetadata();
    const iloc = new TextDecoder("latin1").decode(input).indexOf("iloc");
    input.set([0xff, 0xff], iloc + 4 + 4 + 2);
    const { file, result } = await strip(input, name, type);
    // A parser bug rather than a check: the coordinator's guard catches the
    // RangeError, where the processor used to catch its own.
    expectFailed(file, result, "crash: RangeError");
  });
});

describe("AVIF", () => {
  const name = "pic.avif";
  const type = "image/avif";

  it("strips the Exif item and the idat XMP item with everything on", async () => {
    const input = avifWithMetadata();
    const { result } = await strip(input, name, type);
    expect(result.error).toBeUndefined();
    const all = [
      "ai:xmp:ai",
      "author:Artist",
      "author:xmp:creator",
      "copyright:Copyright",
      "custom:ImageDescription",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ];
    expect(summary(result.report.fieldsFound)).toEqual(all);
    expect(summary(result.report.fieldsRemoved)).toEqual(all);
    expect(result.cleanedBlob.size).toBe(input.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the EXIF author when that toggle is off, but not the XMP one", async () => {
    const { result } = await strip(avifWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    // Same whole-item XMP quirk as HEIC: xmp:creator is removed and reported
    // removed with author off.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:xmp:ai",
      "author:xmp:creator",
      "copyright:Copyright",
      "custom:ImageDescription",
      "dates:DateTime",
      "dates:DateTimeOriginal",
      "device:LensModel",
      "device:Make",
      "device:Model",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
      "gps:GPSVersionID",
      "software:Software",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual(["author:Artist"]);
    expect(await reread(result, name, type)).toEqual(["author:Artist"]);
  });

  it("refuses a file whose meta box is cut off", async () => {
    const { file, result } = await strip(avifWithMetadata().slice(0, 100), name, type);
    expectFailed(file, result, "unreadable: avif");
  });
});

describe("PNG data after the end of the image", () => {
  const name = "shot.png";
  const type = "image/png";
  // Stands in for the uncropped original a buggy screenshot tool left after
  // IEND (aCropalypse, 2023).
  const withTrailer = () => concat(pngWithMetadata(), [0xde, 0xad, 0xbe, 0xef, 0x00, 0x01]);

  it("is reported and removed with Custom", async () => {
    const { result } = await strip(withTrailer(), name, type);
    expect(summary(result.report.fieldsRemoved)).toContain("custom:PNG:trailing-data");
    expect(result.cleanedBlob.size).toBe((await strip(pngWithMetadata(), name, type)).result.cleanedBlob.size);
  });

  it("stays when Custom is kept", async () => {
    const input = withTrailer();
    const { result } = await strip(input, name, type, { ...ALL_ON, custom: false });
    expect(summary(result.report.fieldsKept)).toContain("custom:PNG:trailing-data");
    const out = await bytesOf(result.cleanedBlob);
    expect([...out.subarray(out.length - 6)]).toEqual([0xde, 0xad, 0xbe, 0xef, 0x00, 0x01]);
  });
});

describe("every image format", () => {
  it.each([
    ["JPEG", () => new File([jpegWithMetadata()], "photo.jpg", { type: "image/jpeg" })],
    ["PNG", () => new File([pngWithMetadata()], "shot.png", { type: "image/png" })],
    ["WebP", () => new File([webpWithMetadata()], "pic.webp", { type: "image/webp" })],
    ["GIF", () => new File([gifWithMetadata()], "anim.gif", { type: "image/gif" })],
    ["HEIC", () => new File([heicWithMetadata()], "IMG_0001.HEIC", { type: "image/heic" })],
    ["AVIF", () => new File([avifWithMetadata()], "pic.avif", { type: "image/avif" })],
  ])("%s finds the same fields whatever the options", async (_, make) => {
    await expectFoundIgnoresOptions(make);
  });
});

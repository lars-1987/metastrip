/** Characterisation tests for the image processors: JPEG, PNG, WebP, GIF,
 *  HEIC and AVIF, driven through processFile as the app drives them.
 *
 *  These pin what each processor does today, quirks and bugs included, so the
 *  move onto a shared processor contract shows every behaviour change as a
 *  failing, reviewed line. A comment marks each pinned value the contract is
 *  expected to change. */

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
  type Bytes,
} from "./image-files.fixture";

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

  it("passes a file truncated inside its EXIF segment through as clean", async () => {
    // Cut just after the camera model, so the EXIF segment's declared length
    // runs past the end of the file.
    const full = jpegWithMetadata();
    const cut = new TextDecoder("latin1").decode(full).indexOf("Canon EOS R5") + "Canon EOS R5".length;
    const { file, result } = await strip(full.slice(0, cut), name, type);
    // Quirk the contract should change: no error, nothing found, and the
    // "cleaned" output is the same bytes with the camera model still in them.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(result.report.fieldsFound).toEqual([]);
    expect(result.cleanedBlob.size).toBe(cut);
    expect(result.cleanedBlob === file).toBe(false);
    expect(containsAscii(await bytesOf(result.cleanedBlob), "Canon EOS R5")).toBe(true);
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

  it("drops everything after a chunk whose length runs past the end", async () => {
    const { file, result } = await strip(pngWithBadChunkLength(), name, type);
    // Quirk the contract should change: no error, and the output is only the
    // signature and IHDR (8 + 25 bytes). The image data (IDAT) and IEND after
    // the bad chunk are silently gone, so the "cleaned" PNG has no picture.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(result.report.fieldsFound).toEqual([]);
    expect(result.cleanedBlob.size).toBe(33);
    expect(result.cleanedBlob === file).toBe(false);
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

  it("keeps software when that toggle is off", async () => {
    const { result } = await strip(webpWithMetadata(), name, type, { ...ALL_ON, software: false });
    expect(result.error).toBeUndefined();
    // Bug the contract should fix: a chunk stays whole when any one of its
    // fields is kept. Software is in both the EXIF and the XMP chunk, so both
    // survive, yet their device, dates and custom fields are reported removed.
    // The re-read below finds every one of them still in the file.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
      "ai:C2PA:actions",
      "ai:C2PA:generator",
      "ai:C2PA:model",
      "ai:C2PA:source",
      "custom:XMP",
      "dates:xmp-xmp:CreateDate",
      "device:EXIF",
      "device:exif-make",
    ]);
    expect(summary(result.report.fieldsKept)).toEqual([
      "software:exif-software",
      "software:xmp-xmp:CreatorTool",
    ]);
    expect(await reread(result, name, type)).toEqual([
      "custom:XMP",
      "dates:xmp-xmp:CreateDate",
      "device:EXIF",
      "device:exif-make",
      "software:exif-software",
      "software:xmp-xmp:CreatorTool",
    ]);
  });

  it("drops everything after a chunk whose size runs past the end", async () => {
    const { file, result } = await strip(webpWithBadChunkSize(), name, type);
    // Quirk the contract should change: no error, and the output is only the
    // RIFF header and VP8X (12 + 18 bytes). The image chunk and everything
    // after it are silently gone.
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
    expect(result.report.fieldsFound).toEqual([]);
    expect(result.cleanedBlob.size).toBe(30);
    expect(result.cleanedBlob === file).toBe(false);
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

  it("returns the original file with an error when a block is unrecognisable", async () => {
    const { file, result } = await strip(gifWithUnknownBlock(), name, type);
    expect(result.error).toBe("Could not read this GIF's block structure");
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob.size).toBe(file.size);
    expect(result.cleanedBlob === file).toBe(true);
  });

  it("strips a file truncated inside its image data without complaint", async () => {
    // The last frame's data and the trailer are cut off. The walker runs out
    // of bytes rather than hitting a bad marker, so this reads as a whole GIF.
    const full = gifWithMetadata();
    const { file, result } = await strip(full.slice(0, full.length - 4), name, type);
    expect(result.error).toBeUndefined();
    expect(result.crashed).toBeUndefined();
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
    // Bug the contract should fix: only the first field of each C2PA box is
    // reported removed (fieldsRemoved.push(c2paFields[i]) indexes by box, not
    // by field). Its generator, model, source and actions fields are found but
    // end up neither removed nor kept, although the whole box is wiped.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
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
    expect(summary(result.report.fieldsKept)).toEqual([]);
    // Items are zeroed in place so the iloc offsets stay valid: same size.
    expect(result.cleanedBlob.size).toBe(input.length);
    expect(await reread(result, name, type)).toEqual([]);
  });

  it("keeps the EXIF author when that toggle is off, but not the XMP one", async () => {
    const { result } = await strip(heicWithMetadata(), name, type, { ...ALL_ON, author: false });
    expect(result.error).toBeUndefined();
    // Quirk the contract should change: the XMP item is zeroed whole when any
    // of its categories is stripped, so its creator goes too, and is reported
    // removed. The C2PA box shows the same first-field-only reporting as above.
    expect(summary(result.report.fieldsRemoved)).toEqual([
      "ai:C2PA",
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

  it("returns a copy of the file with an error when the meta box is cut off", async () => {
    // 100 bytes ends inside the meta box, so its declared size runs past EOF.
    const { file, result } = await strip(heicWithMetadata().slice(0, 100), name, type);
    expect(result.error).toBe(DAMAGED);
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob.size).toBe(100);
    // A new Blob of the same bytes, where GIF and the coordinator hand back
    // the File itself.
    expect(result.cleanedBlob === file).toBe(false);
  });

  it("reports a crash of its own when iloc claims more items than it holds", async () => {
    // item_count sits after the iloc header (8), version and flags (4) and the
    // two size bytes; 0xFFFF sends the reader past the end of the file.
    const input = heicWithMetadata();
    const iloc = new TextDecoder("latin1").decode(input).indexOf("iloc");
    input.set([0xff, 0xff], iloc + 4 + 4 + 2);
    const { file, result } = await strip(input, name, type);
    // The processor catches its own RangeError and sets `crashed`, which the
    // coordinator's guard otherwise does for parsers that throw.
    expect(result.error).toBe(DAMAGED);
    expect(result.crashed).toBe("RangeError");
    expect(result.cleanedBlob.size).toBe(input.length);
    expect(result.cleanedBlob === file).toBe(false);
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

  it("returns a copy of the file with an error when the meta box is cut off", async () => {
    const { file, result } = await strip(avifWithMetadata().slice(0, 100), name, type);
    expect(result.error).toBe(DAMAGED);
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob.size).toBe(100);
    expect(result.cleanedBlob === file).toBe(false);
  });
});

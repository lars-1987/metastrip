/** How each image container reads and strips EXIF today, pinned before the
 *  EXIF reader is rewritten. JPEG and HEIC read it with piexif; PNG and WebP
 *  treat it as one opaque block. "To change" notes the agreed new behaviour;
 *  "BUG" marks metadata that is left in the file without being reported. */

import { describe, expect, it } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "../types";
import { extractGpsCoordinates } from "../../gps";
import { ALL_ON } from "../contract-checks.fixture";
import { heicWithExif, jpegWithExif, pngWithExif, webpWithExif, type Bytes } from "./image-files.fixture";
import { MAKER_NOTE_SERIAL, THUMBNAIL_JPEG, largeExif, phoneExif, unwalkableExif } from "./exif.fixture";

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();
const latin1 = (b: Uint8Array) => new TextDecoder("latin1").decode(b);

async function strip(bytes: Bytes, name: string, type: string, options: StripOptions = ALL_ON) {
  const file = new File([bytes], name, { type });
  const result = await processFile(file, options);
  const out = latin1(new Uint8Array(await result.cleanedBlob.arrayBuffer()));
  return { file, result, out };
}

async function reread(result: ProcessingResult, name: string, type: string) {
  const again = await processFile(new File([result.cleanedBlob], name, { type }), ALL_ON);
  expect(again.error).toBeUndefined();
  return again.report.fieldsFound;
}

const JPEG = { name: "photo.jpg", type: "image/jpeg", make: (t: Uint8Array) => jpegWithExif(t) };
const HEIC = { name: "IMG_0001.HEIC", type: "image/heic", make: heicWithExif };
const PNG = { name: "shot.png", type: "image/png", make: pngWithExif };
const WEBP = { name: "pic.webp", type: "image/webp", make: webpWithExif };

const MELBOURNE = { lat: -37.8136, lng: 144.9631 };
function expectMelbourne(fields: MetadataField[]) {
  const at = extractGpsCoordinates(fields);
  expect(at?.lat).toBeCloseTo(MELBOURNE.lat, 4);
  expect(at?.lng).toBeCloseTo(MELBOURNE.lng, 4);
}

/** Every field of the phone EXIF as JPEG and HEIC list it: [category, key,
 *  label, value]. The new reader must produce these, apart from the entries
 *  marked "to change". */
const PHONE_FIELDS = [
  ["device", "Make", "Make", "Apple"],
  ["device", "Model", "Model", "iPhone 15 Pro"],
  // To change: display information, never listed or removed.
  ["custom", "Orientation", "Orientation", "6"],
  // Display quirk: a single rational shows as "72, 1"; a list shows "a/b".
  ["custom", "XResolution", "X Resolution", "72, 1"],
  ["software", "Software", "Software", "17.5"],
  ["dates", "DateTime", "Date Time", "2026:07:01 12:00:00"],
  // Display quirk: the UTF-16 bytes, not the name "Jane".
  ["author", "XPAuthor", "XP Author", "74, 0, 97, 0, 110, 0, 101, 0, 0, 0"],
  ["custom", "FNumber", "F Number", "178, 100"],
  ["custom", "ISOSpeedRatings", "ISO Speed Ratings", "100"],
  ["dates", "DateTimeOriginal", "Date Time Original", "2026:07:01 12:00:00"],
  // To change: Device, since maker notes hold serial numbers.
  ["custom", "MakerNote", "Maker Note", `Apple iOS\0${MAKER_NOTE_SERIAL}`],
  ["device", "LensModel", "Lens Model", "iPhone 15 Pro back camera"],
  ["gps", "GPSVersionID", "GPS Version ID", "2, 2, 0, 0"],
  ["gps", "GPSLatitudeRef", "GPS Latitude Ref", "S"],
  ["gps", "GPSLatitude", "GPS Latitude", "37/1, 48/1, 4896/100"],
  ["gps", "GPSLongitudeRef", "GPS Longitude Ref", "E"],
  ["gps", "GPSLongitude", "GPS Longitude", "144/1, 57/1, 4716/100"],
  ["gps", "GPSAltitudeRef", "GPS Altitude Ref", "0"],
  ["gps", "GPSAltitude", "GPS Altitude", "12, 1"],
  ["custom", "Compression", "Compression", "6"],
  // The thumbnail's offset and length: file structure, listed as fields.
  ["custom", "JPEGInterchangeFormat", "JPEG Interchange Format", "516"],
  ["custom", "JPEGInterchangeFormatLength", "JPEG Interchange Format Length", "30"],
  ["custom", "Thumbnail", "Embedded thumbnail", "a small copy of the photo (0.0 KB)"],
];

const GPS_KEYS = PHONE_FIELDS.filter(([c]) => c === "gps").map(([c, k]) => `${c}:${k}`).sort();

describe.each([
  ["JPEG", JPEG],
  ["HEIC", HEIC],
])("%s EXIF, read tag by tag", (_, fmt) => {
  it("lists every tag with its label and value", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(result.error).toBeUndefined();
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual(PHONE_FIELDS);
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
  });

  it("puts the GPS fix on the map", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expectMelbourne(result.report.fieldsFound);
  });

  it("removes Orientation with everything else", async () => {
    // To change: Orientation is display information. Today a full strip takes
    // it, so a portrait photo stored sideways comes out sideways.
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(summary(result.report.fieldsRemoved)).toContain("custom:Orientation");
    expect(out).not.toContain("iPhone");
    expect(await reread(result, fmt.name, fmt.type)).toEqual([]);
  });

  it("keeps every GPS tag, and the map, when GPS is kept", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, gps: false });
    expect(summary(result.report.fieldsKept)).toEqual(GPS_KEYS);
    const again = await reread(result, fmt.name, fmt.type);
    expect(summary(again)).toEqual(GPS_KEYS);
    expectMelbourne(again);
  });

  it("keeps the maker note and thumbnail with Custom", async () => {
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, custom: false });
    expect(summary(result.report.fieldsKept)).toEqual([
      "custom:Compression",
      "custom:FNumber",
      "custom:ISOSpeedRatings",
      "custom:JPEGInterchangeFormat",
      "custom:JPEGInterchangeFormatLength",
      "custom:MakerNote",
      "custom:Orientation",
      "custom:Thumbnail",
      "custom:XResolution",
    ]);
    expect(out).toContain(latin1(THUMBNAIL_JPEG));
    // To change: the maker note moves to Device. Today Device is removed and
    // the camera's serial number stays, inside the maker note.
    expect(out).toContain(MAKER_NOTE_SERIAL);
    expect(out).not.toContain("iPhone");
  });
});

describe.each([
  ["PNG", PNG, ["device:eXIf"]],
  ["WebP", WEBP, ["device:EXIF", "device:exif-make"]],
])("%s EXIF, read as one block", (_, fmt, fields) => {
  it("lists the block, not its tags, so the GPS never reaches the map", async () => {
    // To change: the same tag-by-tag fields as JPEG, and the map.
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(summary(result.report.fieldsFound)).toEqual(fields);
    expect(extractGpsCoordinates(result.report.fieldsFound)).toBeNull();
  });

  it("removes the whole block, GPS included, when GPS is kept", async () => {
    // To change: strip tag by tag, so kept GPS stays.
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, gps: false });
    expect(result.report.fieldsKept).toEqual([]);
    expect(out).not.toContain("iPhone");
    expect(out).not.toContain("Exif"); // nor the block at all
  });
});

describe("EXIF whose first IFD points past the end of the block", () => {
  it("JPEG: is not reported, and a file with nothing else comes back untouched", async () => {
    // BUG: piexif can't walk it, so no fields are found. With nothing found,
    // nothing is removed, and the coordinator hands back the original bytes
    // with the make and model still in it.
    const { file, result, out } = await strip(JPEG.make(unwalkableExif()), JPEG.name, JPEG.type);
    expect(result.error).toBeUndefined();
    expect(result.report.fieldsFound).toEqual([]);
    expect(result.cleanedBlob.size).toBe(file.size);
    expect(out).toContain("iPhone 15 Pro");
  });

  it("JPEG: stays in the file on a partial strip", async () => {
    // BUG: the XMP beside it is found and removed; the EXIF is neither
    // reported nor removed.
    const input = jpegWithExif(unwalkableExif(), { xmp: true });
    const { result, out } = await strip(input, JPEG.name, JPEG.type, { ...ALL_ON, author: false });
    expect(summary(result.report.fieldsFound)).toEqual(["custom:XMP"]);
    expect(out).toContain("iPhone 15 Pro");
  });

  it("HEIC: is one Custom field, kept with Custom while Device is removed", async () => {
    const { result } = await strip(HEIC.make(unwalkableExif()), HEIC.name, HEIC.type);
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual([
      ["custom", "EXIF", "EXIF metadata", "58 bytes"],
    ]);
    // To change: the block goes when any category EXIF can hold is removed.
    const kept = await strip(HEIC.make(unwalkableExif()), HEIC.name, HEIC.type, { ...ALL_ON, custom: false });
    expect(summary(kept.result.report.fieldsKept)).toEqual(["custom:EXIF"]);
    expect(kept.out).toContain("iPhone 15 Pro");
  });

  it.each([
    ["PNG", PNG, ["device:eXIf"]],
    ["WebP", WEBP, ["device:EXIF", "device:exif-make"]],
  ])("%s: goes whole like any other block", async (_, fmt, fields) => {
    const { result, out } = await strip(fmt.make(unwalkableExif()), fmt.name, fmt.type);
    expect(summary(result.report.fieldsRemoved)).toEqual(fields);
    expect(out).not.toContain("iPhone");
  });
});

describe("HEIC EXIF over 64 KB", () => {
  it("is one Custom field, and its GPS is kept with Custom", async () => {
    // piexif reads EXIF from a JPEG segment, which can't exceed 64 KB, so a
    // bigger HEIF Exif item falls back to one field.
    const { result } = await strip(HEIC.make(largeExif()), HEIC.name, HEIC.type);
    expect(summary(result.report.fieldsFound)).toEqual(["custom:EXIF"]);
    expect(extractGpsCoordinates(result.report.fieldsFound)).toBeNull();
    // BUG: keeping Custom keeps the GPS fix the person asked to remove.
    const kept = await strip(HEIC.make(largeExif()), HEIC.name, HEIC.type, { ...ALL_ON, custom: false });
    expect(summary(kept.result.report.fieldsKept)).toEqual(["custom:EXIF"]);
    expect(kept.out).toContain("Apple");
  });
});

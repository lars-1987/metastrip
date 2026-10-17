/** How each image container reads and strips EXIF. JPEG uses the EXIF reader
 *  (exif.ts); HEIC still reads it with piexif, and PNG and WebP treat it as
 *  one opaque block, until they move onto the reader too. "To change" notes
 *  the agreed new behaviour; "BUG" marks metadata left in the file without
 *  being reported. */

import { describe, expect, it } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "../types";
import { extractGpsCoordinates } from "../../gps";
import { ALL_ON } from "../contract-checks.fixture";
import { heicWithExif, jpegWithExif, pngWithExif, webpWithExif, type Bytes } from "./image-files.fixture";
import { ASCII, MAKER_NOTE_SERIAL, SHORT, THUMBNAIL_JPEG, largeExif, phoneExif, tiff, unwalkableExif } from "./exif.fixture";

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

/** Every field of the phone EXIF as the EXIF reader lists it: [category,
 *  key, label, value]. Orientation is display information, so it isn't one;
 *  nor are the pointers to the other IFDs and the thumbnail. */
const PHONE_FIELDS = [
  ["device", "Make", "Make", "Apple"],
  ["device", "Model", "Model", "iPhone 15 Pro"],
  ["custom", "XResolution", "X Resolution", "72/1"], // was "72, 1"
  ["software", "Software", "Software", "17.5"],
  ["dates", "DateTime", "Date Time", "2026:07:01 12:00:00"],
  ["author", "XPAuthor", "XP Author", "Jane"], // was its UTF-16 bytes
  ["custom", "FNumber", "F Number", "178/100"], // was "178, 100"
  ["custom", "ISOSpeedRatings", "ISO Speed Ratings", "100"],
  ["dates", "DateTimeOriginal", "Date Time Original", "2026:07:01 12:00:00"],
  // Device, since maker notes hold serial numbers. It was Custom.
  ["device", "MakerNote", "Maker Note", `Apple iOS\0${MAKER_NOTE_SERIAL}`],
  ["device", "LensModel", "Lens Model", "iPhone 15 Pro back camera"],
  ["gps", "GPSVersionID", "GPS Version ID", "2, 2, 0, 0"],
  ["gps", "GPSLatitudeRef", "GPS Latitude Ref", "S"],
  ["gps", "GPSLatitude", "GPS Latitude", "37/1, 48/1, 4896/100"],
  ["gps", "GPSLongitudeRef", "GPS Longitude Ref", "E"],
  ["gps", "GPSLongitude", "GPS Longitude", "144/1, 57/1, 4716/100"],
  ["gps", "GPSAltitudeRef", "GPS Altitude Ref", "0"],
  ["gps", "GPSAltitude", "GPS Altitude", "12/1"], // was "12, 1"
  ["custom", "Compression", "Compression", "6"],
  ["custom", "Thumbnail", "Embedded thumbnail", "a small copy of the photo (0.0 KB)"],
];

/** The same EXIF as HEIC lists it through piexif, until it moves onto the
 *  reader: Orientation and the thumbnail's pointers are fields, a single
 *  rational shows as "72, 1", and XPAuthor as its bytes. */
const PIEXIF_PHONE_FIELDS = [
  ["device", "Make", "Make", "Apple"],
  ["device", "Model", "Model", "iPhone 15 Pro"],
  ["custom", "Orientation", "Orientation", "6"],
  ["custom", "XResolution", "X Resolution", "72, 1"],
  ["software", "Software", "Software", "17.5"],
  ["dates", "DateTime", "Date Time", "2026:07:01 12:00:00"],
  ["author", "XPAuthor", "XP Author", "74, 0, 97, 0, 110, 0, 101, 0, 0, 0"],
  ["custom", "FNumber", "F Number", "178, 100"],
  ["custom", "ISOSpeedRatings", "ISO Speed Ratings", "100"],
  ["dates", "DateTimeOriginal", "Date Time Original", "2026:07:01 12:00:00"],
  ["device", "MakerNote", "Maker Note", `Apple iOS\0${MAKER_NOTE_SERIAL}`],
  ["device", "LensModel", "Lens Model", "iPhone 15 Pro back camera"],
  ["gps", "GPSVersionID", "GPS Version ID", "2, 2, 0, 0"],
  ["gps", "GPSLatitudeRef", "GPS Latitude Ref", "S"],
  ["gps", "GPSLatitude", "GPS Latitude", "37/1, 48/1, 4896/100"],
  ["gps", "GPSLongitudeRef", "GPS Longitude Ref", "E"],
  ["gps", "GPSLongitude", "GPS Longitude", "144/1, 57/1, 4716/100"],
  ["gps", "GPSAltitudeRef", "GPS Altitude Ref", "0"],
  ["gps", "GPSAltitude", "GPS Altitude", "12, 1"],
  ["custom", "Compression", "Compression", "6"],
  ["custom", "JPEGInterchangeFormat", "JPEG Interchange Format", "516"],
  ["custom", "JPEGInterchangeFormatLength", "JPEG Interchange Format Length", "30"],
  ["custom", "Thumbnail", "Embedded thumbnail", "a small copy of the photo (0.0 KB)"],
];

const GPS_KEYS = PHONE_FIELDS.filter(([c]) => c === "gps").map(([c, k]) => `${c}:${k}`).sort();

describe.each([
  ["JPEG", JPEG, PHONE_FIELDS, ["custom:Compression", "custom:FNumber", "custom:ISOSpeedRatings", "custom:Thumbnail", "custom:XResolution"]],
  [
    "HEIC",
    HEIC,
    PIEXIF_PHONE_FIELDS,
    [
      "custom:Compression",
      "custom:FNumber",
      "custom:ISOSpeedRatings",
      "custom:JPEGInterchangeFormat",
      "custom:JPEGInterchangeFormatLength",
      "custom:Orientation",
      "custom:Thumbnail",
      "custom:XResolution",
    ],
  ],
])("%s EXIF, read tag by tag", (_, fmt, fields, customKept) => {
  it("lists every tag with its label and value", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(result.error).toBeUndefined();
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual(fields);
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
  });

  it("puts the GPS fix on the map", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expectMelbourne(result.report.fieldsFound);
  });

  it("keeps every GPS tag, and the map, when GPS is kept", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, gps: false });
    expect(summary(result.report.fieldsKept)).toEqual(GPS_KEYS);
    const again = await reread(result, fmt.name, fmt.type);
    expect(summary(again)).toEqual(GPS_KEYS);
    expectMelbourne(again);
  });

  it("keeps the thumbnail with Custom, and removes the maker note with Device", async () => {
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, custom: false });
    expect(summary(result.report.fieldsKept)).toEqual(customKept);
    expect(out).toContain(latin1(THUMBNAIL_JPEG));
    // The maker note was Custom, so this used to keep the serial number.
    expect(out).not.toContain(MAKER_NOTE_SERIAL);
    expect(out).not.toContain("iPhone");
  });
});

describe("Orientation", () => {
  /** The orientation the cleaned JPEG's EXIF still carries, or null. */
  const orientationIn = (out: string): number | null => {
    const at = out.indexOf("Exif\0\0");
    if (at < 0) return null;
    const block = Uint8Array.from(out.slice(at + 6), (c) => c.charCodeAt(0));
    const le = block[0] === 0x49;
    const view = new DataView(block.buffer);
    const ifd = view.getUint32(4, le);
    for (let i = 0; i < view.getUint16(ifd, le); i++) {
      const e = ifd + 2 + 12 * i;
      if (view.getUint16(e, le) === 0x0112) return view.getUint16(e + 8, le);
    }
    return null;
  };

  it("JPEG: survives a full strip in a 26-byte block of its own", async () => {
    const { result, out } = await strip(JPEG.make(phoneExif()), JPEG.name, JPEG.type);
    expect(orientationIn(out)).toBe(6);
    // APP1 marker, length, "Exif\0\0", then the 26-byte TIFF.
    expect(out).toContain("\xff\xe1\x00\x22Exif\0\0II");
    expect(out).not.toContain("iPhone");
    expect(await reread(result, JPEG.name, JPEG.type)).toEqual([]);
  });

  it("JPEG: survives a partial strip in place", async () => {
    const { out } = await strip(JPEG.make(phoneExif()), JPEG.name, JPEG.type, { ...ALL_ON, gps: false });
    expect(orientationIn(out)).toBe(6);
  });

  it("JPEG: an upright photo's EXIF goes entirely", async () => {
    const upright = tiff({
      littleEndian: true,
      ifd0: [
        { tag: 0x010f, type: ASCII, value: "Apple" },
        { tag: 0x0112, type: SHORT, value: [1] },
      ],
    });
    const { out } = await strip(JPEG.make(upright), JPEG.name, JPEG.type);
    expect(out).not.toContain("Exif");
  });

  it("HEIC: is removed with everything else", async () => {
    // To change: HEIC moves onto the reader. (HEIC viewers rotate by the
    // irot box, so this matters less here than in a JPEG.)
    const { result } = await strip(HEIC.make(phoneExif()), HEIC.name, HEIC.type);
    expect(summary(result.report.fieldsRemoved)).toContain("custom:Orientation");
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
  it("JPEG: is one field, and goes", async () => {
    // It used to go unreported: with nothing else in the file, nothing was
    // removed, and the original came back with the make and model in it.
    const { result, out } = await strip(JPEG.make(unwalkableExif()), JPEG.name, JPEG.type);
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual([
      ["custom", "EXIF", "EXIF data that couldn't be read", "(58 bytes)"],
    ]);
    expect(summary(result.report.fieldsRemoved)).toEqual(["custom:EXIF"]);
    expect(out).not.toContain("iPhone");
  });

  it("JPEG: goes on a partial strip, even with Custom kept", async () => {
    // We can't tell what's inside, so it goes whenever any category EXIF can
    // hold is being removed. It used to stay, unreported.
    const input = jpegWithExif(unwalkableExif(), { xmp: true });
    const { result, out } = await strip(input, JPEG.name, JPEG.type, { ...ALL_ON, author: false, custom: false });
    expect(summary(result.report.fieldsRemoved)).toEqual(["custom:EXIF"]);
    expect(out).not.toContain("iPhone");
  });

  it("JPEG: stays when only comments are removed", async () => {
    const none = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;
    const { result, out } = await strip(JPEG.make(unwalkableExif()), JPEG.name, JPEG.type, { ...none, comments: true });
    expect(summary(result.report.fieldsKept)).toEqual(["custom:EXIF"]);
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

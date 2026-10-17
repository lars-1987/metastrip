/** How each image container finds its EXIF, hands it to the EXIF reader
 *  (exif.ts) and puts back what comes out: JPEG APP1, HEIF Exif items, PNG
 *  eXIf and WebP EXIF. Every container lists the same fields and strips them
 *  the same way. */

import { describe, expect, it } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataField, ProcessingResult, StripOptions } from "../types";
import { extractGpsCoordinates } from "../../gps";
import { ALL_ON } from "../contract-checks.fixture";
import { heicWithExif, jpegWithExif, pngWithExif, webpWithExif, type Bytes } from "./image-files.fixture";
import { ASCII, MAKER_NOTE_SERIAL, SHORT, THUMBNAIL_JPEG, largeExif, phoneExif, tiff, unwalkableExif } from "./exif.fixture";

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();
const latin1 = (b: Uint8Array) => new TextDecoder("latin1").decode(b);
const NONE = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;

async function strip(bytes: Bytes, name: string, type: string, options: StripOptions = ALL_ON) {
  const file = new File([bytes], name, { type });
  const result = await processFile(file, options);
  expect(result.error).toBeUndefined();
  const out = latin1(new Uint8Array(await result.cleanedBlob.arrayBuffer()));
  return { file, result, out };
}

async function reread(result: ProcessingResult, name: string, type: string) {
  const again = await processFile(new File([result.cleanedBlob], name, { type }), ALL_ON);
  expect(again.error).toBeUndefined();
  return again.report.fieldsFound;
}

const JPEG = { label: "JPEG", name: "photo.jpg", type: "image/jpeg", make: (t: Uint8Array) => jpegWithExif(t) };
const HEIC = { label: "HEIC", name: "IMG_0001.HEIC", type: "image/heic", make: heicWithExif };
const PNG = { label: "PNG", name: "shot.png", type: "image/png", make: pngWithExif };
const WEBP = { label: "WebP", name: "pic.webp", type: "image/webp", make: webpWithExif };
const CONTAINERS = [JPEG, HEIC, PNG, WEBP].map((c) => [c.label, c] as const);

const MELBOURNE = { lat: -37.8136, lng: 144.9631 };
function expectMelbourne(fields: MetadataField[]) {
  const at = extractGpsCoordinates(fields);
  expect(at?.lat).toBeCloseTo(MELBOURNE.lat, 4);
  expect(at?.lng).toBeCloseTo(MELBOURNE.lng, 4);
}

/** Every field of the phone EXIF: [category, key, label, value]. Orientation
 *  is display information, so it isn't one; nor are the pointers to the
 *  other IFDs and the thumbnail. */
const PHONE_FIELDS = [
  ["device", "Make", "Make", "Apple"],
  ["device", "Model", "Model", "iPhone 15 Pro"],
  ["custom", "XResolution", "X Resolution", "72/1"],
  ["software", "Software", "Software", "17.5"],
  ["dates", "DateTime", "Date Time", "2026:07:01 12:00:00"],
  ["author", "XPAuthor", "XP Author", "Jane"],
  ["custom", "FNumber", "F Number", "178/100"],
  ["custom", "ISOSpeedRatings", "ISO Speed Ratings", "100"],
  ["dates", "DateTimeOriginal", "Date Time Original", "2026:07:01 12:00:00"],
  ["device", "MakerNote", "Maker Note", "22 bytes of vendor data"],
  ["device", "LensModel", "Lens Model", "iPhone 15 Pro back camera"],
  ["gps", "GPSVersionID", "GPS Version ID", "2, 2, 0, 0"],
  ["gps", "GPSLatitudeRef", "GPS Latitude Ref", "S"],
  ["gps", "GPSLatitude", "GPS Latitude", "37/1, 48/1, 4896/100"],
  ["gps", "GPSLongitudeRef", "GPS Longitude Ref", "E"],
  ["gps", "GPSLongitude", "GPS Longitude", "144/1, 57/1, 4716/100"],
  ["gps", "GPSAltitudeRef", "GPS Altitude Ref", "0"],
  ["gps", "GPSAltitude", "GPS Altitude", "12/1"],
  ["custom", "Compression", "Compression", "6"],
  ["custom", "Thumbnail", "Embedded thumbnail", "a small copy of the photo (0.0 KB)"],
];

const GPS_KEYS = PHONE_FIELDS.filter(([c]) => c === "gps").map(([c, k]) => `${c}:${k}`).sort();

/** The Orientation 6 entry as a little-endian IFD stores it, and the whole
 *  26-byte block a full strip leaves: header, one entry, no next IFD. */
const ORIENTATION_ENTRY = "\x12\x01\x03\x00\x01\x00\x00\x00\x06\x00\x00\x00";
const ORIENTATION_ONLY = `II*\x00\x08\x00\x00\x00\x01\x00${ORIENTATION_ENTRY}\x00\x00\x00\x00`;

describe.each(CONTAINERS)("%s EXIF", (_, fmt) => {
  it("lists every tag with its label and value", async () => {
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual(PHONE_FIELDS);
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
  });

  it("puts the GPS fix on the map", async () => {
    // PNG and WebP listed one block, so this used to be empty for them.
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expectMelbourne(result.report.fieldsFound);
  });

  it("keeps every GPS tag, and the map, when GPS is kept", async () => {
    // PNG and WebP used to remove the whole block, GPS included.
    const { result } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, gps: false });
    expect(summary(result.report.fieldsKept)).toEqual(GPS_KEYS);
    const again = await reread(result, fmt.name, fmt.type);
    expect(summary(again)).toEqual(GPS_KEYS);
    expectMelbourne(again);
  });

  it("keeps the thumbnail with Custom, and removes the maker note with Device", async () => {
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, custom: false });
    expect(summary(result.report.fieldsKept)).toEqual([
      "custom:Compression",
      "custom:FNumber",
      "custom:ISOSpeedRatings",
      "custom:Thumbnail",
      "custom:XResolution",
    ]);
    expect(out).toContain(latin1(THUMBNAIL_JPEG));
    expect(out).not.toContain(MAKER_NOTE_SERIAL);
    expect(out).not.toContain("iPhone");
  });

  it("keeps Orientation, alone, through a full strip", async () => {
    const { result, out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type);
    expect(out).toContain(ORIENTATION_ONLY);
    expect(out).not.toContain("iPhone");
    expect(await reread(result, fmt.name, fmt.type)).toEqual([]);
  });

  it("keeps Orientation in place through a partial strip", async () => {
    const { out } = await strip(fmt.make(phoneExif()), fmt.name, fmt.type, { ...ALL_ON, gps: false });
    expect(out).toContain(ORIENTATION_ENTRY);
  });

  it("drops an upright photo's EXIF entirely", async () => {
    const upright = tiff({
      littleEndian: true,
      ifd0: [
        { tag: 0x010f, type: ASCII, value: "Apple" },
        { tag: 0x0112, type: SHORT, value: [1] },
      ],
    });
    const { out } = await strip(fmt.make(upright), fmt.name, fmt.type);
    expect(out).not.toContain("II*\x00");
  });

  it("removes EXIF it can't walk as one field", async () => {
    // It used to be left in a JPEG unreported, and was Custom in a HEIC (kept
    // with Custom, Device or not).
    const { result, out } = await strip(fmt.make(unwalkableExif()), fmt.name, fmt.type, { ...ALL_ON, custom: false });
    expect(result.report.fieldsFound.map((f) => [f.category, f.key, f.label, f.value])).toEqual([
      ["custom", "EXIF", "EXIF data that couldn't be read", "(58 bytes)"],
    ]);
    expect(summary(result.report.fieldsRemoved)).toEqual(["custom:EXIF"]);
    expect(out).not.toContain("iPhone");
  });

  it("keeps EXIF it can't walk when only comments are removed", async () => {
    const { result, out } = await strip(fmt.make(unwalkableExif()), fmt.name, fmt.type, { ...NONE, comments: true });
    expect(summary(result.report.fieldsKept)).toEqual(["custom:EXIF"]);
    expect(out).toContain("iPhone 15 Pro");
  });
});

describe("container details", () => {
  it("JPEG: the orientation-only block gets a segment of its own length", async () => {
    const { out } = await strip(JPEG.make(phoneExif()), JPEG.name, JPEG.type);
    // APP1 marker, length 0x22 (2 + 6 + 26), "Exif\0\0", then the block.
    expect(out).toContain(`\xff\xe1\x00\x22Exif\x00\x00${ORIENTATION_ONLY}`);
  });

  it("JPEG: EXIF it can't walk goes beside XMP on a partial strip", async () => {
    const input = jpegWithExif(unwalkableExif(), { xmp: true });
    const { result, out } = await strip(input, JPEG.name, JPEG.type, { ...ALL_ON, author: false, custom: false });
    expect(summary(result.report.fieldsRemoved)).toEqual(["custom:EXIF"]);
    expect(out).not.toContain("iPhone");
  });

  it("HEIC: keeps its size, so the item offsets stay valid", async () => {
    for (const options of [ALL_ON, { ...ALL_ON, gps: false }]) {
      const input = HEIC.make(phoneExif());
      const { result } = await strip(input, HEIC.name, HEIC.type, options);
      expect(result.cleanedBlob.size).toBe(input.length);
    }
  });

  it("HEIC: reads EXIF over 64 KB tag by tag", async () => {
    // piexif read EXIF through a JPEG segment, which can't exceed 64 KB, so
    // this was one Custom field and keeping Custom kept its GPS fix.
    const { result } = await strip(HEIC.make(largeExif()), HEIC.name, HEIC.type, { ...ALL_ON, custom: false });
    expect(summary(result.report.fieldsFound)).toEqual([
      "device:Make",
      "device:MakerNote",
      "gps:GPSLatitude",
      "gps:GPSLatitudeRef",
      "gps:GPSLongitude",
      "gps:GPSLongitudeRef",
    ]);
    expectMelbourne(result.report.fieldsFound);
    expect(result.report.fieldsKept).toEqual([]);
  });

  it("WebP: clears VP8X's EXIF flag only when the chunk goes", async () => {
    const vp8xFlags = (out: string) => out.charCodeAt(20);
    const upright = tiff({ ifd0: [{ tag: 0x010f, type: ASCII, value: "Apple" }] });
    expect(vp8xFlags((await strip(WEBP.make(upright), WEBP.name, WEBP.type)).out) & 0x08).toBe(0);
    // The orientation-only block stays, so the flag does too.
    expect(vp8xFlags((await strip(WEBP.make(phoneExif()), WEBP.name, WEBP.type)).out) & 0x08).toBe(0x08);
  });
});

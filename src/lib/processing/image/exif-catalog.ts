import piexif from "piexifjs";
import type { MetadataField, MetadataCategory } from "../types";
import { aiCategoryFor, aiValueLabel } from "../ai-signatures";

/** Maps EXIF tag names to metadata categories. Shared by the JPEG and HEIC
 *  processors so an EXIF block is classified identically wherever it lives. */
export const TAG_CATEGORIES: Record<string, MetadataCategory> = {
  GPSLatitude: "gps",
  GPSLongitude: "gps",
  GPSAltitude: "gps",
  GPSDateStamp: "gps",
  GPSTimeStamp: "gps",
  GPSLatitudeRef: "gps",
  GPSLongitudeRef: "gps",
  GPSAltitudeRef: "gps",
  GPSSpeed: "gps",
  GPSSpeedRef: "gps",
  GPSImgDirection: "gps",
  GPSImgDirectionRef: "gps",
  GPSDestBearing: "gps",
  GPSDestBearingRef: "gps",
  GPSHPositioningError: "gps",
  Make: "device",
  Model: "device",
  BodySerialNumber: "device",
  LensModel: "device",
  LensMake: "device",
  LensSerialNumber: "device",
  CameraOwnerName: "device",
  HostComputer: "device",
  Software: "software",
  ProcessingSoftware: "software",
  DateTime: "dates",
  DateTimeOriginal: "dates",
  DateTimeDigitized: "dates",
  OffsetTime: "dates",
  OffsetTimeOriginal: "dates",
  OffsetTimeDigitized: "dates",
  SubSecTime: "dates",
  SubSecTimeOriginal: "dates",
  SubSecTimeDigitized: "dates",
  Artist: "author",
  XPAuthor: "author",
  Copyright: "copyright",
  ImageDescription: "custom",
  UserComment: "custom",
  XPComment: "custom",
  XPTitle: "custom",
  XPSubject: "custom",
  XPKeywords: "custom",
  ImageUniqueID: "custom",
};

/** Map IFD name to the piexif TAGS constant. */
export const IFD_MAP: Record<string, string> = {
  "0th": "ImageIFD",
  Exif: "ExifIFD",
  GPS: "GPSIFD",
  "1st": "ImageIFD",
  Interop: "InteropIFD",
};

/** A tag's category, reading the value where a free-text tag can hold an AI
 *  generation record (AUTOMATIC1111 writes its settings to UserComment in a
 *  JPEG). Shared with the JPEG stripper so what is removed under a category
 *  always matches what the review showed under it. */
export function exifCategory(tagName: string, formattedValue: string): MetadataCategory {
  return aiCategoryFor(tagName, formattedValue) ?? (TAG_CATEGORIES[tagName] || "custom");
}

/** EXIF UserComment opens with an 8-byte character code. AUTOMATIC1111 writes
 *  "UNICODE" and UTF-16, which showed as "UNICODE  a   c a t", a gap between
 *  every letter. Decode it for display; anything unrecognised is shown as is. */
function decodeUserComment(raw: string): string {
  const code = raw.slice(0, 8).replace(/\0+$/, "");
  const body = raw.slice(8);
  if (code === "ASCII") return body.replace(/\0+$/, "");
  if (code !== "UNICODE") return raw;
  const bytes = Uint8Array.from(body, (c) => c.charCodeAt(0) & 0xff);
  // Byte order is not recorded: for text that is mostly Latin, the high byte
  // of each pair is the NUL, so whichever position holds more NULs wins.
  let evenNul = 0, oddNul = 0;
  bytes.forEach((b, i) => { if (b === 0) { if (i % 2) oddNul++; else evenNul++; } });
  return new TextDecoder(evenNul >= oddNul ? "utf-16be" : "utf-16le").decode(bytes).replace(/\0+$/, "");
}

export function formatExifValue(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (Array.isArray(value)) {
    return value
      .map((v) => {
        if (Array.isArray(v) && v.length === 2) return `${v[0]}/${v[1]}`;
        return String(v);
      })
      .join(", ");
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

type ExifObj = Record<string, Record<string, unknown>>;

/** Offsets to the Exif, GPS and Interop IFDs. They are file structure, not
 *  metadata, and piexif.dump writes one back for every IFD that is kept, so
 *  listing them made a strip that kept GPS or dates look like it had left
 *  Custom fields behind (the verify-clean re-read caught it). */
const POINTER_TAGS = new Set(["ExifTag", "GPSTag", "InteroperabilityTag"]);

/** Turn a piexif tag name into a readable label.
 *
 *  Splitting on every capital ("JPEGInterchangeFormat" -> " J P E G ...")
 *  shreds acronyms, which is most of the EXIF vocabulary: JPEG, GPS, ISO, XMP.
 *  Split only at a real word boundary instead: lower-or-digit followed by
 *  upper, and the end of an acronym run followed by a capitalised word. */
export function humanizeTagName(tagName: string): string {
  return tagName
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/([a-zA-Z])(\d)/g, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

/** Turn a parsed piexif EXIF object into a list of MetadataFields. */
export function catalogExifFields(exifObj: ExifObj): MetadataField[] {
  const fields: MetadataField[] = [];
  for (const ifd of ["0th", "Exif", "GPS", "1st", "Interop"]) {
    if (!exifObj[ifd]) continue;
    for (const [tagId, value] of Object.entries(exifObj[ifd])) {
      if (value === undefined || value === null) continue;
      const ifdKey = IFD_MAP[ifd] || "ImageIFD";
      const tagInfo = piexif.TAGS[ifd]?.[tagId] ?? piexif.TAGS[ifdKey]?.[tagId];
      const tagName = (tagInfo?.["name"] ?? `Unknown_${ifd}_${tagId}`) as string;
      if (POINTER_TAGS.has(tagName)) continue;
      const formatted = formatExifValue(value);
      // The strippers keep or drop the GPS IFD whole under the GPS toggle, so
      // all of it is GPS here too. GPSVersionID was filed under Custom, and a
      // strip that kept GPS reported it removed while it stayed in the file.
      const category = ifd === "GPS" ? "gps" : exifCategory(tagName, formatted);
      fields.push({
        category,
        key: tagName,
        label: aiValueLabel(tagName, formatted) ?? humanizeTagName(tagName),
        value: tagName === "UserComment" ? decodeUserComment(formatted) : formatted,
        removable: true,
      });
    }
  }
  // IFD1's thumbnail: a small JPEG copy of the photo, which can predate a crop
  // or an edit. It was never listed, so a partial strip that kept it (which
  // every partial strip did) said nothing about it. Filed under Custom, the
  // technical leftovers, and removed with that toggle.
  const thumb = (exifObj as Record<string, unknown>)["thumbnail"];
  if (typeof thumb === "string" && thumb.length > 0) {
    fields.push({
      category: "custom",
      key: "Thumbnail",
      label: "Embedded thumbnail",
      value: `a small copy of the photo (${(thumb.length / 1024).toFixed(1)} KB)`,
      removable: true,
    });
  }
  return fields;
}

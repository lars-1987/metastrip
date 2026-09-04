import piexif from "piexifjs";
import type { MetadataField, MetadataCategory } from "../types";

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

/** Turn a parsed piexif EXIF object into a list of MetadataFields. */
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

export function catalogExifFields(exifObj: ExifObj): MetadataField[] {
  const fields: MetadataField[] = [];
  for (const ifd of ["0th", "Exif", "GPS", "1st", "Interop"]) {
    if (!exifObj[ifd]) continue;
    for (const [tagId, value] of Object.entries(exifObj[ifd])) {
      if (value === undefined || value === null) continue;
      const ifdKey = IFD_MAP[ifd] || "ImageIFD";
      const tagInfo = piexif.TAGS[ifd]?.[tagId] ?? piexif.TAGS[ifdKey]?.[tagId];
      const tagName = (tagInfo?.["name"] ?? `Unknown_${ifd}_${tagId}`) as string;
      const category = TAG_CATEGORIES[tagName] || "custom";
      fields.push({
        category,
        key: tagName,
        label: humanizeTagName(tagName),
        value: formatExifValue(value),
        removable: true,
      });
    }
  }
  return fields;
}

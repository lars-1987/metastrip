import piexif from "piexifjs";
import type { MetadataField } from "../types";
import { aiValueLabel } from "../ai-signatures";
import { decodeUserComment, exifCategory, humanizeTagName } from "./exif";

/* HEIC's EXIF, read through piexif until HEIC moves onto the EXIF reader in
   exif.ts. Categories, labels and UserComment decoding come from there. */

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

/** Offsets to the Exif, GPS and Interop IFDs. They are file structure, not
 *  metadata, and piexif.dump writes one back for every IFD that is kept, so
 *  listing them made a strip that kept GPS or dates look like it had left
 *  Custom fields behind (the verify-clean re-read caught it). */
const POINTER_TAGS = new Set(["ExifTag", "GPSTag", "InteroperabilityTag"]);

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

import type { MetadataCategory, MetadataField, StripOptions } from "../types";
import { aiCategoryFor, aiValueLabel } from "../ai-signatures";
import { tagName, type IfdName } from "./exif-tags";

/* EXIF is a TIFF structure: a header, then IFDs (tables of 12-byte entries)
   whose values sit inline or elsewhere in the block. JPEG APP1, PNG eXIf,
   WebP EXIF and HEIF Exif items all carry the same bytes, so this one module
   reads and strips it for every container, which only finds the block and
   puts back what comes out.

   Stripping edits in place: a removed tag's entry leaves its IFD and its
   value bytes are zeroed, so everything kept stays at its offset. HEIF items
   keep their size (their positions are absolute), and maker notes, whose
   internal offsets a re-layout would break, survive intact when kept. */

export interface ExifStripped {
  /** Every field, whatever the options. */
  fieldsFound: MetadataField[];
  fieldsRemoved: MetadataField[];
  /** The block to put back, never longer than the input; the input itself
   *  when nothing was removed; null when the block should go. */
  cleaned: Uint8Array | null;
}

/** Maps EXIF tag names to metadata categories. Anything not here is Custom. */
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
  // Vendor data about the camera, often with the body and lens serial
  // numbers and, from Canon, the owner's name. It was Custom, so keeping
  // Custom kept the serial number while Device was being removed.
  MakerNote: "device",
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

/** A tag's category, reading the value where a free-text tag can hold an AI
 *  generation record (AUTOMATIC1111 writes its settings to UserComment). */
export function exifCategory(name: string, value: string): MetadataCategory {
  return aiCategoryFor(name, value) ?? (TAG_CATEGORIES[name] || "custom");
}

/** Every category an EXIF field can fall under: what a block we can't read
 *  might hold. */
const EXIF_CATEGORIES: MetadataCategory[] = [...new Set([...Object.values(TAG_CATEGORIES), "custom", "ai"] as MetadataCategory[])];

/** EXIF UserComment opens with an 8-byte character code. AUTOMATIC1111 writes
 *  "UNICODE" and UTF-16, which showed as "UNICODE  a   c a t", a gap between
 *  every letter. Decode it for display; anything unrecognised is shown as is. */
export function decodeUserComment(raw: string): string {
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

/** Turn a tag name into a readable label.
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

/* ── Reading the structure ─────────────────────────────────────────── */

/** The block can't be walked: an offset or a count runs past its end, an IFD
 *  is reached twice, or a value has a type TIFF doesn't define. */
class Malformed extends Error {}

const TYPE_SIZE: Record<number, number> = {
  1: 1, // BYTE
  2: 1, // ASCII
  3: 2, // SHORT
  4: 4, // LONG
  5: 8, // RATIONAL
  6: 1, // SBYTE
  7: 1, // UNDEFINED
  8: 2, // SSHORT
  9: 4, // SLONG
  10: 8, // SRATIONAL
  11: 4, // FLOAT
  12: 8, // DOUBLE
  13: 4, // IFD
};

interface Entry {
  tag: number;
  type: number;
  count: number;
  /** Where the entry's 12 bytes start. */
  at: number;
  /** Where its value starts: inside the entry when it fits in 4 bytes. */
  valueAt: number;
  size: number;
}

interface Ifd {
  name: IfdName;
  at: number;
  entries: Entry[];
}

const TAG_EXIF_IFD = 0x8769;
const TAG_GPS_IFD = 0x8825;
const TAG_INTEROP_IFD = 0xa005;
const TAG_ORIENTATION = 0x0112;
const TAG_THUMBNAIL_OFFSET = 0x0201;
const TAG_THUMBNAIL_LENGTH = 0x0202;
const TAG_USER_COMMENT = 0x9286;
// A vendor's own binary format: shown by size, since its bytes read as noise.
const TAG_MAKER_NOTE = 0x927c;
const XP_TAGS = new Set([0x9c9b, 0x9c9c, 0x9c9d, 0x9c9e, 0x9c9f]);

const sizeOf = (bytes: number) => (bytes < 1024 ? `${bytes} bytes` : `${(bytes / 1024).toFixed(1)} KB`);

/** IFD order for the report: the order the fields were always listed in. */
const IFD_ORDER: IfdName[] = ["0th", "Exif", "GPS", "1st", "Interop"];

class Reader {
  readonly le: boolean;
  constructor(readonly b: Uint8Array) {
    if (b.length < 8) throw new Malformed();
    const bom = String.fromCharCode(b[0], b[1]);
    if (bom !== "II" && bom !== "MM") throw new Malformed();
    this.le = bom === "II";
    if (this.u16(2) !== 42) throw new Malformed();
  }

  check(at: number, size: number) {
    if (at < 0 || size < 0 || at + size > this.b.length) throw new Malformed();
  }

  u16(at: number): number {
    this.check(at, 2);
    const [x, y] = [this.b[at], this.b[at + 1]];
    return this.le ? x | (y << 8) : (x << 8) | y;
  }

  u32(at: number): number {
    this.check(at, 4);
    const [w, x, y, z] = [this.b[at], this.b[at + 1], this.b[at + 2], this.b[at + 3]];
    return (this.le ? w | (x << 8) | (y << 16) | (z << 24) : (w << 24) | (x << 16) | (y << 8) | z) >>> 0;
  }

  ifd(name: IfdName, at: number): Ifd {
    const count = this.u16(at);
    this.check(at, 2 + 12 * count + 4);
    const entries: Entry[] = [];
    for (let i = 0; i < count; i++) {
      const e = at + 2 + 12 * i;
      const type = this.u16(e + 2);
      const count = this.u32(e + 4);
      if (!TYPE_SIZE[type]) throw new Malformed();
      const size = count * TYPE_SIZE[type];
      const valueAt = size <= 4 ? e + 8 : this.u32(e + 8);
      this.check(valueAt, size);
      entries.push({ tag: this.u16(e), type, count, at: e, valueAt, size });
    }
    return { name, at, entries };
  }

  /** The offset where an IFD's next-IFD pointer sits. */
  nextAt = (ifd: Ifd) => ifd.at + 2 + 12 * ifd.entries.length;
}

interface Parsed {
  r: Reader;
  ifds: Ifd[];
  thumbnail: { at: number; length: number } | null;
}

function parse(b: Uint8Array): Parsed {
  const r = new Reader(b);
  const seen = new Set<number>();
  const ifds: Ifd[] = [];
  const read = (name: IfdName, at: number): Ifd => {
    if (seen.has(at)) throw new Malformed();
    seen.add(at);
    const ifd = r.ifd(name, at);
    ifds.push(ifd);
    return ifd;
  };
  const pointer = (ifd: Ifd, tag: number) => {
    const e = ifd.entries.find((x) => x.tag === tag);
    return e ? r.u32(e.valueAt) : null;
  };

  const ifd0 = read("0th", r.u32(4));
  const exifAt = pointer(ifd0, TAG_EXIF_IFD);
  const gpsAt = pointer(ifd0, TAG_GPS_IFD);
  if (exifAt !== null) {
    const interopAt = pointer(read("Exif", exifAt), TAG_INTEROP_IFD);
    if (interopAt !== null) read("Interop", interopAt);
  }
  if (gpsAt !== null) read("GPS", gpsAt);

  let thumbnail: Parsed["thumbnail"] = null;
  const ifd1At = r.u32(r.nextAt(ifd0));
  if (ifd1At !== 0) {
    const ifd1 = read("1st", ifd1At);
    const at = pointer(ifd1, TAG_THUMBNAIL_OFFSET);
    const length = pointer(ifd1, TAG_THUMBNAIL_LENGTH);
    if (at !== null && length !== null) {
      r.check(at, length);
      thumbnail = { at, length };
    }
  }
  return { r, ifds, thumbnail };
}

/* ── Values, as the review shows them ──────────────────────────────── */

const LATIN1 = new TextDecoder("latin1");
const UTF8 = new TextDecoder("utf-8", { fatal: true });

/** The raw value as text (what the AI checks read) and as shown. */
function valueOf(r: Reader, ifd: IfdName, e: Entry): { raw: string; shown: string } {
  const bytes = r.b.subarray(e.valueAt, e.valueAt + e.size);
  if (e.type === 2) {
    // ASCII by the specification, but phones write UTF-8 names and captions.
    const text = bytes.subarray(0, bytes.indexOf(0) < 0 ? bytes.length : bytes.indexOf(0));
    let s: string;
    try {
      s = UTF8.decode(text);
    } catch {
      s = LATIN1.decode(text);
    }
    return { raw: s, shown: s };
  }
  if (e.type === 7) {
    const s = LATIN1.decode(bytes);
    if (ifd === "Exif" && e.tag === TAG_MAKER_NOTE) return { raw: s, shown: `${sizeOf(e.size)} of vendor data` };
    return { raw: s, shown: ifd === "Exif" && e.tag === TAG_USER_COMMENT ? decodeUserComment(s) : s };
  }
  if (ifd === "0th" && XP_TAGS.has(e.tag) && e.type === 1) {
    // Windows' XP tags are UTF-16LE in a BYTE array.
    const s = new TextDecoder("utf-16le").decode(bytes).replace(/\0+$/, "");
    return { raw: s, shown: s };
  }
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const values: string[] = [];
  for (let i = 0; i < e.count; i++) {
    const o = i * TYPE_SIZE[e.type];
    switch (e.type) {
      case 1: values.push(String(view.getUint8(o))); break;
      case 6: values.push(String(view.getInt8(o))); break;
      case 3: values.push(String(view.getUint16(o, r.le))); break;
      case 8: values.push(String(view.getInt16(o, r.le))); break;
      case 4: case 13: values.push(String(view.getUint32(o, r.le))); break;
      case 9: values.push(String(view.getInt32(o, r.le))); break;
      case 5: values.push(`${view.getUint32(o, r.le)}/${view.getUint32(o + 4, r.le)}`); break;
      case 10: values.push(`${view.getInt32(o, r.le)}/${view.getInt32(o + 4, r.le)}`); break;
      case 11: values.push(String(view.getFloat32(o, r.le))); break;
      case 12: values.push(String(view.getFloat64(o, r.le))); break;
    }
  }
  const s = values.join(", ");
  return { raw: s, shown: s };
}

/** Entries that are the block's own structure or display information, never
 *  listed as fields: pointers to other IFDs and to the thumbnail, and the
 *  photo's orientation. */
function isHidden(ifd: IfdName, tag: number): boolean {
  if (ifd === "0th") return tag === TAG_EXIF_IFD || tag === TAG_GPS_IFD || tag === TAG_ORIENTATION;
  if (ifd === "Exif") return tag === TAG_INTEROP_IFD;
  if (ifd === "1st") return tag === TAG_THUMBNAIL_OFFSET || tag === TAG_THUMBNAIL_LENGTH;
  return false;
}

function fieldFor(r: Reader, ifd: IfdName, e: Entry): MetadataField {
  const name = tagName(ifd, e.tag);
  const { raw, shown } = valueOf(r, ifd, e);
  if (!name) {
    // Tags the specifications don't name, often a vendor's own. They used to
    // be dropped silently: never listed, but kept by a partial strip.
    return {
      category: "custom",
      key: `Unknown_${ifd}_${e.tag}`,
      label: `Unknown tag 0x${e.tag.toString(16).padStart(4, "0")}`,
      value: shown,
      removable: true,
    };
  }
  return {
    // The GPS IFD is all location, GPSVersionID included.
    category: ifd === "GPS" ? "gps" : exifCategory(name, raw),
    key: name,
    label: aiValueLabel(name, raw) ?? humanizeTagName(name),
    value: shown,
    removable: true,
  };
}

/* ── Stripping ─────────────────────────────────────────────────────── */

export function stripExif(tiff: Uint8Array, options: StripOptions): ExifStripped {
  let parsed: Parsed;
  try {
    parsed = parse(tiff);
  } catch (err) {
    if (!(err instanceof Malformed)) throw err;
    return unreadable(tiff, options);
  }
  const { r, ifds, thumbnail } = parsed;

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const removed = new Set<Entry>();
  const byName = new Map(ifds.map((ifd) => [ifd.name, ifd]));

  for (const name of IFD_ORDER) {
    const ifd = byName.get(name);
    if (!ifd) continue;
    for (const e of [...ifd.entries].sort((a, z) => a.tag - z.tag)) {
      if (isHidden(name, e.tag)) continue;
      const field = fieldFor(r, name, e);
      fieldsFound.push(field);
      if (options[field.category]) {
        fieldsRemoved.push(field);
        removed.add(e);
      }
    }
  }

  // IFD1's thumbnail: a small JPEG copy of the photo, which can predate a
  // crop or an edit. Custom, the technical leftovers, removes it.
  let thumbnailGoes = false;
  if (thumbnail) {
    const field: MetadataField = {
      category: "custom",
      key: "Thumbnail",
      label: "Embedded thumbnail",
      value: `a small copy of the photo (${(thumbnail.length / 1024).toFixed(1)} KB)`,
      removable: true,
    };
    fieldsFound.push(field);
    if (options.custom) {
      fieldsRemoved.push(field);
      thumbnailGoes = true;
    }
  }

  if (fieldsRemoved.length === 0) return { fieldsFound, fieldsRemoved, cleaned: tiff };
  if (fieldsRemoved.length === fieldsFound.length) return { fieldsFound, fieldsRemoved, cleaned: orientationOnly(parsed) };
  return { fieldsFound, fieldsRemoved, cleaned: rewrite(parsed, removed, thumbnailGoes) };
}

/** EXIF we can't walk is one field, and the whole block goes whenever any
 *  category EXIF can hold is being removed: we can't tell what's inside. */
function unreadable(tiff: Uint8Array, options: StripOptions): ExifStripped {
  const field: MetadataField = {
    category: "custom",
    key: "EXIF",
    label: "EXIF data that couldn't be read",
    value: `(${tiff.length} bytes)`,
    removable: true,
  };
  const goes = EXIF_CATEGORIES.some((c) => options[c]);
  return { fieldsFound: [field], fieldsRemoved: goes ? [field] : [], cleaned: goes ? null : tiff };
}

/** What's left once every field goes: nothing, or a fresh 26-byte TIFF
 *  holding only the orientation when the photo is stored rotated. Rebuilding
 *  in place would leave the old block's size in zeros. */
function orientationOnly({ r, ifds }: Parsed): Uint8Array | null {
  const e = ifds[0].entries.find((x) => x.tag === TAG_ORIENTATION);
  if (!e || e.type !== 3 || e.count < 1) return null;
  const value = r.u16(e.valueAt);
  if (value < 2 || value > 8) return null;
  const out = new Uint8Array(26);
  const view = new DataView(out.buffer);
  out.set(r.b.subarray(0, 4)); // byte order and 42
  view.setUint32(4, 8, r.le);
  view.setUint16(8, 1, r.le);
  view.setUint16(10, TAG_ORIENTATION, r.le);
  view.setUint16(12, 3, r.le); // SHORT
  view.setUint32(14, 1, r.le);
  view.setUint16(18, value, r.le);
  return out; // next-IFD offset (22..26) stays 0
}

/** Take the removed entries out of their IFDs and zero their values, in a
 *  copy the same size as the block. An IFD left empty goes with its pointer;
 *  IFD1 goes with the thumbnail. Bytes a kept entry still uses are never
 *  zeroed, even if a removed one shared them. */
function rewrite({ r, ifds, thumbnail }: Parsed, removed: Set<Entry>, thumbnailGoes: boolean): Uint8Array {
  const out = r.b.slice();
  const view = new DataView(out.buffer);
  const kept = new Map(ifds.map((ifd) => [ifd, ifd.entries.filter((e) => !removed.has(e))]));
  const byName = new Map(ifds.map((ifd) => [ifd.name, ifd]));
  const drop = (ifd: IfdName, tag: number) => {
    const owner = byName.get(ifd);
    if (owner) kept.set(owner, kept.get(owner)!.filter((e) => e.tag !== tag));
  };
  const isEmpty = (name: IfdName) => {
    const ifd = byName.get(name);
    return !ifd || kept.get(ifd)!.length === 0;
  };

  if (thumbnailGoes) {
    drop("1st", TAG_THUMBNAIL_OFFSET);
    drop("1st", TAG_THUMBNAIL_LENGTH);
  }
  // Innermost first, so an emptied Interop IFD can leave the Exif IFD empty.
  if (isEmpty("Interop")) drop("Exif", TAG_INTEROP_IFD);
  if (isEmpty("Exif")) drop("0th", TAG_EXIF_IFD);
  if (isEmpty("GPS")) drop("0th", TAG_GPS_IFD);
  const ifd1Goes = isEmpty("1st");

  const live = new Uint8Array(out.length); // 1 = still in use
  const mark = (at: number, size: number, v: number) => live.fill(v, at, at + size);
  const zero: [number, number][] = [];
  const ifdSize = (ifd: Ifd) => 2 + 12 * ifd.entries.length + 4;

  mark(0, 8, 1);
  for (const ifd of ifds) {
    const entries = kept.get(ifd)!;
    const goes = entries.length === 0 && ifd.name !== "0th";
    if (goes || (ifd.name === "1st" && ifd1Goes)) {
      zero.push([ifd.at, ifdSize(ifd)]);
    } else {
      mark(ifd.at, 2 + 12 * entries.length + 4, 1);
      zero.push([ifd.at + 2 + 12 * entries.length + 4, ifdSize(ifd) - (2 + 12 * entries.length + 4)]);
    }
    for (const e of ifd.entries) {
      if (e.size <= 4) continue;
      if (entries.includes(e)) mark(e.valueAt, e.size, 1);
      else zero.push([e.valueAt, e.size]);
    }
  }
  if (thumbnail) {
    if (thumbnailGoes) zero.push([thumbnail.at, thumbnail.length]);
    else mark(thumbnail.at, thumbnail.length, 1);
  }

  // Rewrite each kept IFD: count, the kept entries in order, next pointer.
  for (const ifd of ifds) {
    const entries = kept.get(ifd)!;
    if (entries.length === 0 && ifd.name !== "0th") continue;
    if (ifd.name === "1st" && ifd1Goes) continue;
    const next = r.u32(r.nextAt(ifd));
    const table = entries.map((e) => r.b.slice(e.at, e.at + 12));
    view.setUint16(ifd.at, entries.length, r.le);
    table.forEach((bytes, i) => out.set(bytes, ifd.at + 2 + 12 * i));
    const nextAt = ifd.at + 2 + 12 * entries.length;
    view.setUint32(nextAt, ifd.name === "0th" && ifd1Goes ? 0 : next, r.le);
  }

  for (const [at, size] of zero) {
    for (let i = at; i < at + size; i++) if (!live[i]) out[i] = 0;
  }
  return out;
}

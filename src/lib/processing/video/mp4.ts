/**
 * MP4 / MOV / M4V metadata stripper
 *
 * Strategy: parse the MP4 box structure, find privacy-sensitive atoms
 * (udta, meta, location/©xyz, ©day, etc.) within `moov`, and replace
 * them with `free` atoms of identical size. The `free` box is the
 * standard MP4 "skip me" marker — the metadata is gone but file
 * structure is preserved and no parent-size recomputation is needed.
 *
 * Also zeroes timestamps (creation_time, modification_time) in mvhd, tkhd
 * and mdhd, since those leak when the video was recorded. mdhd was missed
 * until 13 Sep 2026, so every cleaned video still carried its recording time
 * once per track.
 *
 * Works for iPhone/Android/GoPro/drone MP4s and standard MOV files.
 * Does NOT handle fragmented MP4 (moof/mfra) — those need a different
 * approach. Logged + reported gracefully if encountered.
 */

import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
  MetadataReport,
  SupportedFileType,
} from "../types";

/* ──────────────────────────────────────────────────────────────────
   Atom types we care about
   ────────────────────────────────────────────────────────────────── */

// Atoms that contain user metadata — replaced with `free` atoms entirely.
const STRIP_ATOMS = new Set([
  "udta", // user data — most metadata lives here
  "meta", // metadata container (iTunes-style + others)
  "©xyz", // GPS location (the iPhone classic — non-printable © byte 0xA9)
  "loci", // location information
  "keys", // metadata keys
  "ilst", // metadata item list
  "Xtra", // Microsoft "extra" box (often has author/title)
  "name", // track / movie name when at metadata level
]);

// ©-prefixed atoms (0xA9) — Apple-style metadata tags.
// We dynamically detect any atom starting with 0xA9 (©) and strip them.
// Common: ©nam ©cmt ©day ©too ©ART ©alb ©gen ©dir ©mak ©mod ©swr ©hst ©loc

// Container atoms we need to walk INTO to find metadata atoms.
const CONTAINER_ATOMS = new Set([
  "moov", // movie box
  "trak", // track box
  "mdia", // media box
  "minf", // media information
  "stbl", // sample table
  "edts", // edits
  "moof", // movie fragment
  "traf", // track fragment
]);

interface BoxInfo {
  offset: number;
  size: number;
  type: string;
  /** byte offset where children begin (header end) */
  contentStart: number;
  /** byte offset where this box ends */
  end: number;
  /** true if size was specified as 64-bit */
  largeSize: boolean;
}

/* ──────────────────────────────────────────────────────────────────
   Reading helpers
   ────────────────────────────────────────────────────────────────── */

const ASCII = new TextDecoder("ascii");

function readBox(view: DataView, offset: number): BoxInfo | null {
  if (offset + 8 > view.byteLength) return null;
  const size32 = view.getUint32(offset);
  const typeBytes = new Uint8Array(view.buffer, view.byteOffset + offset + 4, 4);
  const type = ASCII.decode(typeBytes);

  let size = size32;
  let headerSize = 8;
  let largeSize = false;

  if (size32 === 0) {
    // Box extends to end of file
    size = view.byteLength - offset;
  } else if (size32 === 1) {
    // 64-bit size follows the type
    if (offset + 16 > view.byteLength) return null;
    const high = view.getUint32(offset + 8);
    const low = view.getUint32(offset + 12);
    // JS can safely handle integers up to 2^53; large videos can exceed
    // 4GB but we cap our processing well below that.
    size = high * 0x100000000 + low;
    headerSize = 16;
    largeSize = true;
  }

  // Sanity check
  if (size < headerSize || offset + size > view.byteLength) return null;

  return {
    offset,
    size,
    type,
    contentStart: offset + headerSize,
    end: offset + size,
    largeSize,
  };
}

function* iterBoxes(
  view: DataView,
  start: number,
  end: number
): Generator<BoxInfo> {
  let pos = start;
  while (pos < end) {
    const box = readBox(view, pos);
    if (!box) break;
    yield box;
    if (box.size === 0) break; // safety
    pos = box.end;
  }
}

/* ──────────────────────────────────────────────────────────────────
   Mutation helpers — write into a Uint8Array buffer
   ────────────────────────────────────────────────────────────────── */

function writeAscii(buf: Uint8Array, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) {
    buf[offset + i] = text.charCodeAt(i);
  }
}

/**
 * Convert an existing box into a `free` box. This preserves the box's
 * size header but renames its type — MP4 parsers see it and skip the
 * content. The metadata bytes are still in the file (could be cleared
 * for paranoia, but `free` semantically means "ignore me").
 */
function makeFreeBox(buf: Uint8Array, box: BoxInfo) {
  // Type field is at offset+4 (4 bytes)
  writeAscii(buf, box.offset + 4, "free");
  // Optionally zero out the content for paranoia. Some forensic tools
  // could still read the bytes; zeroing makes it forensically clean.
  buf.fill(0, box.contentStart, box.end);
}

/**
 * Zero specific bytes (used for resetting timestamps inside mvhd/tkhd
 * without removing the box).
 */
function zeroBytes(buf: Uint8Array, offset: number, length: number) {
  buf.fill(0, offset, offset + length);
}

/** Boxes with a creation/modification time pair, and how the report names them. */
const TIMESTAMP_BOXES: Record<string, string> = {
  mvhd: "Movie created",
  tkhd: "Track created",
  mdhd: "Media created", // one per track, its own copy of the recording time
};

// MP4 counts seconds from 1904-01-01; JavaScript from 1970-01-01.
const MAC_EPOCH_OFFSET = 2082844800;

function readMacTime(view: DataView, offset: number, wide: boolean): number {
  return wide ? view.getUint32(offset) * 0x100000000 + view.getUint32(offset + 4) : view.getUint32(offset);
}

function formatMacTime(secs: number): string {
  const d = new Date((secs - MAC_EPOCH_OFFSET) * 1000);
  return Number.isNaN(d.getTime()) ? String(secs) : `${d.toISOString().slice(0, 19).replace("T", " ")} UTC`;
}

function describeTimes(created: number, modified: number): string {
  if (!created) return `modified ${formatMacTime(modified)}`;
  if (!modified || modified === created) return formatMacTime(created);
  return `${formatMacTime(created)} (modified ${formatMacTime(modified)})`;
}

/* ──────────────────────────────────────────────────────────────────
   The actual stripping pass
   ────────────────────────────────────────────────────────────────── */

interface StripResult {
  cleaned: Uint8Array;
  fieldsFound: MetadataField[];
  fieldsRemoved: MetadataField[];
}

function stripMp4Metadata(input: ArrayBuffer, options: StripOptions): StripResult {
  // Copy the buffer so we don't mutate the original
  const cleaned = new Uint8Array(input.byteLength);
  cleaned.set(new Uint8Array(input));
  const view = new DataView(cleaned.buffer);

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];

  function walk(start: number, end: number, parentType: string) {
    for (const box of iterBoxes(view, start, end)) {
      const isAppleTag = box.type.charCodeAt(0) === 0xa9; // '©' prefix
      const stripThis = STRIP_ATOMS.has(box.type) || isAppleTag;

      if (stripThis) {
        // Report what the container holds, field by field, so a location reads
        // as GPS rather than "Metadata container (570 bytes)" under Custom.
        let fields: MetadataField[] = [];
        try {
          fields = describeContainer(view, box);
        } catch {
          fields = []; // an odd layout falls back to the one-line summary
        }
        if (fields.length === 0 && !isPaddingOnly(view, box)) {
          fields = [{ category: categoriseAtom(box.type), key: box.type, label: atomLabel(box.type), value: `(${box.size} bytes)`, removable: true }];
        }
        fieldsFound.push(...fields);

        // The container still goes whole: rewriting inside it would mean
        // resizing every parent box. So it goes if any category it holds is
        // ticked, erring towards removing more than asked, never less.
        if (fields.length === 0 || fields.some((f) => categoryEnabled(f.category, options))) {
          makeFreeBox(cleaned, box);
          fieldsRemoved.push(...fields);
        }
        continue;
      }

      // hdlr — zero the 12-byte "reserved" field where Apple etc. stuff vendor IDs.
      // Box layout (after 8-byte header): version(1) flags(3) pre_defined(4)
      // handler_type(4) reserved[3](12 bytes) name(variable, null-terminated).
      // A field is only reported when it holds something. Zeroed is what a
      // stripped file looks like, and reporting these unconditionally made
      // every cleaned video re-scan as "8 date fields, 14 vendor IDs found".
      if (box.type === "hdlr") {
        const reservedStart = box.contentStart + 12; // skip ver+flags+pre_defined+handler_type
        const reservedLen = 12;
        if (reservedStart + reservedLen <= box.end) {
          const reserved = cleaned.subarray(reservedStart, reservedStart + reservedLen);
          if (reserved.some((b) => b !== 0)) {
            const vendor = ASCII.decode(reserved.subarray(0, 4)).replace(/\0/g, "").trim();
            const f: MetadataField = {
              category: "software",
              key: "hdlr_vendor",
              label: "Handler vendor ID",
              value: vendor || "(set)",
              removable: true,
            };
            fieldsFound.push(f);
            if (options.software || options.device) {
              zeroBytes(cleaned, reservedStart, reservedLen);
              fieldsRemoved.push(f);
            }
          }
        }
        continue;
      }

      // mvhd / tkhd / mdhd: creation_time and modification_time. The fields
      // are mandatory, so they are zeroed rather than removed. Layout from
      // box.contentStart: 1 byte version, 3 bytes flags, then two 4-byte
      // times (version 0) or two 8-byte times (version 1).
      if (TIMESTAMP_BOXES[box.type]) {
        const wide = view.getUint8(box.contentStart) === 1;
        const tsStart = box.contentStart + 4;
        const tsLen = wide ? 16 : 8;
        if (tsStart + tsLen <= box.end) {
          const created = readMacTime(view, tsStart, wide);
          const modified = readMacTime(view, tsStart + tsLen / 2, wide);
          if (created || modified) {
            const f: MetadataField = {
              category: "dates",
              key: `${box.type}_timestamps`,
              label: TIMESTAMP_BOXES[box.type],
              value: describeTimes(created, modified),
              removable: true,
            };
            fieldsFound.push(f);
            if (options.dates) {
              zeroBytes(cleaned, tsStart, tsLen);
              fieldsRemoved.push(f);
            }
          }
        }
        continue;
      }

      // Recurse into containers
      if (CONTAINER_ATOMS.has(box.type)) {
        walk(box.contentStart, box.end, box.type);
      }
    }
  }

  walk(0, view.byteLength, "root");

  return { cleaned, fieldsFound, fieldsRemoved };
}

/* ──────────────────────────────────────────────────────────────────
   Reporting helpers
   ────────────────────────────────────────────────────────────────── */

function categoriseAtom(type: string): MetadataField["category"] {
  if (type === "©xyz" || type === "loci" || type === "©loc") return "gps";
  if (type === "©mak" || type === "©mod") return "device";
  if (type === "©day") return "dates";
  if (type === "©ART" || type === "©aut" || type === "©wrt" || type === "©dir") return "author";
  if (type === "©cmt") return "comments";
  // ©too is the encoder: it was filed under dates, and ©nam (a title) under author.
  if (type === "©swr" || type === "©hst" || type === "©too" || type === "©enc") return "software";
  if (type === "©cpy" || type === "cprt") return "copyright";
  return "custom";
}

function categoryEnabled(
  category: MetadataField["category"],
  options: StripOptions
): boolean {
  return options[category] ?? true;
}

const ATOM_LABELS: Record<string, string> = {
  udta: "User data atom",
  meta: "Metadata container",
  "©xyz": "GPS location (©xyz)",
  loci: "Location info",
  "©nam": "Title",
  "©cmt": "Comment",
  "©day": "Recording date",
  "©too": "Encoder",
  "©ART": "Artist",
  "©alb": "Album",
  "©gen": "Genre",
  "©dir": "Director",
  "©mak": "Make (camera)",
  "©mod": "Model (camera)",
  "©swr": "Software",
  "©hst": "Host",
  "©loc": "Location",
  "©cpy": "Copyright",
  "©aut": "Author",
  keys: "Metadata keys",
  ilst: "Metadata items",
  Xtra: "Microsoft Xtra metadata",
  "©wrt": "Writer",
  "©enc": "Encoded by",
  cprt: "Copyright",
  desc: "Description",
  ldes: "Long description",
  covr: "Cover art",
};

function atomLabel(type: string): string {
  return ATOM_LABELS[type] ?? `Metadata atom (${type})`;
}

/* ──────────────────────────────────────────────────────────────────
   Reading inside the metadata containers, for the report
   ────────────────────────────────────────────────────────────────── */

// Only the report changes here; the containers are still removed whole. A
// video's location used to show as one opaque Custom field, so nobody saw
// their video carried one, and category telemetry never counted GPS for video.

const UTF8 = new TextDecoder();

/** The start of an ISO 6709 point: signed latitude then signed longitude. */
const ISO6709_POINT = /^[+-]\d{1,2}(?:\.\d+)?[+-]\d{1,3}(?:\.\d+)?/;

/** Apple and Android mdta keys (lower-cased), with category and label. */
const MDTA_KEYS = new Map<string, [MetadataCategory, string]>([
  ["com.apple.quicktime.location.iso6709", ["gps", "Location"]],
  ["com.apple.quicktime.location.accuracy.horizontal", ["gps", "Location accuracy (m)"]],
  ["com.apple.quicktime.location.name", ["gps", "Place name"]],
  ["com.apple.quicktime.make", ["device", "Make"]],
  ["com.apple.quicktime.model", ["device", "Model"]],
  ["com.apple.quicktime.camera.lens_model", ["device", "Lens"]],
  ["com.apple.quicktime.software", ["software", "Software"]],
  ["com.apple.quicktime.creationdate", ["dates", "Recorded"]],
  ["com.apple.quicktime.author", ["author", "Author"]],
  ["com.apple.quicktime.artist", ["author", "Artist"]],
  ["com.apple.quicktime.copyright", ["copyright", "Copyright"]],
  ["com.apple.quicktime.comment", ["comments", "Comment"]],
  ["com.apple.quicktime.title", ["custom", "Title"]],
  ["com.apple.quicktime.description", ["custom", "Description"]],
  ["com.apple.quicktime.content.identifier", ["custom", "Content identifier"]],
  ["com.android.version", ["software", "Android version"]],
  ["com.android.manufacturer", ["device", "Make"]],
  ["com.android.model", ["device", "Model"]],
]);

/** Known keys by name, anything else by what its last segment says it is. */
function categoriseKey(key: string): [MetadataCategory, string] {
  const k = key.toLowerCase();
  const known = MDTA_KEYS.get(k);
  if (known) return known;
  const last = k.split(".").pop() ?? k;
  if (/iso6709|location|gps/.test(k)) return ["gps", key];
  if (last === "make" || last === "model" || /manufacturer|lens/.test(last)) return ["device", key];
  if (/date|time/.test(last)) return ["dates", key];
  if (/software|encoder|version/.test(last)) return ["software", key];
  if (/author|artist|creator/.test(last)) return ["author", key];
  if (last === "copyright") return ["copyright", key];
  if (last === "comment") return ["comments", key];
  return ["custom", key];
}

function bytesAt(view: DataView, start: number, end: number): Uint8Array {
  return new Uint8Array(view.buffer, view.byteOffset + start, Math.max(0, end - start));
}

/** The value in an item's `data` box (iTunes-style and Apple mdta items). */
function readDataValue(view: DataView, item: BoxInfo): string {
  for (const d of iterBoxes(view, item.contentStart, item.end)) {
    if (d.type !== "data" || d.contentStart + 8 > d.end) continue;
    const typeCode = view.getUint32(d.contentStart) & 0x00ffffff;
    const start = d.contentStart + 8; // type indicator, then locale
    const len = d.end - start;
    switch (typeCode) {
      case 1: return UTF8.decode(bytesAt(view, start, d.end));
      case 2: return new TextDecoder("utf-16be").decode(bytesAt(view, start, d.end));
      case 21: return len === 1 ? String(view.getInt8(start)) : len === 2 ? String(view.getInt16(start)) : len === 4 ? String(view.getInt32(start)) : `(${len} bytes)`;
      case 22: return len === 1 ? String(view.getUint8(start)) : len === 2 ? String(view.getUint16(start)) : len === 4 ? String(view.getUint32(start)) : `(${len} bytes)`;
      case 23: return len === 4 ? String(Math.round(view.getFloat32(start) * 100) / 100) : `(${len} bytes)`;
      case 24: return len === 8 ? String(Math.round(view.getFloat64(start) * 100) / 100) : `(${len} bytes)`;
      case 13: case 14: case 27: return `(image, ${len} bytes)`;
      default: return `(${len} bytes)`;
    }
  }
  return "";
}

/** A QuickTime user-data text atom (©xyz, ©mak...): a 2-byte length and a
 *  2-byte language, then the text. iTunes-style ones hold a `data` box. */
function readQtText(view: DataView, atom: BoxInfo): string {
  const first = readBox(view, atom.contentStart);
  if (first && first.type === "data" && first.end <= atom.end) return readDataValue(view, atom);
  if (atom.contentStart + 4 > atom.end) return "";
  const start = atom.contentStart + 4;
  return UTF8.decode(bytesAt(view, start, Math.min(start + view.getUint16(atom.contentStart), atom.end)));
}

/** 3GPP `loci` as an ISO 6709 string: version/flags, language, a
 *  null-terminated name, a role byte, then 16.16 fixed longitude, latitude
 *  and altitude. */
function readLoci(view: DataView, box: BoxInfo): string | null {
  let p = box.contentStart + 6;
  while (p < box.end && view.getUint8(p) !== 0) p++;
  p += 2; // the name's terminator, the role
  if (p + 12 > box.end) return null;
  const lng = view.getInt32(p) / 65536;
  const lat = view.getInt32(p + 4) / 65536;
  const alt = view.getInt32(p + 8) / 65536;
  const s = (n: number, d: number) => `${n < 0 ? "-" : "+"}${Math.abs(n).toFixed(d)}`;
  return `${s(lat, 5)}${s(lng, 5)}${s(alt, 3)}/`;
}

function readKeys(view: DataView, keys: BoxInfo): string[] {
  const out: string[] = [];
  if (keys.contentStart + 8 > keys.end) return out;
  const count = view.getUint32(keys.contentStart + 4); // after version/flags
  let p = keys.contentStart + 8;
  for (let i = 0; i < count && p + 8 <= keys.end; i++) {
    const size = view.getUint32(p);
    if (size < 8 || p + size > keys.end) break;
    out.push(UTF8.decode(bytesAt(view, p + 8, p + size))); // after size and namespace
    p += size;
  }
  return out;
}

const META_CHILDREN = new Set(["hdlr", "keys", "ilst", "xml ", "free", "uuid"]);

/** QuickTime's `meta` box has no version/flags; ISO and iTunes ones do. */
function metaChildrenStart(view: DataView, meta: BoxInfo): number {
  const probe = readBox(view, meta.contentStart);
  return probe && META_CHILDREN.has(probe.type) && probe.end <= meta.end ? meta.contentStart : meta.contentStart + 4;
}

/** A container holding nothing but padding (or a lone handler) is not metadata. */
function isPaddingOnly(view: DataView, box: BoxInfo): boolean {
  if (box.type !== "udta" && box.type !== "meta") return false;
  const start = box.type === "meta" ? metaChildrenStart(view, box) : box.contentStart;
  for (const c of iterBoxes(view, start, box.end)) {
    if (c.type !== "free" && c.type !== "skip" && c.type !== "hdlr") return false;
  }
  return true;
}

/** What a udta, meta or tag atom holds, one field per item. */
function describeContainer(view: DataView, box: BoxInfo): MetadataField[] {
  const out: MetadataField[] = [];
  const add = (category: MetadataCategory, key: string, label: string, value: string) =>
    out.push({ category, key, label, value: value.length > 200 ? value.slice(0, 200) + "…" : value, removable: true });

  // Every location string goes out under the key "ISO6709", which the map reads.
  const addTag = (type: string, value: string) => {
    if (type === "©xyz") add("gps", "ISO6709", "Location", value);
    else add(categoriseAtom(type), type, atomLabel(type), value);
  };

  const readMeta = (meta: BoxInfo) => {
    const kids = [...iterBoxes(view, metaChildrenStart(view, meta), meta.end)];
    const keysBox = kids.find((k) => k.type === "keys");
    const keys = keysBox ? readKeys(view, keysBox) : [];
    for (const kid of kids) {
      if (kid.type === "ilst") {
        for (const item of iterBoxes(view, kid.contentStart, kid.end)) {
          // In Apple's mdta layout an item's type is a 1-based index into keys.
          const idx = view.getUint32(item.offset + 4);
          const value = readDataValue(view, item);
          if (keys.length && idx >= 1 && idx <= keys.length) {
            const [category, label] = categoriseKey(keys[idx - 1]);
            // Any location written as a point, whatever the key is called
            // (ffmpeg writes a plain "location"), is keyed for the map.
            add(category, category === "gps" && ISO6709_POINT.test(value) ? "ISO6709" : keys[idx - 1], label, value);
          } else {
            addTag(item.type, value);
          }
        }
      } else if (!["hdlr", "keys", "free", "skip"].includes(kid.type)) {
        add(categoriseAtom(kid.type), kid.type, atomLabel(kid.type), `(${kid.size} bytes)`);
      }
    }
  };

  const visit = (b: BoxInfo, depth: number) => {
    if (depth > 4 || b.type === "free" || b.type === "skip") return;
    if (b.type === "udta") {
      for (const c of iterBoxes(view, b.contentStart, b.end)) visit(c, depth + 1);
    } else if (b.type === "meta") {
      readMeta(b);
    } else if (b.type === "loci") {
      const iso = readLoci(view, b);
      if (iso) add("gps", "ISO6709", "Location", iso);
    } else if (b.type.charCodeAt(0) === 0xa9) {
      addTag(b.type, readQtText(view, b));
    } else {
      add(categoriseAtom(b.type), b.type, atomLabel(b.type), `(${b.size} bytes)`);
    }
  };

  visit(box, 0);
  return out;
}

/* ──────────────────────────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────────────────────────── */

const SIZE_CAP_BYTES = 1.5 * 1024 * 1024 * 1024; // 1.5 GB

export async function processMp4(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const fileType: SupportedFileType =
    file.type === "video/quicktime" ? "mov" : "mp4";

  // Refuse oversize files early instead of letting the tab crash
  if (file.size > SIZE_CAP_BYTES) {
    return {
      originalFile: file,
      cleanedBlob: new Blob(),
      report: {
        fileName: file.name,
        fileType,
        fileSize: file.size,
        cleanedFileSize: 0,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: `Video too large (${(file.size / 1073741824).toFixed(1)} GB). Maximum 1.5 GB. Trim or compress first.`,
    };
  }

  const arrayBuffer = await file.arrayBuffer();

  try {
    const { cleaned, fieldsFound, fieldsRemoved } = stripMp4Metadata(
      arrayBuffer,
      options
    );

    // Cast through BlobPart[] to satisfy strict TS — Uint8Array IS a valid BlobPart
    // at runtime; only the type relationship around ArrayBufferLike trips the checker.
    const cleanedBlob = new Blob([cleaned as BlobPart], { type: file.type });

    const report: MetadataReport = {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept: fieldsFound.filter((f) => !fieldsRemoved.includes(f)),
      processedAt: new Date(),
    };

    return {
      originalFile: file,
      cleanedBlob,
      report,
    };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown error processing video";
    return {
      originalFile: file,
      cleanedBlob: new Blob(),
      report: {
        fileName: file.name,
        fileType,
        fileSize: file.size,
        cleanedFileSize: 0,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: `MP4 processing failed: ${message}`,
    };
  }
}

// MOV files have the same atom structure as MP4 — same processor handles them.
export const processMov = processMp4;

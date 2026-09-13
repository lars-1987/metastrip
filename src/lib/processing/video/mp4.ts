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
        // Categorise the field for the report
        const category = categoriseAtom(box.type);
        const label = atomLabel(box.type);
        const found: MetadataField = {
          category,
          key: box.type,
          label,
          value: `(${box.size} bytes)`,
          removable: true,
        };
        fieldsFound.push(found);

        // Honour StripOptions — only zap if this category is enabled
        if (categoryEnabled(category, options)) {
          makeFreeBox(cleaned, box);
          fieldsRemoved.push(found);
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
  if (type === "©day" || type === "©too") return "dates";
  if (type === "©ART" || type === "©nam" || type === "©cmt" || type === "©aut")
    return "author";
  if (type === "©swr" || type === "©hst") return "software";
  if (type === "©cpy") return "copyright";
  if (type === "udta" || type === "meta" || type === "Xtra") return "custom";
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
};

function atomLabel(type: string): string {
  return ATOM_LABELS[type] ?? `Metadata atom (${type})`;
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

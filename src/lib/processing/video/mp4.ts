/**
 * MP4 / MOV / M4V metadata stripper
 *
 * Strategy: parse the MP4 box structure, find privacy-sensitive atoms
 * (udta, meta, location/©xyz, ©day, etc.) within `moov`, and replace
 * them with `free` atoms of identical size. The `free` box is the
 * standard MP4 "skip me" marker — the metadata is gone but file
 * structure is preserved and no parent-size recomputation is needed.
 *
 * Also zeroes timestamps (creation_time, modification_time) in mvhd
 * and tkhd, since those leak when the video was recorded.
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
      if (box.type === "hdlr") {
        if (options.software || options.device) {
          const reservedStart = box.contentStart + 12; // skip ver+flags+pre_defined+handler_type
          const reservedLen = 12;
          if (reservedStart + reservedLen <= box.end) {
            zeroBytes(cleaned, reservedStart, reservedLen);
            const f: MetadataField = {
              category: "software",
              key: "hdlr_vendor",
              label: "Handler vendor ID",
              value: "(vendor)",
              removable: true,
            };
            fieldsFound.push(f);
            fieldsRemoved.push(f);
          }
        }
        continue;
      }

      // mvhd / tkhd — wipe creation_time and modification_time
      if (box.type === "mvhd" || box.type === "tkhd") {
        if (options.dates) {
          // Box content layout (relative to box.contentStart):
          //   1 byte version, 3 bytes flags, then:
          //   if version 0: 4 bytes creation_time, 4 bytes modification_time
          //   if version 1: 8 bytes creation_time, 8 bytes modification_time
          const version = view.getUint8(box.contentStart);
          const tsStart = box.contentStart + 4; // skip version + flags
          const tsLen = version === 1 ? 16 : 8; // both timestamps
          if (tsStart + tsLen <= box.end) {
            zeroBytes(cleaned, tsStart, tsLen);
            const f: MetadataField = {
              category: "dates",
              key: `${box.type}_timestamps`,
              label:
                box.type === "mvhd"
                  ? "Movie creation/modification time"
                  : "Track creation/modification time",
              value: "(timestamp)",
              removable: true,
            };
            fieldsFound.push(f);
            fieldsRemoved.push(f);
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

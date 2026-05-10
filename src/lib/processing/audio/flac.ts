/**
 * FLAC metadata stripper.
 *
 * FLAC structure:
 *   "fLaC" magic (4 bytes)
 *   then a sequence of metadata blocks, each with:
 *     1 byte: bit 7 = "is last block" flag, bits 0-6 = block type
 *     3 bytes: block size (big-endian, content size, not including header)
 *     N bytes: block content
 *   then audio frames.
 *
 * Block types:
 *   0 STREAMINFO (mandatory, must be first, contains decoder params — KEEP)
 *   1 PADDING
 *   2 APPLICATION
 *   3 SEEKTABLE
 *   4 VORBIS_COMMENT  ← user metadata (artist, title, etc.)
 *   5 CUESHEET
 *   6 PICTURE         ← embedded album art
 *   7-126 reserved
 *
 * Strip strategy:
 *   Replace VORBIS_COMMENT and PICTURE blocks with PADDING blocks of
 *   identical size — preserves file structure exactly, no size
 *   recomputation. The 4-byte block header is rewritten with type=1
 *   (PADDING), and content bytes are zeroed.
 */

import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataReport,
} from "../types";

const ASCII = new TextDecoder("ascii");

interface BlockInfo {
  offset: number;
  type: number;
  size: number;
  isLast: boolean;
  contentStart: number;
  end: number;
}

function readBlockHeader(view: DataView, offset: number): BlockInfo | null {
  if (offset + 4 > view.byteLength) return null;
  const header = view.getUint8(offset);
  const isLast = (header & 0x80) !== 0;
  const type = header & 0x7f;
  const size =
    (view.getUint8(offset + 1) << 16) |
    (view.getUint8(offset + 2) << 8) |
    view.getUint8(offset + 3);
  const contentStart = offset + 4;
  const end = contentStart + size;
  if (end > view.byteLength) return null;
  return { offset, type, size, isLast, contentStart, end };
}

function categoryEnabled(
  category: MetadataField["category"],
  options: StripOptions
): boolean {
  return options[category] ?? true;
}

/**
 * Quick sniff at a Vorbis Comment block to enumerate which tags it
 * contains, for the report. Vorbis comment format:
 *   4 bytes: vendor length (LE)
 *   N bytes: vendor string
 *   4 bytes: number of comments (LE)
 *   then for each comment:
 *     4 bytes: length (LE)
 *     N bytes: "KEY=VALUE" UTF-8
 */
function enumerateVorbisComments(
  view: DataView,
  start: number,
  end: number
): MetadataField[] {
  const fields: MetadataField[] = [];
  if (start + 4 > end) return fields;

  let pos = start;
  // Skip vendor string
  const vendorLen = view.getUint32(pos, true);
  pos += 4 + vendorLen;
  if (pos + 4 > end) return fields;

  const numComments = view.getUint32(pos, true);
  pos += 4;

  const decoder = new TextDecoder("utf-8");
  for (let i = 0; i < numComments && pos + 4 < end; i++) {
    const len = view.getUint32(pos, true);
    pos += 4;
    if (pos + len > end) break;
    const text = decoder.decode(
      new Uint8Array(view.buffer, view.byteOffset + pos, len)
    );
    pos += len;
    const eq = text.indexOf("=");
    const key = (eq >= 0 ? text.slice(0, eq) : text).toUpperCase();
    fields.push({
      category: vorbisCategory(key),
      key,
      label: vorbisLabel(key),
      value: `(${len} bytes)`,
      removable: true,
    });
  }
  return fields;
}

function vorbisCategory(key: string): MetadataField["category"] {
  if (
    key === "ARTIST" ||
    key === "ALBUMARTIST" ||
    key === "COMPOSER" ||
    key === "PERFORMER" ||
    key === "LYRICIST"
  )
    return "author";
  if (key === "DATE" || key === "YEAR" || key === "ORIGINALDATE") return "dates";
  if (key === "COMMENT" || key === "DESCRIPTION") return "comments";
  if (key === "ENCODER" || key === "ENCODEDBY") return "software";
  if (key === "COPYRIGHT") return "copyright";
  return "custom";
}

function vorbisLabel(key: string): string {
  const labels: Record<string, string> = {
    ARTIST: "Artist",
    ALBUMARTIST: "Album artist",
    COMPOSER: "Composer",
    TITLE: "Title",
    ALBUM: "Album",
    DATE: "Date",
    GENRE: "Genre",
    TRACKNUMBER: "Track number",
    COMMENT: "Comment",
    ENCODER: "Encoder",
    COPYRIGHT: "Copyright",
  };
  return labels[key] ?? `Vorbis ${key}`;
}

export async function processFlac(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  try {
    const buffer = await file.arrayBuffer();
    const cleaned = new Uint8Array(buffer.byteLength);
    cleaned.set(new Uint8Array(buffer));
    const view = new DataView(cleaned.buffer);

    // Verify "fLaC" magic
    const magic = ASCII.decode(new Uint8Array(view.buffer, 0, 4));
    if (magic !== "fLaC") {
      return errorResult(file, "Not a FLAC file (missing fLaC magic)");
    }

    const fieldsFound: MetadataField[] = [];
    const fieldsRemoved: MetadataField[] = [];

    // Walk metadata blocks starting at offset 4
    let pos = 4;
    while (pos < view.byteLength) {
      const block = readBlockHeader(view, pos);
      if (!block) break;

      if (block.type === 4) {
        // VORBIS_COMMENT
        const comments = enumerateVorbisComments(view, block.contentStart, block.end);
        fieldsFound.push(...comments);
        const shouldStrip = comments.some((c) => categoryEnabled(c.category, options));
        if (shouldStrip || comments.length === 0) {
          // Replace block type with PADDING (1), keep size, zero content
          // Header byte: preserve "is last" bit, set type to 1
          const newHeader = (block.isLast ? 0x80 : 0x00) | 0x01;
          cleaned[block.offset] = newHeader;
          cleaned.fill(0, block.contentStart, block.end);
          fieldsRemoved.push(...comments);
        }
      } else if (block.type === 6) {
        // PICTURE — embedded album art. Often large, can leak source software.
        const f: MetadataField = {
          category: "custom",
          key: "FLAC_PICTURE",
          label: "Embedded picture (album art)",
          value: `(${block.size} bytes)`,
          removable: true,
        };
        fieldsFound.push(f);
        if (categoryEnabled("custom", options)) {
          const newHeader = (block.isLast ? 0x80 : 0x00) | 0x01;
          cleaned[block.offset] = newHeader;
          cleaned.fill(0, block.contentStart, block.end);
          fieldsRemoved.push(f);
        }
      }

      if (block.isLast) break;
      pos = block.end;
    }

    const cleanedBlob = new Blob([cleaned as BlobPart], { type: file.type });

    const report: MetadataReport = {
      fileName: file.name,
      fileType: "flac",
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
      err instanceof Error ? err.message : "Unknown error processing FLAC";
    return errorResult(file, message);
  }
}

function errorResult(file: File, message: string): ProcessingResult {
  return {
    originalFile: file,
    cleanedBlob: new Blob(),
    report: {
      fileName: file.name,
      fileType: "flac",
      fileSize: file.size,
      cleanedFileSize: 0,
      fieldsFound: [],
      fieldsRemoved: [],
      fieldsKept: [],
      processedAt: new Date(),
    },
    error: `FLAC processing failed: ${message}`,
  };
}

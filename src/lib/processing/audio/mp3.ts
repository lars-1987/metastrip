/**
 * MP3 metadata stripper — handles ID3v2 (front of file) and ID3v1
 * (last 128 bytes of file). Both can coexist.
 *
 * Strategy:
 *   1. Detect ID3v2 at offset 0 by "ID3" magic. If present, parse the
 *      header to find tag size, enumerate frames for the report, then
 *      slice it off.
 *   2. Detect ID3v1 at file.size - 128 by "TAG" magic. If present,
 *      enumerate fields and slice it off.
 *   3. Output is the audio frames sandwiched between (or with both
 *      sides removed if both tags were present).
 *
 * Audio frame data is never touched — this is a pure header/footer
 * truncation, similar to MP4's atom-replacement approach.
 */

import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataReport,
} from "../types";

/* ──────────────────────────────────────────────────────────────────
   ID3v2 frame ID → category mapping
   ────────────────────────────────────────────────────────────────── */

// Frame IDs are 4 chars in v2.3+, 3 chars in v2.2 (we map a few v2.2 codes too).
const FRAME_CATEGORIES: Record<string, MetadataField["category"]> = {
  // Authoring
  TPE1: "author", // Lead artist
  TPE2: "author", // Album artist (band)
  TPE3: "author", // Conductor
  TPE4: "author", // Interpreted, remixed by
  TCOM: "author", // Composer
  TEXT: "author", // Lyricist
  TOLY: "author", // Original lyricist
  TOPE: "author", // Original artist
  TIT1: "custom", // Content group
  TIT2: "custom", // Title
  TIT3: "custom", // Subtitle
  TALB: "custom", // Album
  TCON: "custom", // Genre
  TRCK: "custom", // Track
  TPOS: "custom", // Disc number
  // Dates
  TYER: "dates",
  TDAT: "dates",
  TIME: "dates",
  TDRC: "dates", // Recording date (v2.4)
  TDRL: "dates", // Release date
  TDOR: "dates", // Original release date
  TDEN: "dates", // Encoding date
  TDTG: "dates", // Tagging date
  // Software / encoding
  TENC: "software", // Encoded by
  TSSE: "software", // Software/hardware settings used for encoding
  TFLT: "software", // File type
  TMED: "software", // Media type
  // Copyright
  TCOP: "copyright",
  TPRO: "copyright",
  TOWN: "copyright",
  // Comments / lyrics
  COMM: "comments",
  USLT: "comments",
  SYLT: "comments",
  // URLs / identifiers — could leak personal info
  WXXX: "custom",
  WOAR: "custom",
  WOAS: "custom",
  WOAF: "custom",
  WCOM: "custom",
  WCOP: "custom",
  WORS: "custom",
  WPAY: "custom",
  WPUB: "custom",
  // Album art
  APIC: "custom",
  PIC: "custom", // v2.2 alias
  // Misc privacy-sensitive
  PRIV: "custom", // Private frame
  UFID: "custom", // Unique file identifier (often software-specific)
  POPM: "custom", // Popularity meter (often has email)
  GEOB: "custom", // General encapsulated object
  TXXX: "custom", // User-defined text — anything custom
};

/* ──────────────────────────────────────────────────────────────────
   ID3v2 parsing
   ────────────────────────────────────────────────────────────────── */

/** Synchsafe int → regular int. Each byte uses only 7 bits. */
function readSynchsafe(view: DataView, offset: number): number {
  return (
    (view.getUint8(offset) << 21) |
    (view.getUint8(offset + 1) << 14) |
    (view.getUint8(offset + 2) << 7) |
    view.getUint8(offset + 3)
  );
}

const ASCII = new TextDecoder("ascii");

interface Id3v2Info {
  /** Number of bytes to skip from start of file */
  skipBytes: number;
  /** Frames found, for the report */
  frames: MetadataField[];
  /** Major version (3 or 4 typically; 2 for legacy) */
  version: number;
}

function parseId3v2(view: DataView): Id3v2Info | null {
  if (view.byteLength < 10) return null;

  // Check "ID3" magic
  const magic = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset, 3));
  if (magic !== "ID3") return null;

  const major = view.getUint8(3);
  const flags = view.getUint8(5);
  const tagSize = readSynchsafe(view, 6);
  const totalSize = 10 + tagSize; // header + frames

  // If extended header flag set, skip it
  let pos = 10;
  if (flags & 0x40) {
    if (pos + 4 > view.byteLength) return null;
    const extSize = major >= 4 ? readSynchsafe(view, pos) : view.getUint32(pos);
    pos += extSize;
  }

  // Walk frames for the report. We don't need to parse content, just enumerate IDs.
  const frames: MetadataField[] = [];
  const frameIdLen = major === 2 ? 3 : 4;
  const frameSizeLen = major === 2 ? 3 : 4;
  const frameHeaderLen = major === 2 ? 6 : 10;
  const tagEnd = totalSize;

  while (pos + frameHeaderLen <= tagEnd && pos + frameHeaderLen <= view.byteLength) {
    const frameId = ASCII.decode(
      new Uint8Array(view.buffer, view.byteOffset + pos, frameIdLen)
    );

    // Padding starts when we hit null bytes
    if (frameId.charCodeAt(0) === 0) break;
    if (!/^[A-Z0-9]+$/.test(frameId)) break; // malformed frame ID

    let frameSize: number;
    if (major === 2) {
      // 3 bytes big-endian
      frameSize =
        (view.getUint8(pos + 3) << 16) |
        (view.getUint8(pos + 4) << 8) |
        view.getUint8(pos + 5);
    } else if (major === 4) {
      frameSize = readSynchsafe(view, pos + frameIdLen);
    } else {
      // v2.3 — regular u32
      frameSize = view.getUint32(pos + frameIdLen);
    }

    const category = FRAME_CATEGORIES[frameId] ?? "custom";
    frames.push({
      category,
      key: frameId,
      label: frameLabel(frameId),
      value: `(${frameSize} bytes)`,
      removable: true,
    });

    pos += frameHeaderLen + frameSize;
  }

  return {
    skipBytes: totalSize,
    frames,
    version: major,
  };
}

const FRAME_LABELS: Record<string, string> = {
  TPE1: "Lead artist",
  TPE2: "Album artist",
  TCOM: "Composer",
  TIT2: "Title",
  TALB: "Album",
  TCON: "Genre",
  TRCK: "Track number",
  TYER: "Year",
  TDRC: "Recording date",
  TENC: "Encoded by",
  TSSE: "Encoder settings",
  TCOP: "Copyright",
  COMM: "Comment",
  USLT: "Unsynchronised lyrics",
  WXXX: "User-defined URL",
  WOAR: "Artist URL",
  APIC: "Album art",
  PRIV: "Private frame",
  TXXX: "User-defined text",
  POPM: "Popularimeter (often contains email)",
  UFID: "Unique file identifier",
};

function frameLabel(id: string): string {
  return FRAME_LABELS[id] ?? `ID3v2 frame (${id})`;
}

/* ──────────────────────────────────────────────────────────────────
   ID3v1 parsing (last 128 bytes)
   ────────────────────────────────────────────────────────────────── */

interface Id3v1Info {
  /** Number of bytes to remove from end of file */
  trimBytes: number;
  fields: MetadataField[];
}

function parseId3v1(view: DataView): Id3v1Info | null {
  if (view.byteLength < 128) return null;

  const start = view.byteLength - 128;
  const magic = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + start, 3));
  if (magic !== "TAG") return null;

  // ID3v1 layout is fixed:
  // 3  TAG magic
  // 30 title
  // 30 artist
  // 30 album
  // 4  year
  // 30 comment (or 28 + zero + track in v1.1)
  // 1  genre
  const fields: MetadataField[] = [
    { category: "custom", key: "ID3v1_title", label: "ID3v1 title", value: "(30 bytes)", removable: true },
    { category: "author", key: "ID3v1_artist", label: "ID3v1 artist", value: "(30 bytes)", removable: true },
    { category: "custom", key: "ID3v1_album", label: "ID3v1 album", value: "(30 bytes)", removable: true },
    { category: "dates", key: "ID3v1_year", label: "ID3v1 year", value: "(4 bytes)", removable: true },
    { category: "comments", key: "ID3v1_comment", label: "ID3v1 comment", value: "(30 bytes)", removable: true },
  ];

  return {
    trimBytes: 128,
    fields,
  };
}

/* ──────────────────────────────────────────────────────────────────
   Public API
   ────────────────────────────────────────────────────────────────── */

function categoryEnabled(
  category: MetadataField["category"],
  options: StripOptions
): boolean {
  return options[category] ?? true;
}

export async function processMp3(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  try {
    const buffer = await file.arrayBuffer();
    const view = new DataView(buffer);

    const fieldsFound: MetadataField[] = [];
    const fieldsRemoved: MetadataField[] = [];

    // Front: ID3v2 tag
    const id3v2 = parseId3v2(view);
    let audioStart = 0;
    if (id3v2) {
      fieldsFound.push(...id3v2.frames);
      // We strip the entire ID3v2 tag wholesale — it's all metadata and the audio
      // frames begin immediately after. If ANY enabled category is present in the
      // frames, we strip the tag. (Granular per-category strip would require
      // rewriting the tag, which is more complex; user-facing behavior is "strip
      // the metadata block" which matches expectation.)
      const anyEnabled = id3v2.frames.some((f) => categoryEnabled(f.category, options));
      if (anyEnabled || id3v2.frames.length === 0) {
        audioStart = id3v2.skipBytes;
        fieldsRemoved.push(...id3v2.frames);
      }
    }

    // Tail: ID3v1 tag
    const id3v1 = parseId3v1(view);
    let audioEnd = buffer.byteLength;
    if (id3v1) {
      fieldsFound.push(...id3v1.fields);
      const anyEnabled = id3v1.fields.some((f) => categoryEnabled(f.category, options));
      if (anyEnabled) {
        audioEnd = buffer.byteLength - id3v1.trimBytes;
        fieldsRemoved.push(...id3v1.fields);
      }
    }

    // Slice out the audio data. If neither tag was found, this is a no-op
    // (audioStart=0, audioEnd=byteLength) and the file copies through.
    const cleanedBlob =
      audioStart === 0 && audioEnd === buffer.byteLength
        ? new Blob([buffer], { type: file.type })
        : new Blob([buffer.slice(audioStart, audioEnd)], { type: file.type });

    const report: MetadataReport = {
      fileName: file.name,
      fileType: "mp3",
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
      err instanceof Error ? err.message : "Unknown error processing MP3";
    return {
      originalFile: file,
      cleanedBlob: new Blob(),
      report: {
        fileName: file.name,
        fileType: "mp3",
        fileSize: file.size,
        cleanedFileSize: 0,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: `MP3 processing failed: ${message}`,
    };
  }
}

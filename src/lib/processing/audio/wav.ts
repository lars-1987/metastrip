/**
 * WAV (RIFF) metadata stripper.
 *
 * Structure:
 *   "RIFF" (4)
 *   total file size minus 8 (4, LE)
 *   "WAVE" (4)
 *   then chunks. Each chunk:
 *     4 bytes: chunk ID
 *     4 bytes: chunk size (LE)
 *     N bytes: payload
 *     1 byte padding if size is odd
 *
 * Metadata-bearing chunks we strip:
 *   "LIST" with "INFO" subtype — contains IART, INAM, ICMT, ICRD, ISFT, etc.
 *   "id3 " — embedded ID3v2 tag (rare but happens)
 *   "bext" — Broadcast Wave Format extension (description, originator, etc.)
 *   "iXML" / "_PMX" — XML metadata
 *
 * We also strip "JUNK" of 0 size if it exists post-metadata — but
 * mostly we focus on LIST/INFO since that's where DAW software writes
 * artist/title/etc.
 *
 * Strip strategy: replace target chunk's ID with "JUNK" (a recognized
 * "ignore me" chunk type in RIFF) and zero the payload.
 */

import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataReport,
} from "../types";

const ASCII = new TextDecoder("ascii");

interface ChunkInfo {
  offset: number;
  id: string;
  size: number;
  contentStart: number;
  end: number; // includes padding byte if size is odd
}

function readChunk(view: DataView, offset: number): ChunkInfo | null {
  if (offset + 8 > view.byteLength) return null;
  const id = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + offset, 4));
  const size = view.getUint32(offset + 4, true);
  const contentStart = offset + 8;
  const padded = size + (size & 1); // chunks are word-aligned
  const end = contentStart + padded;
  if (end > view.byteLength) return null;
  return { offset, id, size, contentStart, end };
}

function writeAscii(buf: Uint8Array, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) buf[offset + i] = text.charCodeAt(i);
}

const STRIP_CHUNK_IDS = new Set(["LIST", "id3 ", "bext", "iXML", "_PMX"]);

const INFO_FIELD_LABELS: Record<string, string> = {
  IART: "Artist",
  INAM: "Title",
  IPRD: "Album",
  ICMT: "Comment",
  ICRD: "Creation date",
  IGNR: "Genre",
  ISFT: "Software (encoder)",
  ITRK: "Track number",
  IENG: "Engineer",
  ITCH: "Technician",
  ICOP: "Copyright",
  IKEY: "Keywords",
  ISRC: "Source",
  ISBJ: "Subject",
};

function infoCategory(id: string): MetadataField["category"] {
  if (id === "IART" || id === "IENG" || id === "ITCH") return "author";
  if (id === "ICRD") return "dates";
  if (id === "ICMT" || id === "ISBJ") return "comments";
  if (id === "ISFT") return "software";
  if (id === "ICOP") return "copyright";
  return "custom";
}

function categoryEnabled(
  category: MetadataField["category"],
  options: StripOptions
): boolean {
  return options[category] ?? true;
}

/** Walk a LIST/INFO chunk to enumerate which INFO subchunks it has, for the report. */
function enumerateInfoChunks(view: DataView, start: number, end: number): MetadataField[] {
  const fields: MetadataField[] = [];
  // LIST chunk content starts with 4-byte form type ("INFO" for metadata)
  if (start + 4 > end) return fields;
  const formType = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + start, 4));
  if (formType !== "INFO") return fields;
  let pos = start + 4;
  while (pos + 8 <= end) {
    const sub = readChunk(view, pos);
    if (!sub) break;
    fields.push({
      category: infoCategory(sub.id),
      key: sub.id,
      label: INFO_FIELD_LABELS[sub.id] ?? `INFO ${sub.id}`,
      value: `(${sub.size} bytes)`,
      removable: true,
    });
    pos = sub.end;
  }
  return fields;
}

export async function processWav(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  try {
    const buffer = await file.arrayBuffer();
    const cleaned = new Uint8Array(buffer.byteLength);
    cleaned.set(new Uint8Array(buffer));
    const view = new DataView(cleaned.buffer);

    if (view.byteLength < 12) {
      return errorResult(file, "File too small to be a valid WAV");
    }

    const riff = ASCII.decode(new Uint8Array(view.buffer, 0, 4));
    const wave = ASCII.decode(new Uint8Array(view.buffer, 8, 4));
    if (riff !== "RIFF" || wave !== "WAVE") {
      return errorResult(file, "Not a WAV file (missing RIFF/WAVE magic)");
    }

    const fieldsFound: MetadataField[] = [];
    const fieldsRemoved: MetadataField[] = [];

    // Walk top-level chunks starting at offset 12
    let pos = 12;
    while (pos < view.byteLength) {
      const chunk = readChunk(view, pos);
      if (!chunk) break;

      if (STRIP_CHUNK_IDS.has(chunk.id)) {
        let chunkFields: MetadataField[] = [];

        if (chunk.id === "LIST") {
          chunkFields = enumerateInfoChunks(view, chunk.contentStart, chunk.contentStart + chunk.size);
        } else {
          // bext, id3 , iXML, _PMX — we don't dig in, just report & strip
          chunkFields = [
            {
              category:
                chunk.id === "bext" ? "author" : chunk.id === "id3 " ? "custom" : "custom",
              key: chunk.id.trim(),
              label:
                chunk.id === "bext"
                  ? "Broadcast Wave extension"
                  : chunk.id === "id3 "
                  ? "Embedded ID3 tag"
                  : chunk.id === "iXML"
                  ? "iXML metadata"
                  : "Pro Tools metadata",
              value: `(${chunk.size} bytes)`,
              removable: true,
            },
          ];
        }

        fieldsFound.push(...chunkFields);
        const shouldStrip =
          chunkFields.length === 0 ||
          chunkFields.some((f) => categoryEnabled(f.category, options));

        if (shouldStrip) {
          // Rename chunk to "JUNK" — RIFF parsers ignore JUNK chunks.
          // Keep size identical so file structure (and RIFF total size) stays valid.
          writeAscii(cleaned, chunk.offset, "JUNK");
          // Zero payload for paranoia
          cleaned.fill(0, chunk.contentStart, chunk.contentStart + chunk.size);
          fieldsRemoved.push(...chunkFields);
        }
      }

      pos = chunk.end;
    }

    const cleanedBlob = new Blob([cleaned as BlobPart], { type: file.type });

    const report: MetadataReport = {
      fileName: file.name,
      fileType: "wav",
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
      err instanceof Error ? err.message : "Unknown error processing WAV";
    return errorResult(file, message);
  }
}

function errorResult(file: File, message: string): ProcessingResult {
  return {
    originalFile: file,
    cleanedBlob: new Blob(),
    report: {
      fileName: file.name,
      fileType: "wav",
      fileSize: file.size,
      cleanedFileSize: 0,
      fieldsFound: [],
      fieldsRemoved: [],
      fieldsKept: [],
      processedAt: new Date(),
    },
    error: `WAV processing failed: ${message}`,
  };
}

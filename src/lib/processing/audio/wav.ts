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

import type { StripOptions, MetadataField } from "../types";
import { Unreadable, blockGoes, type Stripped } from "../contract";

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
  // Chunks are word-aligned, but many writers leave out the pad byte after
  // an odd-sized last chunk, so only the unpadded size has to fit.
  if (contentStart + size > view.byteLength) return null;
  const end = Math.min(contentStart + size + (size & 1), view.byteLength);
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

export function stripWav(bytes: Uint8Array, options: StripOptions): Stripped {
  if (
    bytes.length < 12 ||
    ASCII.decode(bytes.subarray(0, 4)) !== "RIFF" ||
    ASCII.decode(bytes.subarray(8, 12)) !== "WAVE"
  ) {
    throw new Unreadable();
  }
  const cleaned = bytes.slice();
  const view = new DataView(cleaned.buffer);

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];

  // Walk top-level chunks starting at offset 12
  let pos = 12;
  while (pos + 8 <= view.byteLength) {
    const chunk = readChunk(view, pos);
    if (!chunk) {
      // Cut short. Audio data running off the end is a partial download,
      // and holds no metadata; any other chunk might, so the file is
      // unreadable rather than passed through with it.
      if (ASCII.decode(cleaned.subarray(pos, pos + 4)) === "data") break;
      throw new Unreadable();
    }

    if (STRIP_CHUNK_IDS.has(chunk.id)) {
      let chunkFields: MetadataField[] = [];

      if (chunk.id === "LIST") {
        chunkFields = enumerateInfoChunks(view, chunk.contentStart, chunk.contentStart + chunk.size);
      } else {
        // bext, id3 , iXML, _PMX: we don't dig in, just report & strip
        chunkFields = [
          {
            category: chunk.id === "bext" ? "author" : "custom",
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
      if (blockGoes(chunkFields, options)) {
        // Rename chunk to "JUNK": RIFF parsers ignore JUNK chunks. Keep size
        // identical so file structure (and RIFF total size) stays valid.
        writeAscii(cleaned, chunk.offset, "JUNK");
        // Zero payload for paranoia
        cleaned.fill(0, chunk.contentStart, chunk.contentStart + chunk.size);
        fieldsRemoved.push(...chunkFields);
      }
    }

    pos = chunk.end;
  }

  return { cleaned, fieldsFound, fieldsRemoved };
}

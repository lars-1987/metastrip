import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

// PNG signature: 8 bytes
const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);

// Metadata chunk types to strip.
// `caBX` holds the C2PA manifest store (content credentials / provenance) — the
// PNG binding for a JUMBF C2PA box. AI generators (DALL-E, Gemini, Firefly, etc.)
// embed it, and it is invisible to text-chunk parsing, so it must be listed here
// explicitly or it sails straight through.
const METADATA_CHUNKS = new Set([
  "tEXt",
  "iTXt",
  "zTXt",
  "eXIf",
  "tIME",
  "caBX",
]);

// Map PNG text keywords to metadata categories
const TEXT_KEYWORD_CATEGORIES: Record<string, MetadataCategory> = {
  Author: "author",
  Artist: "author",
  "Creation Time": "dates",
  Description: "custom",
  Comment: "comments",
  Copyright: "copyright",
  Software: "software",
  Source: "custom",
  Title: "custom",
  Warning: "custom",
  Disclaimer: "custom",
};

interface PngChunk {
  type: string;
  data: Uint8Array;
  crc: number;
}

function readUint32BE(data: Uint8Array, offset: number): number {
  return (
    ((data[offset] << 24) |
      (data[offset + 1] << 16) |
      (data[offset + 2] << 8) |
      data[offset + 3]) >>>
    0
  );
}

function writeUint32BE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  buf[0] = (value >>> 24) & 0xff;
  buf[1] = (value >>> 16) & 0xff;
  buf[2] = (value >>> 8) & 0xff;
  buf[3] = value & 0xff;
  return buf;
}

// CRC32 lookup table
const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    table[n] = c;
  }
  return table;
})();

function crc32(data: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function computeChunkCRC(type: string, data: Uint8Array): number {
  const typeBytes = new TextEncoder().encode(type);
  const combined = new Uint8Array(typeBytes.length + data.length);
  combined.set(typeBytes, 0);
  combined.set(data, typeBytes.length);
  return crc32(combined);
}

function parseChunks(buffer: Uint8Array): PngChunk[] {
  const chunks: PngChunk[] = [];
  let offset = 8; // Skip PNG signature

  while (offset < buffer.length) {
    if (offset + 8 > buffer.length) break;

    const length = readUint32BE(buffer, offset);
    const typeBytes = buffer.slice(offset + 4, offset + 8);
    const type = new TextDecoder().decode(typeBytes);

    if (offset + 12 + length > buffer.length) break;

    const data = buffer.slice(offset + 8, offset + 8 + length);
    const storedCrc = readUint32BE(buffer, offset + 8 + length);

    chunks.push({ type, data, crc: storedCrc });
    offset += 12 + length;
  }

  return chunks;
}

function parseTextChunk(data: Uint8Array): { keyword: string; value: string } | null {
  // tEXt: keyword (null-terminated) + text
  const nullIdx = data.indexOf(0);
  if (nullIdx < 0) return null;

  const keyword = new TextDecoder("latin1").decode(data.slice(0, nullIdx));
  const value = new TextDecoder("latin1").decode(data.slice(nullIdx + 1));
  return { keyword, value };
}

function parseITxtChunk(data: Uint8Array): { keyword: string; value: string } | null {
  // iTXt: keyword\0 + compression_flag + compression_method + language\0 + translated_keyword\0 + text
  const nullIdx = data.indexOf(0);
  if (nullIdx < 0) return null;

  const keyword = new TextDecoder().decode(data.slice(0, nullIdx));
  // Skip compression flag (1 byte), compression method (1 byte)
  let pos = nullIdx + 3;
  // Skip language tag (null-terminated)
  const langEnd = data.indexOf(0, pos);
  if (langEnd < 0) return { keyword, value: "" };
  pos = langEnd + 1;
  // Skip translated keyword (null-terminated)
  const transEnd = data.indexOf(0, pos);
  if (transEnd < 0) return { keyword, value: "" };
  pos = transEnd + 1;

  const value = new TextDecoder().decode(data.slice(pos));
  return { keyword, value };
}

function parseTimeChunk(data: Uint8Array): string {
  if (data.length < 7) return "";
  const year = (data[0] << 8) | data[1];
  const month = data[2];
  const day = data[3];
  const hour = data[4];
  const minute = data[5];
  const second = data[6];
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
}

function catalogueChunkFields(chunk: PngChunk): MetadataField[] {
  const fields: MetadataField[] = [];

  if (chunk.type === "tEXt") {
    const parsed = parseTextChunk(chunk.data);
    if (parsed) {
      const category = TEXT_KEYWORD_CATEGORIES[parsed.keyword] || "custom";
      fields.push({
        category,
        key: parsed.keyword,
        label: parsed.keyword,
        value: parsed.value.length > 200 ? parsed.value.slice(0, 200) + "..." : parsed.value,
        removable: true,
      });
    }
  } else if (chunk.type === "iTXt") {
    const parsed = parseITxtChunk(chunk.data);
    if (parsed) {
      const category = TEXT_KEYWORD_CATEGORIES[parsed.keyword] || "custom";
      fields.push({
        category,
        key: parsed.keyword,
        label: `${parsed.keyword} (iTXt)`,
        value: parsed.value.length > 200 ? parsed.value.slice(0, 200) + "..." : parsed.value,
        removable: true,
      });
    }
  } else if (chunk.type === "zTXt") {
    // zTXt: keyword\0 + compression_method + compressed_text
    const nullIdx = chunk.data.indexOf(0);
    if (nullIdx >= 0) {
      const keyword = new TextDecoder("latin1").decode(chunk.data.slice(0, nullIdx));
      const category = TEXT_KEYWORD_CATEGORIES[keyword] || "custom";
      fields.push({
        category,
        key: keyword,
        label: `${keyword} (compressed)`,
        value: "(compressed text data)",
        removable: true,
      });
    }
  } else if (chunk.type === "tIME") {
    fields.push({
      category: "dates",
      key: "tIME",
      label: "Last Modification Time",
      value: parseTimeChunk(chunk.data),
      removable: true,
    });
  } else if (chunk.type === "eXIf") {
    fields.push({
      category: "device",
      key: "eXIf",
      label: "Embedded EXIF Data",
      value: `(${chunk.data.length} bytes)`,
      removable: true,
    });
  } else if (chunk.type === "caBX") {
    fields.push({
      category: "ai",
      key: "C2PA",
      label: "C2PA Content Credential",
      value: `(${chunk.data.length} bytes)`,
      removable: true,
    });
  }

  return fields;
}

function rebuildPng(chunks: PngChunk[]): Uint8Array {
  // Calculate total size
  let totalSize = 8; // signature
  for (const chunk of chunks) {
    totalSize += 12 + chunk.data.length; // length(4) + type(4) + data + crc(4)
  }

  const result = new Uint8Array(totalSize);
  result.set(PNG_SIGNATURE, 0);
  let offset = 8;

  for (const chunk of chunks) {
    // Length
    result.set(writeUint32BE(chunk.data.length), offset);
    offset += 4;
    // Type
    const typeBytes = new TextEncoder().encode(chunk.type);
    result.set(typeBytes, offset);
    offset += 4;
    // Data
    result.set(chunk.data, offset);
    offset += chunk.data.length;
    // CRC (recompute to be safe)
    const newCrc = computeChunkCRC(chunk.type, chunk.data);
    result.set(writeUint32BE(newCrc), offset);
    offset += 4;
  }

  return result;
}

export async function processPng(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Verify PNG signature
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== PNG_SIGNATURE[i]) {
      const blob = new Blob([arrayBuffer], { type: file.type });
      return {
        originalFile: file,
        cleanedBlob: blob,
        report: {
          fileName: file.name,
          fileType: "png",
          fileSize: file.size,
          cleanedFileSize: blob.size,
          fieldsFound: [],
          fieldsRemoved: [],
          fieldsKept: [],
          processedAt: new Date(),
        },
        error: "Invalid PNG file",
      };
    }
  }

  const chunks = parseChunks(buffer);
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

  // Determine categories to strip
  const categoriesToStrip = (
    Object.entries(options) as [MetadataCategory, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([cat]) => cat);

  // Catalogue metadata from metadata chunks
  for (const chunk of chunks) {
    if (METADATA_CHUNKS.has(chunk.type)) {
      const fields = catalogueChunkFields(chunk);
      fieldsFound.push(...fields);
    }
  }

  // Classify fields as removed or kept
  for (const field of fieldsFound) {
    if (categoriesToStrip.includes(field.category)) {
      fieldsRemoved.push(field);
    } else {
      fieldsKept.push(field);
    }
  }

  // Filter out metadata chunks whose fields are all being removed
  const keptChunks = chunks.filter((chunk) => {
    if (!METADATA_CHUNKS.has(chunk.type)) return true;

    // Check if any fields from this chunk type are being kept
    const chunkFields = catalogueChunkFields(chunk);
    return chunkFields.some(
      (f) => !categoriesToStrip.includes(f.category)
    );
  });

  const cleanedBuffer = rebuildPng(keptChunks);
  const cleanedBlob = new Blob([cleanedBuffer.buffer as ArrayBuffer], { type: "image/png" });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "png",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

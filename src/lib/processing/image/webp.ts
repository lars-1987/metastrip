import type {
  StripOptions,
  MetadataField,
} from "../types";
import { Unreadable, blockGoes, type Stripped } from "../contract";
import { describeC2pa } from "../c2pa-manifest";
import { stripExif } from "./exif";
import { stripXmp } from "../xmp";

// RIFF header: "RIFF" + 4-byte LE size + "WEBP"
const RIFF_HEADER = new TextEncoder().encode("RIFF");
const WEBP_FOURCC = new TextEncoder().encode("WEBP");

// Metadata chunk FourCCs to strip. "C2PA" holds the content-credential /
// provenance manifest (the WebP binding for a JUMBF C2PA box) that AI
// generators embed; without it listed here the manifest passes straight through.
const METADATA_CHUNKS = new Set(["EXIF", "XMP ", "C2PA"]);

function readUint32LE(data: Uint8Array, offset: number): number {
  return (
    (data[offset] |
      (data[offset + 1] << 8) |
      (data[offset + 2] << 16) |
      (data[offset + 3] << 24)) >>>
    0
  );
}

function writeUint32LE(value: number): Uint8Array {
  const buf = new Uint8Array(4);
  buf[0] = value & 0xff;
  buf[1] = (value >>> 8) & 0xff;
  buf[2] = (value >>> 16) & 0xff;
  buf[3] = (value >>> 24) & 0xff;
  return buf;
}

interface RiffChunk {
  fourcc: string;
  data: Uint8Array;
}

function parseRiffChunks(buffer: Uint8Array): RiffChunk[] {
  const chunks: RiffChunk[] = [];
  let offset = 12; // Skip "RIFF" + size + "WEBP"

  while (offset + 8 <= buffer.length) {
    const fourcc = new TextDecoder().decode(buffer.slice(offset, offset + 4));
    const size = readUint32LE(buffer, offset + 4);

    // Cut short: unreadable, rather than quietly dropping every chunk after
    // this one, which used to lose the image data.
    if (offset + 8 + size > buffer.length) throw new Unreadable();

    const data = buffer.slice(offset + 8, offset + 8 + size);
    chunks.push({ fourcc, data });

    // Chunks are padded to even size
    const paddedSize = size + (size % 2);
    offset += 8 + paddedSize;
  }

  return chunks;
}

function catalogueChunkFields(chunk: RiffChunk): MetadataField[] {
  if (chunk.fourcc === "C2PA") {
    // What made the image and whose certificate signed it, not just a size.
    return describeC2pa(chunk.data);
  }
  return [];
}

function updateVP8XFlags(chunks: RiffChunk[], removedFourccs: Set<string>): void {
  // VP8X chunk contains feature flags that indicate presence of EXIF/XMP/ICCP
  const vp8xChunk = chunks.find((c) => c.fourcc === "VP8X");
  if (!vp8xChunk || vp8xChunk.data.length < 4) return;

  let flags = vp8xChunk.data[0];

  // Bit 3 (0x08): EXIF metadata
  if (removedFourccs.has("EXIF")) {
    flags &= ~0x08;
  }
  // Bit 2 (0x04): XMP metadata
  if (removedFourccs.has("XMP ")) {
    flags &= ~0x04;
  }

  // Write updated flags back
  const newData = new Uint8Array(vp8xChunk.data);
  newData[0] = flags;
  vp8xChunk.data = newData;
}

function rebuildWebp(chunks: RiffChunk[]): Uint8Array {
  // Calculate payload size (everything after "RIFF" + size)
  let payloadSize = 4; // "WEBP" fourcc
  for (const chunk of chunks) {
    const paddedSize = chunk.data.length + (chunk.data.length % 2);
    payloadSize += 8 + paddedSize; // fourcc(4) + size(4) + data (padded)
  }

  const result = new Uint8Array(8 + payloadSize);
  // RIFF header
  result.set(RIFF_HEADER, 0);
  result.set(writeUint32LE(payloadSize), 4);
  result.set(WEBP_FOURCC, 8);

  let offset = 12;
  for (const chunk of chunks) {
    // FourCC
    const fourccBytes = new TextEncoder().encode(chunk.fourcc);
    result.set(fourccBytes, offset);
    offset += 4;
    // Size (unpadded)
    result.set(writeUint32LE(chunk.data.length), offset);
    offset += 4;
    // Data
    result.set(chunk.data, offset);
    offset += chunk.data.length;
    // Padding byte if odd size
    if (chunk.data.length % 2 !== 0) {
      result[offset] = 0;
      offset += 1;
    }
  }

  return result;
}

export function stripWebp(buffer: Uint8Array, options: StripOptions): Stripped {
  if (
    buffer.length < 12 ||
    new TextDecoder().decode(buffer.slice(0, 4)) !== "RIFF" ||
    new TextDecoder().decode(buffer.slice(8, 12)) !== "WEBP"
  ) {
    throw new Unreadable();
  }

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const removedFourccs = new Set<string>();

  // EXIF goes through the EXIF reader, tag by tag, and XMP through the XMP
  // reader. Every other metadata chunk goes whole or stays whole, and only the fields of a chunk that
  // really went are reported removed.
  const keptChunks = parseRiffChunks(buffer).filter((chunk) => {
    if (chunk.fourcc === "EXIF") {
      const exif = stripExif(chunk.data, options);
      fieldsFound.push(...exif.fieldsFound);
      fieldsRemoved.push(...exif.fieldsRemoved);
      if (exif.cleaned === null) {
        removedFourccs.add("EXIF");
        return false;
      }
      chunk.data = exif.cleaned;
      return true;
    }
    if (chunk.fourcc === "XMP ") {
      const xmp = stripXmp(new TextDecoder().decode(chunk.data), options);
      fieldsFound.push(...xmp.fieldsFound);
      fieldsRemoved.push(...xmp.fieldsRemoved);
      if (xmp.goes) removedFourccs.add("XMP ");
      return !xmp.goes;
    }
    if (!METADATA_CHUNKS.has(chunk.fourcc)) return true;
    const fields = catalogueChunkFields(chunk);
    fieldsFound.push(...fields);
    if (!blockGoes(fields, options)) return true;
    fieldsRemoved.push(...fields);
    removedFourccs.add(chunk.fourcc);
    return false;
  });

  // Update VP8X feature flags to reflect removed chunks
  updateVP8XFlags(keptChunks, removedFourccs);

  return { cleaned: rebuildWebp(keptChunks), fieldsFound, fieldsRemoved };
}

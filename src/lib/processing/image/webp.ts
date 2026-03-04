import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

// RIFF header: "RIFF" + 4-byte LE size + "WEBP"
const RIFF_HEADER = new TextEncoder().encode("RIFF");
const WEBP_FOURCC = new TextEncoder().encode("WEBP");

// Metadata chunk FourCCs to strip
const METADATA_CHUNKS = new Set(["EXIF", "XMP "]);

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

    if (offset + 8 + size > buffer.length) break;

    const data = buffer.slice(offset + 8, offset + 8 + size);
    chunks.push({ fourcc, data });

    // Chunks are padded to even size
    const paddedSize = size + (size % 2);
    offset += 8 + paddedSize;
  }

  return chunks;
}

function catalogueExifFields(data: Uint8Array): MetadataField[] {
  // Basic EXIF cataloguing — report as a single block
  // Full EXIF parsing would require piexifjs but WebP EXIF chunks
  // may not have the JPEG wrapper piexifjs expects
  const fields: MetadataField[] = [];

  fields.push({
    category: "device",
    key: "EXIF",
    label: "Embedded EXIF Data",
    value: `(${data.length} bytes)`,
    removable: true,
  });

  // Try to extract some readable strings from raw EXIF
  const text = new TextDecoder("latin1").decode(data);

  // Look for common EXIF string patterns
  const patterns: { pattern: RegExp; key: string; label: string; category: MetadataCategory }[] = [
    { pattern: /Apple/i, key: "exif-make", label: "Camera Make", category: "device" },
    { pattern: /Canon/i, key: "exif-make", label: "Camera Make", category: "device" },
    { pattern: /Nikon/i, key: "exif-make", label: "Camera Make", category: "device" },
    { pattern: /Samsung/i, key: "exif-make", label: "Camera Make", category: "device" },
    { pattern: /Google/i, key: "exif-make", label: "Camera Make", category: "device" },
    { pattern: /Adobe Photoshop/i, key: "exif-software", label: "Software", category: "software" },
    { pattern: /GIMP/i, key: "exif-software", label: "Software", category: "software" },
  ];

  for (const p of patterns) {
    const match = text.match(p.pattern);
    if (match) {
      // Avoid duplicates
      if (!fields.some((f) => f.key === p.key)) {
        fields.push({
          category: p.category,
          key: p.key,
          label: p.label,
          value: `(detected: ${match[0]})`,
          removable: true,
        });
      }
    }
  }

  return fields;
}

function catalogueXmpFields(data: Uint8Array): MetadataField[] {
  const fields: MetadataField[] = [];
  const text = new TextDecoder().decode(data);

  fields.push({
    category: "custom",
    key: "XMP",
    label: "XMP Metadata",
    value: `(${data.length} bytes)`,
    removable: true,
  });

  // Extract some common XMP values
  const xmpPatterns: { tag: string; label: string; category: MetadataCategory }[] = [
    { tag: "dc:creator", label: "Creator", category: "author" },
    { tag: "xmp:CreatorTool", label: "Creator Tool", category: "software" },
    { tag: "xmp:CreateDate", label: "Create Date", category: "dates" },
    { tag: "xmp:ModifyDate", label: "Modify Date", category: "dates" },
    { tag: "dc:rights", label: "Rights", category: "copyright" },
    { tag: "dc:description", label: "Description", category: "custom" },
    { tag: "dc:title", label: "Title", category: "custom" },
    { tag: "photoshop:Credit", label: "Credit", category: "author" },
  ];

  for (const p of xmpPatterns) {
    const tagPattern = new RegExp(`<${p.tag}[^>]*>([^<]+)</${p.tag}>`, "i");
    const match = text.match(tagPattern);
    if (match) {
      fields.push({
        category: p.category,
        key: `xmp-${p.tag}`,
        label: p.label,
        value: match[1].trim().slice(0, 200),
        removable: true,
      });
    }
  }

  return fields;
}

function catalogueChunkFields(chunk: RiffChunk): MetadataField[] {
  if (chunk.fourcc === "EXIF") {
    return catalogueExifFields(chunk.data);
  } else if (chunk.fourcc === "XMP ") {
    return catalogueXmpFields(chunk.data);
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

export async function processWebp(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = new Uint8Array(arrayBuffer);

  // Verify RIFF + WEBP signature
  if (
    buffer.length < 12 ||
    new TextDecoder().decode(buffer.slice(0, 4)) !== "RIFF" ||
    new TextDecoder().decode(buffer.slice(8, 12)) !== "WEBP"
  ) {
    const blob = new Blob([arrayBuffer], { type: file.type });
    return {
      originalFile: file,
      cleanedBlob: blob,
      report: {
        fileName: file.name,
        fileType: "webp",
        fileSize: file.size,
        cleanedFileSize: blob.size,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: "Invalid WebP file",
    };
  }

  const chunks = parseRiffChunks(buffer);
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

  const categoriesToStrip = (
    Object.entries(options) as [MetadataCategory, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([cat]) => cat);

  // Catalogue metadata from metadata chunks
  for (const chunk of chunks) {
    if (METADATA_CHUNKS.has(chunk.fourcc)) {
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

  // Track which metadata chunk types are fully removed
  const removedFourccs = new Set<string>();

  // Filter out metadata chunks whose fields are all being removed
  const keptChunks = chunks.filter((chunk) => {
    if (!METADATA_CHUNKS.has(chunk.fourcc)) return true;

    const chunkFields = catalogueChunkFields(chunk);
    const keepChunk = chunkFields.some(
      (f) => !categoriesToStrip.includes(f.category)
    );

    if (!keepChunk) {
      removedFourccs.add(chunk.fourcc);
    }

    return keepChunk;
  });

  // Update VP8X feature flags to reflect removed chunks
  updateVP8XFlags(keptChunks, removedFourccs);

  const cleanedBuffer = rebuildWebp(keptChunks);
  const cleanedBlob = new Blob([cleanedBuffer.buffer as ArrayBuffer], { type: "image/webp" });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "webp",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

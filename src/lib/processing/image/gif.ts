import type { StripOptions, ProcessingResult, MetadataField, MetadataCategory } from "../types";
import { parseXmp } from "../document/xmp";

/**
 * GIF metadata removal.
 *
 * A GIF is a header, a logical screen descriptor, an optional global colour
 * table, then a flat sequence of blocks until the trailer (0x3B). Metadata
 * lives in extension blocks (0x21), which makes removal a matter of dropping
 * whole blocks rather than rewriting offsets, since nothing in a GIF points at
 * an absolute position.
 *
 * The block that must survive is the NETSCAPE2.0 application extension: it
 * carries the loop count, and dropping it stops every animated GIF looping.
 * Plain Text extensions are also kept, because they are rendered into the
 * image rather than being metadata about it.
 */

const HEADERS = ["GIF87a", "GIF89a"];

const ascii = (b: Uint8Array, at: number, len: number) =>
  String.fromCharCode(...b.subarray(at, at + len));

const isBlockMarker = (v: number) => v === 0x21 || v === 0x2c || v === 0x3b;

/** Walk a chain of length-prefixed sub-blocks, ending at the 0x00 terminator.
 *
 *  XMP is embedded in GIF as raw bytes rather than real sub-blocks, relying on
 *  a 257-byte descending "magic trailer" to make naive walkers converge on the
 *  terminator. Writers get that trailer subtly wrong, and a walk can then step
 *  straight over it into the pixel data. So the result is validated: the byte
 *  after a block must be another block marker, and if it is not we scan for the
 *  next terminator that is followed by one. */
function skipSubBlocks(b: Uint8Array, start: number): number {
  let p = start;
  while (p < b.length) {
    const len = b[p];
    if (len === 0) {
      const end = p + 1;
      if (end >= b.length || isBlockMarker(b[end])) return end;
      break; // walked past the real end; fall through to the scan
    }
    p += 1 + len;
  }
  for (let q = start; q < b.length - 1; q++) {
    if (b[q] === 0 && isBlockMarker(b[q + 1])) return q + 1;
  }
  return b.length;
}

function readSubBlocks(b: Uint8Array, p: number): Uint8Array {
  const parts: Uint8Array[] = [];
  while (p < b.length) {
    const len = b[p];
    if (len === 0) break;
    parts.push(b.subarray(p + 1, p + 1 + len));
    p += 1 + len;
  }
  const total = parts.reduce((n, x) => n + x.length, 0);
  const out = new Uint8Array(total);
  let o = 0;
  for (const part of parts) { out.set(part, o); o += part.length; }
  return out;
}

/** Colour table size in bytes, from the packed field of a screen or image descriptor. */
const colourTableBytes = (packed: number) =>
  packed & 0x80 ? 3 * (1 << ((packed & 0x07) + 1)) : 0;

interface Removable {
  start: number;
  end: number;
  fields: MetadataField[];
  /** Categories this block carries; it goes if any of them is being stripped. */
  categories: MetadataCategory[];
}

export async function processGif(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  const b = new Uint8Array(arrayBuffer);

  const emptyReport = (error: string): ProcessingResult => ({
    originalFile: file,
    cleanedBlob: file,
    report: {
      fileName: file.name, fileType: "gif", fileSize: file.size,
      cleanedFileSize: file.size, fieldsFound: [], fieldsRemoved: [],
      fieldsKept: [], processedAt: new Date(),
    },
    error,
  });

  if (b.length < 13 || !HEADERS.includes(ascii(b, 0, 6))) {
    return emptyReport("Invalid GIF file");
  }

  let p = 6;
  p += 7 + colourTableBytes(b[p + 4]); // logical screen descriptor + global colour table

  const removable: Removable[] = [];
  let truncated = false;

  while (p < b.length) {
    const marker = b[p];

    if (marker === 0x3b) break;                      // trailer

    if (marker === 0x2c) {                           // image descriptor + pixel data
      const packed = b[p + 9];
      let q = p + 10 + colourTableBytes(packed);
      q += 1;                                        // LZW minimum code size
      p = skipSubBlocks(b, q);
      continue;
    }

    if (marker !== 0x21) { truncated = true; break; } // not a block we understand

    const label = b[p + 1];

    if (label === 0xf9 || label === 0x01) {
      // Graphic control (timing, transparency) and plain text (rendered into
      // the frame). Both affect what you see, so both stay.
      // Both start with a fixed-size header block (4 bytes for graphic control,
      // 12 for plain text), then a sub-block chain.
      const q = p + 2;
      p = skipSubBlocks(b, q + 1 + b[q]);
      continue;
    }

    if (label === 0xfe) {                            // comment extension
      const start = p;
      const data = readSubBlocks(b, p + 2);           // properly chunked, unlike XMP
      p = skipSubBlocks(b, p + 2);
      const text = new TextDecoder().decode(data).replace(/\s+/g, " ").trim();
      removable.push({
        start, end: p, categories: ["comments"],
        fields: [{
          category: "comments", key: "GIF:Comment", label: "GIF comment",
          value: text.length > 200 ? `${text.slice(0, 200)}…` : text || "(present)",
          removable: true,
        }],
      });
      continue;
    }

    if (label === 0xff) {                            // application extension
      const start = p;
      const idLen = b[p + 2];
      const appId = ascii(b, p + 3, idLen);
      const dataStart = p + 3 + idLen;
      p = skipSubBlocks(b, dataStart);

      // The loop count. Removing it stops animations looping.
      if (appId.startsWith("NETSCAPE")) continue;

      if (appId.startsWith("XMP")) {
        // XMP is written raw, not as real sub-blocks, so reading it through the
        // sub-block walker returns a shredded payload. Take the whole block and
        // let the parser find the tags; the magic trailer is binary noise the
        // regexes ignore.
        const raw = b.subarray(dataStart, Math.max(dataStart, p - 1));
        const props = parseXmp(new TextDecoder().decode(raw));
        const fields: MetadataField[] = props.length
          ? props.map((prop) => ({
              category: prop.category, key: `XMP:${prop.key}`,
              label: prop.label, value: prop.value, removable: true,
            }))
          : [{ category: "custom" as MetadataCategory, key: "XMP", label: "XMP metadata packet", value: "(present)", removable: true }];
        removable.push({
          start, end: p, fields,
          categories: [...new Set(fields.map((f) => f.category))],
        });
        continue;
      }

      const label_ = appId.startsWith("ICCRGBG") ? "ICC colour profile" : `Application data: ${appId.trim()}`;
      removable.push({
        start, end: p, categories: ["custom"],
        fields: [{ category: "custom", key: `GIF:${appId.trim()}`, label: label_, value: "(present)", removable: true }],
      });
      continue;
    }

    truncated = true;
    break;
  }

  if (truncated) return emptyReport("Could not read this GIF's block structure");

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];
  const drop: Array<{ start: number; end: number }> = [];

  for (const block of removable) {
    fieldsFound.push(...block.fields);
    if (block.categories.some((c) => options[c])) {
      drop.push({ start: block.start, end: block.end });
      fieldsRemoved.push(...block.fields);
    } else {
      fieldsKept.push(...block.fields);
    }
  }

  let cleaned: Uint8Array;
  if (drop.length === 0) {
    cleaned = b;
  } else {
    const size = b.length - drop.reduce((n, d) => n + (d.end - d.start), 0);
    cleaned = new Uint8Array(size);
    let read = 0, write = 0;
    for (const d of drop) {
      cleaned.set(b.subarray(read, d.start), write);
      write += d.start - read;
      read = d.end;
    }
    cleaned.set(b.subarray(read), write);
  }

  const cleanedBlob = new Blob([cleaned.buffer as ArrayBuffer], { type: "image/gif" });
  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name, fileType: "gif", fileSize: file.size,
      cleanedFileSize: cleanedBlob.size, fieldsFound, fieldsRemoved, fieldsKept,
      processedAt: new Date(),
    },
  };
}

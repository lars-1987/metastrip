import piexif from "piexifjs";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";
import { TAG_CATEGORIES, IFD_MAP, catalogExifFields } from "./exif-catalog";

// ── JPEG marker-segment walker ────────────────────────────────────────────
// piexif only understands EXIF (APP1). A JPEG can also carry a C2PA content
// credential (APP11 / JUMBF), an XMP packet (APP1), and IPTC/Photoshop data
// (APP13) — none of which piexif sees or removes. Worse, when a file has a
// C2PA manifest but no EXIF, piexif.load throws and the old code returned the
// file untouched with "no metadata found". This walker parses the segment
// structure directly so those layers are both reported and stripped, while the
// image scan, ICC profile (APP2), JFIF (APP0) and Adobe (APP14) are preserved.

const MARKER_APP1 = 0xe1; // EXIF or XMP
const MARKER_APP11 = 0xeb; // JUMBF (C2PA)
const MARKER_APP13 = 0xed; // Photoshop / IPTC
const MARKER_COM = 0xfe; // JPEG comment
const MARKER_SOS = 0xda; // start of scan — image data follows, stop here
const MARKER_EOI = 0xd9;

type SegKind = "exif" | "xmp" | "jumbf" | "iptc" | "com";

interface Segment {
  marker: number;
  start: number; // byte offset of the leading 0xFF
  end: number; // byte offset just past the segment
  kind: SegKind;
}

function asciiAt(b: Uint8Array, off: number, len: number): string {
  let s = "";
  for (let i = 0; i < len && off + i < b.length; i++) {
    s += String.fromCharCode(b[off + i]);
  }
  return s;
}

/** Walk the JPEG header segments (SOI up to SOS) and return the metadata ones
 *  we care about. Non-metadata segments (JFIF, ICC, Adobe, SOF/DQT/DHT, etc.)
 *  are intentionally ignored so they're never touched. */
function parseMetadataSegments(b: Uint8Array): Segment[] {
  const segs: Segment[] = [];
  if (b.length < 2 || b[0] !== 0xff || b[1] !== 0xd8) return segs; // not a JPEG
  let off = 2;
  while (off + 4 <= b.length) {
    if (b[off] !== 0xff) {
      off++; // resync on corrupt data
      continue;
    }
    let marker = b[off + 1];
    // Skip any fill bytes (0xFF) preceding the marker.
    while (marker === 0xff && off + 2 < b.length) {
      off++;
      marker = b[off + 1];
    }
    if (marker === MARKER_SOS || marker === MARKER_EOI) break; // scan/end reached
    // Standalone markers (RST0-7, TEM) carry no length — shouldn't appear in the
    // header, but guard against it.
    if ((marker >= 0xd0 && marker <= 0xd7) || marker === 0x01) {
      off += 2;
      continue;
    }
    const len = (b[off + 2] << 8) | b[off + 3];
    const end = off + 2 + len;
    if (end > b.length) break; // truncated
    const payloadStart = off + 4;

    let kind: SegKind | null = null;
    if (marker === MARKER_APP1) {
      if (asciiAt(b, payloadStart, 6) === "Exif\0\0") kind = "exif";
      else if (asciiAt(b, payloadStart, 28).startsWith("http://ns.adobe.com/xap/1.0/")) kind = "xmp";
      else if (asciiAt(b, payloadStart, 34).startsWith("http://ns.adobe.com/xmp/extension/")) kind = "xmp";
    } else if (marker === MARKER_APP11) {
      kind = "jumbf";
    } else if (marker === MARKER_APP13) {
      kind = "iptc";
    } else if (marker === MARKER_COM) {
      kind = "com";
    }

    if (kind) segs.push({ marker, start: off, end, kind });
    off = end;
  }
  return segs;
}

/** Report fields for the non-EXIF metadata segments (EXIF is cataloged via
 *  piexif). C2PA maps to the `ai` category — the UI's content-credentials
 *  toggle. */
function catalogSegmentFields(b: Uint8Array, segs: Segment[]): MetadataField[] {
  const fields: MetadataField[] = [];
  for (const s of segs) {
    const bytes = s.end - s.start;
    if (s.kind === "jumbf") {
      fields.push({
        category: "ai",
        key: "C2PA",
        label: "C2PA Content Credential",
        value: `(${bytes} bytes)`,
        removable: true,
      });
    } else if (s.kind === "xmp") {
      fields.push({
        category: "custom",
        key: "XMP",
        label: "XMP Metadata",
        value: `(${bytes} bytes)`,
        removable: true,
      });
    } else if (s.kind === "iptc") {
      fields.push({
        category: "custom",
        key: "IPTC",
        label: "IPTC / Photoshop Metadata",
        value: `(${bytes} bytes)`,
        removable: true,
      });
    } else if (s.kind === "com") {
      fields.push({
        category: "comments",
        key: "COM",
        label: "JPEG Comment",
        value: asciiAt(b, s.start + 4, Math.min(80, bytes - 4)),
        removable: true,
      });
    }
  }
  return fields;
}

/** Return a copy of the JPEG with the given metadata segment kinds removed by
 *  byte range. Everything else (image scan included) is preserved verbatim. */
function removeSegments(b: Uint8Array<ArrayBuffer>, kinds: Set<SegKind>): Uint8Array<ArrayBuffer> {
  const toRemove = parseMetadataSegments(b)
    .filter((s) => kinds.has(s.kind))
    .sort((a, z) => a.start - z.start);
  if (toRemove.length === 0) return b;

  const removedBytes = toRemove.reduce((n, s) => n + (s.end - s.start), 0);
  const out = new Uint8Array(b.length - removedBytes);
  let w = 0;
  let r = 0;
  for (const s of toRemove) {
    out.set(b.subarray(r, s.start), w);
    w += s.start - r;
    r = s.end;
  }
  out.set(b.subarray(r), w);
  return out;
}

const ALL_METADATA_KINDS: Set<SegKind> = new Set(["exif", "xmp", "jumbf", "iptc", "com"]);

export async function processJpeg(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const dataUrl = bytesToDataUrl(bytes);
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

  // EXIF cataloging via piexif (best-effort — absence is fine, e.g. a C2PA-only
  // AI export). No longer an early return: other metadata may still be present.
  let exifObj: Record<string, Record<string, unknown>> | null = null;
  try {
    exifObj = piexif.load(dataUrl);
    fieldsFound.push(...catalogExifFields(exifObj));
  } catch {
    exifObj = null;
  }

  // C2PA / XMP / IPTC / comment cataloging via the segment walker.
  const segs = parseMetadataSegments(bytes);
  fieldsFound.push(...catalogSegmentFields(bytes, segs));

  // Determine which categories to strip
  const categoriesToStrip = (
    Object.entries(options) as [MetadataCategory, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([cat]) => cat);

  const allCategories = Object.keys(options) as MetadataCategory[];
  const strippingAll = allCategories.every((cat) =>
    categoriesToStrip.includes(cat)
  );

  // ── Fast path: remove everything ─────────────────────────────────────────
  // Strip every metadata segment by byte range. Covers EXIF, XMP, C2PA, IPTC
  // and comments, and correctly handles files with no EXIF at all.
  if (strippingAll || fieldsFound.length === 0) {
    const outBytes = removeSegments(bytes, ALL_METADATA_KINDS);
    const cleanedBlob = new Blob([outBytes], { type: "image/jpeg" });
    return {
      originalFile: file,
      cleanedBlob,
      report: {
        fileName: file.name,
        fileType: "jpeg",
        fileSize: file.size,
        cleanedFileSize: cleanedBlob.size,
        fieldsFound,
        fieldsRemoved: [...fieldsFound],
        fieldsKept: [],
        processedAt: new Date(),
      },
    };
  }

  // ── Selective removal ────────────────────────────────────────────────────
  for (const field of fieldsFound) {
    if (categoriesToStrip.includes(field.category)) {
      fieldsRemoved.push(field);
    } else {
      fieldsKept.push(field);
    }
  }

  // EXIF: fine-grained per-tag removal with piexif (only if EXIF is present).
  let outBytes = bytes;
  if (exifObj) {
    if (options.gps) exifObj["GPS"] = {};
    for (const ifd of ["0th", "Exif", "1st"]) {
      if (exifObj[ifd]) {
        for (const tagId of Object.keys(exifObj[ifd])) {
          const ifdKey = IFD_MAP[ifd] || "ImageIFD";
          const tagInfo =
            piexif.TAGS[ifd]?.[tagId] ?? piexif.TAGS[ifdKey]?.[tagId];
          const tagName = tagInfo?.["name"] ?? `Unknown_${ifd}_${tagId}`;
          const category = TAG_CATEGORIES[tagName as string] || "custom";
          if (categoriesToStrip.includes(category)) {
            delete exifObj[ifd][tagId];
          }
        }
      }
    }
    try {
      const newExifBytes = piexif.dump(exifObj);
      outBytes = dataUrlToUint8(piexif.insert(newExifBytes, dataUrl));
    } catch {
      try {
        outBytes = dataUrlToUint8(piexif.remove(dataUrl));
      } catch {
        outBytes = bytes;
      }
    }
  }

  // Non-EXIF metadata: remove the segment types whose category is being stripped.
  const kinds = new Set<SegKind>();
  if (categoriesToStrip.includes("ai")) kinds.add("jumbf");
  if (categoriesToStrip.includes("custom")) {
    kinds.add("xmp");
    kinds.add("iptc");
  }
  if (categoriesToStrip.includes("comments")) kinds.add("com");
  if (kinds.size > 0) outBytes = removeSegments(outBytes, kinds);

  const cleanedBlob = new Blob([outBytes], { type: "image/jpeg" });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "jpeg",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

/** Build a base64 JPEG data URL from raw bytes — what piexif expects. Reads
 *  from the already-loaded ArrayBuffer (no FileReader), so it's consistent with
 *  the PNG/WebP processors and runnable outside the browser. Chunked to stay
 *  under the argument-count limit of String.fromCharCode on large files. */
function bytesToDataUrl(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return "data:image/jpeg;base64," + btoa(binary);
}

function dataUrlToUint8(dataUrl: string): Uint8Array<ArrayBuffer> {
  const data = dataUrl.split(",")[1] ?? "";
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return array;
}

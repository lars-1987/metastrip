import type { StripOptions, MetadataField } from "../types";
import { Unreadable, type Stripped } from "../contract";
import { stripExif } from "./exif";
import { describeC2pa, jumbfFromApp11 } from "../c2pa-manifest";
import { stripXmp } from "../xmp";

// ── JPEG marker-segment walker ────────────────────────────────────────────
// A JPEG can carry EXIF and XMP (APP1), a C2PA content credential (APP11 /
// JUMBF), IPTC/Photoshop data (APP13) and comments (COM). This walker parses
// the segment structure so each layer is reported and stripped, while the
// image scan, ICC profile (APP2), JFIF (APP0) and Adobe (APP14) are preserved.

const MARKER_APP1 = 0xe1; // EXIF or XMP
const MARKER_APP11 = 0xeb; // JUMBF (C2PA)
const MARKER_APP13 = 0xed; // Photoshop / IPTC
const MARKER_COM = 0xfe; // JPEG comment
const MARKER_SOS = 0xda; // start of scan — image data follows, stop here
const MARKER_EOI = 0xd9;

type SegKind = "exif" | "xmp" | "xmpext" | "jumbf" | "iptc" | "com";

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
    // Cut short inside the metadata: unreadable, rather than passing the file
    // through as clean with whatever the cut segment held.
    if (end > b.length) throw new Unreadable();
    const payloadStart = off + 4;

    let kind: SegKind | null = null;
    if (marker === MARKER_APP1) {
      if (asciiAt(b, payloadStart, 6) === "Exif\0\0") kind = "exif";
      else if (asciiAt(b, payloadStart, 28).startsWith("http://ns.adobe.com/xap/1.0/")) kind = "xmp";
      else if (asciiAt(b, payloadStart, 34).startsWith("http://ns.adobe.com/xmp/extension/")) kind = "xmpext";
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

const UTF8 = new TextDecoder();
const XMP_HEADER_LENGTH = 29; // "http://ns.adobe.com/xap/1.0/\0"

/** Report fields for the C2PA, IPTC and comment segments (EXIF and XMP go
 *  through their readers). C2PA maps to the `ai` category — the UI's content-credentials
 *  toggle. */
function catalogSegmentFields(b: Uint8Array, segs: Segment[]): MetadataField[] {
  const fields: MetadataField[] = [];
  // A C2PA manifest is often split across several APP11 segments, which
  // showed as one "C2PA Content Credential" line each. Rejoin and read it once.
  const jumbfSegs = segs.filter((s) => s.kind === "jumbf");
  if (jumbfSegs.length) {
    const total = jumbfSegs.reduce((n, s) => n + (s.end - s.start), 0);
    const boxes = jumbfFromApp11(jumbfSegs.map((s) => b.subarray(s.start + 4, s.end)));
    fields.push(...(boxes.length ? boxes.flatMap((box) => describeC2pa(box, total)) : describeC2pa(new Uint8Array(0), total)));
  }
  for (const s of segs) {
    const bytes = s.end - s.start;
    if (s.kind === "jumbf") {
      continue; // reported above, once, from the rejoined segments
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

export function stripJpeg(bytes: Uint8Array<ArrayBuffer>, options: StripOptions): Stripped {
  const segs = parseMetadataSegments(bytes);

  // EXIF goes through the EXIF reader, tag by tag; the payload after
  // "Exif\0\0" is the TIFF block it takes.
  const exif = new Map(
    segs
      .filter((s) => s.kind === "exif")
      .map((s) => {
        const tiff = bytes.subarray(s.start + 10, s.end);
        return [s, { tiff, ...stripExif(tiff, options) }];
      })
  );
  const exifFound = [...exif.values()].flatMap((e) => e.fieldsFound);
  const exifRemoved = [...exif.values()].flatMap((e) => e.fieldsRemoved);

  // XMP goes through the XMP reader. A packet over 64 KB continues in
  // Extended XMP segments, mostly binary payloads such as Google Camera's
  // depth maps, so those are one field. All XMP segments go together.
  const xmp = segs.filter((s) => s.kind === "xmp").map((s) => stripXmp(UTF8.decode(bytes.subarray(s.start + 4 + XMP_HEADER_LENGTH, s.end)), options));
  const extended = segs.filter((s) => s.kind === "xmpext").reduce((n, s) => n + (s.end - s.start), 0);
  const xmpFound = xmp.flatMap((x) => x.fieldsFound);
  if (extended) {
    xmpFound.push({
      category: "custom",
      key: "XMP:extended",
      label: "Extended XMP",
      value: extended < 1024 ? `(${extended} bytes)` : `(${(extended / 1024).toFixed(1)} KB)`,
      removable: true,
    });
  }
  const xmpGoes = xmp.some((x) => x.goes) || (extended > 0 && options.custom);

  // C2PA, IPTC and comments are one field per segment (C2PA one set for all
  // its segments), each removed exactly when its category is.
  const segmentFields = catalogSegmentFields(bytes, segs);
  const fieldsFound = [...exifFound, ...xmpFound, ...segmentFields];
  const fieldsRemoved = [...exifRemoved, ...(xmpGoes ? xmpFound : []), ...segmentFields.filter((f) => options[f.category])];

  const drop = new Set<SegKind>();
  if (options.ai) drop.add("jumbf");
  if (xmpGoes) {
    drop.add("xmp");
    drop.add("xmpext");
  }
  if (options.custom) drop.add("iptc");
  if (options.comments) drop.add("com");

  // Rebuild from the original: dropped segments are left out, a rewritten
  // EXIF block goes back in a segment of its own length, the rest is copied.
  const parts: Uint8Array[] = [];
  let r = 0;
  for (const s of segs) {
    const stripped = exif.get(s);
    if (stripped ? stripped.cleaned === stripped.tiff : !drop.has(s.kind)) continue; // unchanged
    parts.push(bytes.subarray(r, s.start));
    if (stripped?.cleaned) parts.push(segment(MARKER_APP1, concatBytes([EXIF_HEADER, stripped.cleaned])));
    r = s.end;
  }
  if (parts.length === 0) return { cleaned: bytes, fieldsFound, fieldsRemoved };
  parts.push(bytes.subarray(r));
  return { cleaned: concatBytes(parts), fieldsFound, fieldsRemoved };
}

const EXIF_HEADER = Uint8Array.from([0x45, 0x78, 0x69, 0x66, 0, 0]); // "Exif\0\0"

/** A marker segment: 0xFF, the marker, a length that counts itself, the payload. */
function segment(marker: number, payload: Uint8Array): Uint8Array {
  const out = new Uint8Array(4 + payload.length);
  out.set([0xff, marker, ((payload.length + 2) >> 8) & 0xff, (payload.length + 2) & 0xff]);
  out.set(payload, 4);
  return out;
}

function concatBytes(parts: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

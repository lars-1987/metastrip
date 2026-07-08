import piexif from "piexifjs";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
  MetadataReport,
} from "../types";
import { catalogExifFields } from "./exif-catalog";
import {
  readBox,
  iterBoxes,
  findBox,
  readFullBoxHeader,
  readUintN,
  zeroBytes,
  type BoxInfo,
} from "../isobmff";

/* ──────────────────────────────────────────────────────────────────
   HEIC / HEIF metadata stripping — in place, keeps the .heic format.

   HEIF is an ISOBMFF container. Metadata lives as "items": the `meta`
   box holds `iinf` (item types) and `iloc` (item byte ranges); the EXIF
   (`Exif` item) and XMP (`mime`/application/rdf+xml item) bytes sit in
   `mdat`/`idat`. We locate those item byte ranges and zero them (or, for
   selective removal, rebuild the EXIF), never touching the image item.
   ────────────────────────────────────────────────────────────────── */

// ftyp major/compatible brands that indicate a HEIF-family still image.
const HEIF_BRANDS = new Set([
  "heic", "heix", "heim", "heis", "hevc", "hevx",
  "mif1", "mif2", "msf1", "miaf", "avif", "avis",
]);

interface HeifItem {
  id: number;
  type: string; // 'Exif' | 'mime' | 'hvc1' | 'grid' | 'tmap' | ...
  contentType?: string; // for 'mime' items
  /** absolute byte ranges of the item's data in the file */
  extents: { offset: number; length: number }[];
}

const ASCII = new TextDecoder("ascii");
const UTF8 = new TextDecoder("utf-8");

export async function processHeic(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const original = new Uint8Array(await file.arrayBuffer());

  const passthrough = (blob: Blob, found: MetadataField[] = [], removed: MetadataField[] = [], kept: MetadataField[] = []): ProcessingResult => ({
    originalFile: file,
    cleanedBlob: blob,
    report: buildReport(file, blob.size, found, removed, kept),
  });

  try {
    const view = new DataView(original.buffer, original.byteOffset, original.byteLength);

    if (!isHeifFile(view)) {
      // Not a parseable HEIF — hand the file back untouched rather than corrupt it.
      return passthrough(new Blob([original], { type: file.type || "image/heic" }));
    }

    const meta = findTopLevelBox(view, "meta");
    if (!meta) {
      return passthrough(new Blob([original], { type: file.type || "image/heic" }));
    }
    const { childrenStart: metaChildren } = readFullBoxHeader(view, meta);

    const iinf = findBox(view, metaChildren, meta.end, "iinf");
    const iloc = findBox(view, metaChildren, meta.end, "iloc");
    const idat = findBox(view, metaChildren, meta.end, "idat");
    if (!iinf || !iloc) {
      return passthrough(new Blob([original], { type: file.type || "image/heic" }));
    }

    const types = parseIinf(view, iinf); // id -> { type, contentType }
    const locations = parseIloc(view, iloc, idat); // id -> extents[]

    const items: HeifItem[] = [];
    for (const [id, info] of types) {
      const extents = locations.get(id);
      if (!extents || !extents.length) continue;
      items.push({ id, type: info.type, contentType: info.contentType, extents });
    }

    const exifItems = items.filter((it) => it.type === "Exif");
    const xmpItems = items.filter(
      (it) => it.type === "mime" && /rdf\+xml/i.test(it.contentType ?? "")
    );

    if (exifItems.length === 0 && xmpItems.length === 0) {
      // Nothing to strip.
      return passthrough(new Blob([original], { type: file.type || "image/heic" }));
    }

    // ── Catalogue found fields ──────────────────────────────────
    const fieldsFound: MetadataField[] = [];
    const exifCatalogs = exifItems.map((it) => {
      const data = readExtents(original, it.extents);
      const tiff = extractTiff(data);
      const fields = tiff ? catalogHeicExif(tiff) : [];
      fieldsFound.push(...fields);
      return { item: it, tiff, fields };
    });
    const xmpCatalogs = xmpItems.map((it) => {
      const text = UTF8.decode(readExtents(original, it.extents));
      const fields = catalogXmp(text);
      fieldsFound.push(...fields);
      return { item: it, fields };
    });

    // ── Decide what to strip ────────────────────────────────────
    const enabled = new Set(
      (Object.entries(options) as [MetadataCategory, boolean][])
        .filter(([, on]) => on)
        .map(([cat]) => cat)
    );
    const allCats = Object.keys(options) as MetadataCategory[];
    const strippingAll = allCats.every((c) => enabled.has(c));

    const cleaned = original.slice(); // copy to mutate
    const fieldsRemoved: MetadataField[] = [];
    const fieldsKept: MetadataField[] = [];

    // EXIF items
    for (const { item, tiff, fields } of exifCatalogs) {
      const removeThese = fields.filter((f) => enabled.has(f.category));
      const keepThese = fields.filter((f) => !enabled.has(f.category));
      if (strippingAll || keepThese.length === 0 || !tiff || item.extents.length !== 1) {
        // Full strip: zero the whole item payload. (Also the multi-extent /
        // unparseable fallback — errs toward removing more.)
        for (const ext of item.extents) zeroBytes(cleaned, ext.offset, ext.length);
        fieldsRemoved.push(...fields);
      } else {
        // Selective: rebuild the TIFF with the enabled categories removed,
        // write it back into the (single) extent, zero-pad the remainder.
        rebuildExifInPlace(cleaned, item.extents[0], tiff, enabled);
        fieldsRemoved.push(...removeThese);
        fieldsKept.push(...keepThese);
      }
    }

    // XMP items — drop the whole block when any of its categories is stripped.
    for (const { item, fields } of xmpCatalogs) {
      const anyStripped = fields.some((f) => enabled.has(f.category));
      if (strippingAll || anyStripped || fields.length === 0) {
        for (const ext of item.extents) zeroBytes(cleaned, ext.offset, ext.length);
        fieldsRemoved.push(...fields);
      } else {
        fieldsKept.push(...fields);
      }
    }

    const blob = new Blob([cleaned], { type: "image/heic" });
    return {
      originalFile: file,
      cleanedBlob: blob,
      report: buildReport(file, blob.size, fieldsFound, fieldsRemoved, fieldsKept),
    };
  } catch {
    // Any parse failure: never corrupt the user's file — return it as-is.
    return {
      originalFile: file,
      cleanedBlob: new Blob([original], { type: file.type || "image/heic" }),
      report: buildReport(file, original.byteLength, [], [], []),
    };
  }
}

/* ──────────────────────────────────────────────────────────────────
   HEIF structure parsing
   ────────────────────────────────────────────────────────────────── */

function isHeifFile(view: DataView): boolean {
  const ftyp = readBox(view, 0);
  if (!ftyp || ftyp.type !== "ftyp") return false;
  // major_brand (4) + minor_version (4) then compatible brands.
  const major = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + ftyp.contentStart, 4));
  if (HEIF_BRANDS.has(major)) return true;
  for (let o = ftyp.contentStart + 8; o + 4 <= ftyp.end; o += 4) {
    const brand = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + o, 4));
    if (HEIF_BRANDS.has(brand)) return true;
  }
  return false;
}

function findTopLevelBox(view: DataView, type: string): BoxInfo | null {
  return findBox(view, 0, view.byteLength, type);
}

/** Parse iinf → item_ID → { type, contentType }. */
function parseIinf(
  view: DataView,
  iinf: BoxInfo
): Map<number, { type: string; contentType?: string }> {
  const out = new Map<number, { type: string; contentType?: string }>();
  const { version, childrenStart } = readFullBoxHeader(view, iinf);
  let pos = childrenStart;
  // entry_count: uint16 (v0) or uint32 (v1+)
  pos += version === 0 ? 2 : 4;
  for (const infe of iterBoxes(view, pos, iinf.end)) {
    if (infe.type !== "infe") continue;
    const parsed = parseInfe(view, infe);
    if (parsed) out.set(parsed.id, { type: parsed.type, contentType: parsed.contentType });
  }
  return out;
}

function parseInfe(
  view: DataView,
  infe: BoxInfo
): { id: number; type: string; contentType?: string } | null {
  const { version, childrenStart } = readFullBoxHeader(view, infe);
  let p = childrenStart;
  if (version >= 2) {
    const id = version === 2 ? view.getUint16(p) : view.getUint32(p);
    p += version === 2 ? 2 : 4;
    p += 2; // item_protection_index
    const type = ASCII.decode(new Uint8Array(view.buffer, view.byteOffset + p, 4));
    p += 4;
    let contentType: string | undefined;
    if (type === "mime") {
      // item_name (null-terminated), then content_type (null-terminated)
      p = skipCString(view, p, infe.end);
      contentType = readCString(view, p, infe.end);
    }
    return { id, type, contentType };
  }
  // version 0/1: item_ID(16), protection(16), item_name, content_type, content_encoding
  const id = view.getUint16(p);
  p += 2 + 2;
  p = skipCString(view, p, infe.end); // item_name
  const contentType = readCString(view, p, infe.end);
  // Infer a pseudo-type from content_type so downstream logic still works.
  const type = /rdf\+xml/i.test(contentType) ? "mime" : "";
  return { id, type, contentType };
}

interface IlocEntry {
  id: number;
  constructionMethod: number;
  baseOffset: number;
  extents: { offset: number; length: number }[];
}

/** Parse iloc → item_ID → absolute byte extents (resolving construction_method). */
function parseIloc(
  view: DataView,
  iloc: BoxInfo,
  idat: BoxInfo | null
): Map<number, { offset: number; length: number }[]> {
  const out = new Map<number, { offset: number; length: number }[]>();
  const { version, childrenStart } = readFullBoxHeader(view, iloc);
  let p = childrenStart;

  const b0 = view.getUint8(p);
  const b1 = view.getUint8(p + 1);
  p += 2;
  const offsetSize = b0 >> 4;
  const lengthSize = b0 & 0x0f;
  const baseOffsetSize = b1 >> 4;
  const indexSize = version === 1 || version === 2 ? b1 & 0x0f : 0;

  let itemCount: number;
  if (version < 2) {
    itemCount = view.getUint16(p);
    p += 2;
  } else {
    itemCount = view.getUint32(p);
    p += 4;
  }

  for (let i = 0; i < itemCount; i++) {
    const id = version < 2 ? view.getUint16(p) : view.getUint32(p);
    p += version < 2 ? 2 : 4;

    let constructionMethod = 0;
    if (version === 1 || version === 2) {
      // 12 bits reserved + 4 bits construction_method
      constructionMethod = view.getUint16(p) & 0x0f;
      p += 2;
    }
    p += 2; // data_reference_index
    const baseOffset = readUintN(view, p, baseOffsetSize);
    p += baseOffsetSize;
    const extentCount = view.getUint16(p);
    p += 2;

    const entry: IlocEntry = { id, constructionMethod, baseOffset, extents: [] };
    for (let j = 0; j < extentCount; j++) {
      if (indexSize > 0) p += indexSize; // extent_index (unused)
      const extentOffset = readUintN(view, p, offsetSize);
      p += offsetSize;
      const extentLength = readUintN(view, p, lengthSize);
      p += lengthSize;
      entry.extents.push({ offset: extentOffset, length: extentLength });
    }
    out.set(id, resolveExtents(entry, idat, view));
  }
  return out;
}

/** Turn iloc-relative extents into absolute file byte ranges. */
function resolveExtents(
  entry: IlocEntry,
  idat: BoxInfo | null,
  view: DataView
): { offset: number; length: number }[] {
  let base = entry.baseOffset;
  if (entry.constructionMethod === 1) {
    // idat_offset: relative to the idat box content
    if (!idat) return [];
    base += idat.contentStart;
  } else if (entry.constructionMethod === 2) {
    // item_offset — uncommon for Exif/XMP; skip (leave untouched).
    return [];
  }
  return entry.extents
    .map((e) => ({ offset: base + e.offset, length: e.length }))
    .filter((e) => e.offset >= 0 && e.offset + e.length <= view.byteLength);
}

/* ──────────────────────────────────────────────────────────────────
   EXIF / XMP extraction, cataloging, and selective rebuild
   ────────────────────────────────────────────────────────────────── */

function readExtents(buf: Uint8Array, extents: { offset: number; length: number }[]): Uint8Array {
  if (extents.length === 1) {
    const { offset, length } = extents[0];
    return buf.subarray(offset, offset + length);
  }
  const total = extents.reduce((n, e) => n + e.length, 0);
  const out = new Uint8Array(total);
  let p = 0;
  for (const e of extents) {
    out.set(buf.subarray(e.offset, e.offset + e.length), p);
    p += e.length;
  }
  return out;
}

/** HEIF Exif item data = 4-byte tiff_header_offset + payload. Extract the TIFF. */
function extractTiff(data: Uint8Array): Uint8Array | null {
  if (data.length < 8) return null;
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const tiffHeaderOffset = dv.getUint32(0);
  const start = 4 + tiffHeaderOffset;
  if (start >= data.length) return null;
  // Validate TIFF byte-order mark.
  const bom = ASCII.decode(data.subarray(start, start + 2));
  if (bom !== "II" && bom !== "MM") {
    // Some files omit the 4-byte prefix / include an "Exif\0\0" marker — search.
    const idx = indexOfTiffHeader(data);
    if (idx < 0) return null;
    return data.subarray(idx);
  }
  return data.subarray(start);
}

function indexOfTiffHeader(data: Uint8Array): number {
  for (let i = 0; i + 4 <= data.length && i < 64; i++) {
    if (
      (data[i] === 0x49 && data[i + 1] === 0x49 && data[i + 2] === 0x2a && data[i + 3] === 0x00) ||
      (data[i] === 0x4d && data[i + 1] === 0x4d && data[i + 2] === 0x00 && data[i + 3] === 0x2a)
    ) {
      return i;
    }
  }
  return -1;
}

/** Catalog an EXIF TIFF block by wrapping it in a minimal JPEG for piexif. */
function catalogHeicExif(tiff: Uint8Array): MetadataField[] {
  try {
    if (tiff.length + 8 > 0xffff) throw new Error("exif too large to wrap");
    const dataUrl = tiffToJpegDataUrl(tiff);
    const exifObj = piexif.load(dataUrl) as Record<string, Record<string, unknown>>;
    return catalogExifFields(exifObj);
  } catch {
    // Oversized or unparseable EXIF: report a coarse presence field so the
    // user still sees (and removes) it. Stripping is unaffected.
    return [{ category: "custom", key: "EXIF", label: "EXIF metadata", value: `${tiff.length} bytes`, removable: true }];
  }
}

function rebuildExifInPlace(
  buf: Uint8Array,
  extent: { offset: number; length: number },
  tiff: Uint8Array,
  enabled: Set<MetadataCategory>
) {
  try {
    const dataUrl = tiffToJpegDataUrl(tiff);
    const exifObj = piexif.load(dataUrl) as Record<string, Record<string, unknown>>;

    if (enabled.has("gps")) exifObj["GPS"] = {};
    for (const ifd of ["0th", "Exif", "1st"]) {
      if (!exifObj[ifd]) continue;
      for (const tagId of Object.keys(exifObj[ifd])) {
        const one = catalogExifFields({ [ifd]: { [tagId]: exifObj[ifd][tagId] } });
        if (one[0] && enabled.has(one[0].category)) delete exifObj[ifd][tagId];
      }
    }

    const dumped = piexif.dump(exifObj); // binary string: "Exif\0\0" + TIFF
    const newTiff = binaryStringToBytes(dumped).subarray(6); // drop "Exif\0\0"

    // Original item data = [4-byte tiff_header_offset][... up to tiff][TIFF].
    // Find where the TIFF sat within the extent and overwrite it, zero-padding.
    const data = buf.subarray(extent.offset, extent.offset + extent.length);
    const tiffPos = data.length - tiff.length; // TIFF is at the tail
    if (tiffPos < 0 || tiffPos + newTiff.length > data.length) throw new Error("no room");
    data.set(newTiff, tiffPos);
    data.fill(0, tiffPos + newTiff.length, data.length);
  } catch {
    // If rebuild fails, fall back to zeroing the whole item.
    zeroBytes(buf, extent.offset, extent.length);
  }
}

/** Lightweight XMP category sniffing (XMP is XML/text). */
function catalogXmp(xml: string): MetadataField[] {
  const fields: MetadataField[] = [];
  const add = (category: MetadataCategory, key: string, label: string) =>
    fields.push({ category, key, label, value: "present", removable: true });
  if (/<dc:creator|<xmp:CreatorTool|<photoshop:Credit/i.test(xml)) add("author", "xmp:creator", "XMP Creator");
  if (/xmp:CreateDate|xmp:ModifyDate|photoshop:DateCreated/i.test(xml)) add("dates", "xmp:dates", "XMP Dates");
  if (/<dc:rights|xmpRights:/i.test(xml)) add("copyright", "xmp:rights", "XMP Rights");
  if (/GPSLatitude|exif:GPS/i.test(xml)) add("gps", "xmp:gps", "XMP GPS");
  if (/tiff:Make|tiff:Model|aux:/i.test(xml)) add("device", "xmp:device", "XMP Device");
  if (fields.length === 0) add("custom", "xmp", "XMP metadata");
  return fields;
}

/* ──────────────────────────────────────────────────────────────────
   Small binary helpers
   ────────────────────────────────────────────────────────────────── */

function readCString(view: DataView, start: number, end: number): string {
  let p = start;
  while (p < end && view.getUint8(p) !== 0) p++;
  return UTF8.decode(new Uint8Array(view.buffer, view.byteOffset + start, p - start));
}

function skipCString(view: DataView, start: number, end: number): number {
  let p = start;
  while (p < end && view.getUint8(p) !== 0) p++;
  return p + 1; // step past the null terminator
}

function tiffToJpegDataUrl(tiff: Uint8Array): string {
  const app1Len = 2 + 6 + tiff.length; // length field + "Exif\0\0" + TIFF
  const out = new Uint8Array(2 + 4 + 6 + tiff.length + 2);
  let p = 0;
  out[p++] = 0xff; out[p++] = 0xd8; // SOI
  out[p++] = 0xff; out[p++] = 0xe1; // APP1
  out[p++] = (app1Len >> 8) & 0xff; out[p++] = app1Len & 0xff;
  out[p++] = 0x45; out[p++] = 0x78; out[p++] = 0x69; out[p++] = 0x66; out[p++] = 0x00; out[p++] = 0x00; // "Exif\0\0"
  out.set(tiff, p); p += tiff.length;
  // Terminate with an SOS marker (not EOI): piexif's segment splitter scans
  // for \xff\xda and stops there. Ending on EOI makes it read a bogus length.
  out[p++] = 0xff; out[p++] = 0xda; // SOS
  return "data:image/jpeg;base64," + bytesToBase64(out);
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

function binaryStringToBytes(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i) & 0xff;
  return out;
}

function buildReport(
  file: File,
  cleanedSize: number,
  fieldsFound: MetadataField[],
  fieldsRemoved: MetadataField[],
  fieldsKept: MetadataField[]
): MetadataReport {
  return {
    fileName: file.name,
    fileType: "heic",
    fileSize: file.size,
    cleanedFileSize: cleanedSize,
    fieldsFound,
    fieldsRemoved,
    fieldsKept,
    processedAt: new Date(),
  };
}

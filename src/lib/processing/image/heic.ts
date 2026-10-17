import type {
  StripOptions,
  MetadataField,
  MetadataCategory,
} from "../types";
import { Unreadable, blockGoes, type Stripped } from "../contract";
import { stripExif } from "./exif";
import { describeC2pa } from "../c2pa-manifest";
import { aiCategoryFor, aiValueLabel, aiDisplayValue } from "../ai-signatures";
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
   HEIC / HEIF / AVIF metadata stripping — in place, keeps the format.

   AVIF is HEIF with AV1 image items instead of HEVC ones: same `meta`,
   `iinf` and `iloc` boxes, same Exif and XMP items, same C2PA uuid box.
   Only the image codec differs, and we never touch the image, so both
   formats share this processor and differ only in the MIME they keep.

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

/** HEIC and AVIF share everything but their image codec, which we never
 *  touch, so they share one processor. */
export const stripHeic = stripHeif;
export const stripAvif = stripHeif;

function stripHeif(original: Uint8Array, options: StripOptions): Stripped {
  const view = new DataView(original.buffer, original.byteOffset, original.byteLength);

  // Every HEIF image has a meta box with iinf and iloc; a file without them is
  // damaged or not HEIF. These used to hand the file back with no error, so a
  // truncated HEIC read as "no metadata found, already clean".
  if (!isHeifFile(view)) throw new Unreadable();
  const meta = findTopLevelBox(view, "meta");
  if (!meta) throw new Unreadable();
  const { childrenStart: metaChildren } = readFullBoxHeader(view, meta);

  const iinf = findBox(view, metaChildren, meta.end, "iinf");
  const iloc = findBox(view, metaChildren, meta.end, "iloc");
  const idat = findBox(view, metaChildren, meta.end, "idat");
  if (!iinf || !iloc) throw new Unreadable();

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
  // A metadata item whose bytes run past the end of the file was cut short:
  // unreadable, rather than passing it through unread and unremoved.
  for (const it of [...exifItems, ...xmpItems]) {
    if (it.extents.some((e) => e.offset + e.length > original.length)) throw new Unreadable();
  }
  // C2PA content credentials live in a top-level `uuid` box (the ISOBMFF
  // binding), not a `meta` item, so scan the box tree for it separately.
  const c2paBoxes = findC2paBoxes(view);

  // ── Catalogue found fields ──────────────────────────────────
  const fieldsFound: MetadataField[] = [];
  const exifResults = exifItems.flatMap((it) => {
    const data = readExtents(original, it.extents);
    // A strip zeroes the item rather than removing it, so the iloc offsets
    // stay valid. Zeroes carry nothing: re-reading a cleaned file must not
    // report them as EXIF it couldn't read.
    if (data.every((b) => b === 0)) return [];
    // An item with no TIFF header to be found is handed over whole, and the
    // reader reports it as EXIF it couldn't read.
    const tiff = extractTiff(data) ?? data;
    const exif = stripExif(tiff, options);
    fieldsFound.push(...exif.fieldsFound);
    return [{ item: it, data, tiff, exif }];
  });
  const xmpCatalogs = xmpItems.map((it) => {
    const text = UTF8.decode(readExtents(original, it.extents));
    const fields = catalogXmp(text);
    fieldsFound.push(...fields);
    return { item: it, fields };
  });
  // The manifest follows the box's 16-byte UUID (then version, purpose and
  // an offset, which describeC2pa skips by finding the JUMBF itself).
  const c2paFields: MetadataField[] = c2paBoxes.flatMap((box) =>
    describeC2pa(original.subarray(box.contentStart + 16, box.end), box.end - box.contentStart)
  );
  fieldsFound.push(...c2paFields);

  // ── Decide what to strip ────────────────────────────────────
  const enabled = new Set(
    (Object.entries(options) as [MetadataCategory, boolean][])
      .filter(([, on]) => on)
      .map(([cat]) => cat)
  );

  const cleaned = original.slice(); // copy to mutate
  const fieldsRemoved: MetadataField[] = [];

  // EXIF items: the reader edits the TIFF in place and never makes it
  // longer, so it goes back where it was, zero-padded, and the iloc offsets
  // stay valid.
  for (const { item, data, tiff, exif } of exifResults) {
    if (exif.cleaned === tiff) continue;
    if (exif.cleaned === null || item.extents.length !== 1) {
      // The block goes, or it's split across extents we'd have to write back
      // piece by piece: zero the whole item, and report every field removed.
      for (const ext of item.extents) zeroBytes(cleaned, ext.offset, ext.length);
      fieldsRemoved.push(...(exif.cleaned === null ? exif.fieldsRemoved : exif.fieldsFound));
    } else {
      const at = item.extents[0].offset + (data.length - tiff.length); // the TIFF is the item's tail
      cleaned.set(exif.cleaned, at);
      cleaned.fill(0, at + exif.cleaned.length, at + tiff.length);
      fieldsRemoved.push(...exif.fieldsRemoved);
    }
  }

  // XMP items go whole.
  for (const { item, fields } of xmpCatalogs) {
    if (blockGoes(fields, options)) {
      for (const ext of item.extents) zeroBytes(cleaned, ext.offset, ext.length);
      fieldsRemoved.push(...fields);
    }
  }

  // C2PA uuid box(es): neutralize in place when the AI / content-credential
  // category is stripped. Renaming to a `free` box and zeroing the payload
  // keeps the file the same size, so the absolute iloc offsets stay valid.
  // Every field read from a box goes with it; reporting one per box left the
  // rest neither removed nor kept.
  if (enabled.has("ai")) {
    for (const box of c2paBoxes) stripC2paBox(cleaned, box);
    fieldsRemoved.push(...c2paFields);
  }

  return { cleaned, fieldsFound, fieldsRemoved };
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

// C2PA BMFF manifest-store box UUID (d8fec3d6-1b0e-483c-9297-5828877ec481).
const C2PA_BMFF_UUID = [
  0xd8, 0xfe, 0xc3, 0xd6, 0x1b, 0x0e, 0x48, 0x3c,
  0x92, 0x97, 0x58, 0x28, 0x87, 0x7e, 0xc4, 0x81,
];

/** Find top-level `uuid` boxes carrying the C2PA manifest store. */
function findC2paBoxes(view: DataView): BoxInfo[] {
  const out: BoxInfo[] = [];
  for (const box of iterBoxes(view, 0, view.byteLength)) {
    if (box.type !== "uuid" || box.contentStart + 16 > box.end) continue;
    let match = true;
    for (let i = 0; i < 16; i++) {
      if (view.getUint8(box.contentStart + i) !== C2PA_BMFF_UUID[i]) {
        match = false;
        break;
      }
    }
    if (match) out.push(box);
  }
  return out;
}

/** Neutralize a C2PA uuid box in place: rename it to a `free` box and zero its
 *  payload (the UUID + manifest). Same size, so iloc's absolute offsets remain
 *  correct and the image itself is untouched. */
function stripC2paBox(buf: Uint8Array, box: BoxInfo) {
  buf[box.offset + 4] = 0x66; // 'f'
  buf[box.offset + 5] = 0x72; // 'r'
  buf[box.offset + 6] = 0x65; // 'e'
  buf[box.offset + 7] = 0x65; // 'e'
  zeroBytes(buf, box.contentStart, box.end - box.contentStart);
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

/** Lightweight XMP category sniffing (XMP is XML/text). */
function catalogXmp(xml: string): MetadataField[] {
  // A strip zeroes the item rather than removing it (so the iloc offsets stay
  // valid), and zeroes decode to NULs. That carries nothing, so re-reading a
  // cleaned file must not report it as "XMP metadata".
  if (!xml.replace(/[\0\s]/g, "")) return [];
  const fields: MetadataField[] = [];
  const add = (category: MetadataCategory, key: string, label: string) =>
    fields.push({ category, key, label, value: "present", removable: true });
  // AI generators writing AVIF (Google, Midjourney, Adobe) mark the file with
  // IPTC's digital source type or an online manifest link in XMP. Class it as
  // AI so the AI toggle covers it, as the WebP and PNG readers already do.
  const xmpKey = "XML:com.adobe.xmp";
  if (aiCategoryFor(xmpKey, xml) === "ai") {
    fields.push({
      category: "ai",
      key: "xmp:ai",
      label: aiValueLabel(xmpKey, xml) ?? "AI marker in XMP",
      value: aiDisplayValue(xmpKey, xml) ?? "present",
      removable: true,
    });
  }
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

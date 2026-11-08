import { Malformed, Reader, fieldFor, type Entry, type Ifd } from "./exif";
import { stripXmp } from "../xmp";
import { Unreadable, type MarkStep, type Stripped } from "../contract";
import type { MetadataField, StripOptions } from "../types";

/* TIFF: the structure EXIF borrows, with the image hanging off it.

   A TIFF is a header and a chain of IFDs, one per page. Each page's IFD holds
   the tags that describe the image (size, compression, where the pixel strips
   or tiles are) next to the metadata, and points to an Exif and a GPS IFD of
   its own. The EXIF stripper can't be used as it is: it lists every IFD0 tag,
   so removing Custom would take the image's own structure with it, it reads a
   second IFD as a thumbnail when in a TIFF it is page two, and it replaces a
   block that is all metadata with a 26-byte stub, which here would be the
   whole file.

   So this walks every page, never lists or touches a structure tag, and edits
   in place the way exif.ts does: a removed tag's entry leaves its IFD and its
   value bytes are zeroed, so everything kept stays at its offset and the
   pixels are never moved. Bytes the image data uses are never zeroed, even in
   a file where a removed value overlaps them.

   Camera RAW files (DNG, NEF, ARW and others) are TIFF underneath, but their
   image can depend on the maker notes, so they are turned away: by extension
   and signature in the registry, and here by the DNG version tag for one
   renamed .tif. */

const TAG = {
  exif: 0x8769,
  gps: 0x8825,
  interop: 0xa005,
  xmp: 0x02bc,
  iptc: 0x83bb,
  photoshop: 0x8649,
  dngVersion: 0xc612,
  stripOffsets: 0x0111,
  stripByteCounts: 0x0117,
  tileOffsets: 0x0144,
  tileByteCounts: 0x0145,
  jpegOffset: 0x0201,
  jpegLength: 0x0202,
} as const;

/** The image itself, never listed and never removed: geometry, sample layout,
 *  compression, where the strips and tiles are, colour (palette, transfer and
 *  ICC profile), page numbering, sub-images, clipping paths, Photoshop's layer
 *  data, and the orientation the page is displayed in. */
const STRUCTURE = new Set([
  254, 255, 256, 257, 258, 259, 262, 263, 264, 265, 266, 273, 274, 277, 278, 279, 280, 281, 282, 283, 284,
  286, 287, 290, 291, 292, 293, 296, 297, 301, 317, 318, 319, 320, 321, 322, 323, 324, 325, 330, 332, 333,
  334, 336, 338, 339, 340, 341, 342, 343, 344, 345, 346, 347, 351, 512, 513, 514, 515, 517, 518, 519, 520,
  521, 529, 530, 531, 532, 32997, 32998, 34675, 37724, 42113,
]);

/** GeoTIFF georeferencing: where on Earth the image sits. Location, so it is
 *  listed under GPS rather than kept as structure, even though a map loses its
 *  placement without it. */
const GEOTIFF: Record<number, string> = {
  33550: "GeoTIFF pixel scale",
  33922: "GeoTIFF tie points",
  34264: "GeoTIFF transformation",
  34735: "GeoTIFF keys",
  34736: "GeoTIFF parameters",
  34737: "GeoTIFF text parameters",
};

/** A multi-page fax runs to hundreds; a loop or a runaway chain stops here. */
const MAX_PAGES = 10_000;

const UTF8 = new TextDecoder();

interface Item {
  ifd: Ifd;
  entry: Entry;
  fields: MetadataField[];
  goes: boolean;
}

export function stripTiff(bytes: Uint8Array, options: StripOptions, at: MarkStep): Stripped {
  at("ifd");
  let parsed: { r: Reader; pages: Ifd[]; subs: Ifd[]; pointerOf: Map<Ifd, { owner: Ifd; tag: number }[]> };
  try {
    parsed = parse(bytes);
  } catch (err) {
    if (err instanceof Malformed) throw new Unreadable();
    throw err;
  }
  const { r, pages, subs, pointerOf } = parsed;
  if (pages.some((p) => p.entries.some((e) => e.tag === TAG.dngVersion))) throw new Unreadable();

  // ── What's there ─────────────────────────────────────────────────
  const items: Item[] = [];
  for (const ifd of [...pages, ...subs]) {
    for (const e of ifd.entries) {
      if (ifd.name === "0th" && (STRUCTURE.has(e.tag) || e.tag === TAG.exif || e.tag === TAG.gps)) continue;
      if (ifd.name === "Exif" && e.tag === TAG.interop) continue;
      items.push(describe(r, ifd, e, options, at));
    }
  }

  // A tag repeated on every page (Software, DateTime) is one row in the
  // report; every copy is still removed.
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const listed = new Set<string>();
  for (const item of items) {
    for (const f of item.fields) {
      const id = `${f.category}\0${f.key}\0${f.value}`;
      if (listed.has(id)) continue;
      listed.add(id);
      fieldsFound.push(f);
      if (item.goes) fieldsRemoved.push(f);
    }
  }

  const removed = new Set(items.filter((i) => i.goes).map((i) => i.entry));
  if (removed.size === 0) return { cleaned: bytes, fieldsFound, fieldsRemoved };

  at("rewrite");
  return { cleaned: rewrite(r, pages, subs, pointerOf, removed), fieldsFound, fieldsRemoved };
}

/** Every page in the chain, and the Exif, GPS and Interop IFDs they point to.
 *  Pages can share a sub-IFD; each is read once and knows who points to it. */
function parse(b: Uint8Array) {
  const r = new Reader(b);
  const pages: Ifd[] = [];
  const seen = new Set<number>();
  for (let next = r.u32(4); next !== 0; ) {
    if (seen.has(next) || pages.length >= MAX_PAGES) throw new Malformed();
    seen.add(next);
    const page = r.ifd("0th", next);
    pages.push(page);
    next = r.u32(r.nextAt(page));
  }
  if (pages.length === 0) throw new Malformed();

  const subs: Ifd[] = [];
  const byOffset = new Map<number, Ifd>();
  const pointerOf = new Map<Ifd, { owner: Ifd; tag: number }[]>();
  const follow = (owner: Ifd, tag: number, name: Ifd["name"]): Ifd | null => {
    const e = owner.entries.find((x) => x.tag === tag);
    if (!e) return null;
    const offset = r.u32(e.valueAt);
    if (seen.has(offset) && !byOffset.has(offset)) throw new Malformed(); // a page reused as a sub-IFD
    let ifd = byOffset.get(offset);
    if (!ifd) {
      seen.add(offset);
      ifd = r.ifd(name, offset);
      byOffset.set(offset, ifd);
      subs.push(ifd);
    }
    pointerOf.set(ifd, [...(pointerOf.get(ifd) ?? []), { owner, tag }]);
    return ifd;
  };
  for (const page of pages) {
    const exif = follow(page, TAG.exif, "Exif");
    if (exif) follow(exif, TAG.interop, "Interop");
    follow(page, TAG.gps, "GPS");
  }
  return { r, pages, subs, pointerOf };
}

function describe(r: Reader, ifd: Ifd, e: Entry, options: StripOptions, at: MarkStep): Item {
  if (ifd.name === "0th" && e.tag === TAG.xmp) {
    at("xmp");
    const xmp = stripXmp(UTF8.decode(r.b.subarray(e.valueAt, e.valueAt + e.size)), options);
    at("ifd");
    // The packet can only go whole, like XMP in every other container here.
    return { ifd, entry: e, fields: xmp.fieldsFound, goes: xmp.goes };
  }
  if (ifd.name === "0th" && (e.tag === TAG.iptc || e.tag === TAG.photoshop)) {
    // The same one field JPEG's APP13 segment gets: captions, keywords,
    // bylines and Photoshop's own records, which nothing else reads apart.
    const field: MetadataField = {
      category: "custom",
      key: e.tag === TAG.iptc ? "IPTC" : "PhotoshopImageResources",
      label: e.tag === TAG.iptc ? "IPTC metadata" : "Photoshop image resources",
      value: `(${e.size} bytes)`,
      removable: true,
    };
    return { ifd, entry: e, fields: [field], goes: options.custom };
  }
  if (ifd.name === "0th" && GEOTIFF[e.tag]) {
    const shown = fieldFor(r, ifd.name, e).value;
    const field: MetadataField = {
      category: "gps",
      key: `GeoTIFF_${e.tag}`,
      label: GEOTIFF[e.tag],
      value: typeof shown === "string" && shown.length > 120 ? `${shown.slice(0, 120)}…` : shown,
      removable: true,
    };
    return { ifd, entry: e, fields: [field], goes: options.gps };
  }
  const field = fieldFor(r, ifd.name, e);
  return { ifd, entry: e, fields: [field], goes: options[field.category] };
}

/** The values of a SHORT or LONG entry, for the strip and tile tables. */
function ints(r: Reader, e: Entry | undefined): number[] {
  if (!e || (e.type !== 3 && e.type !== 4)) return [];
  const out: number[] = [];
  for (let i = 0; i < e.count; i++) out.push(e.type === 3 ? r.u16(e.valueAt + 2 * i) : r.u32(e.valueAt + 4 * i));
  return out;
}

/** Take the removed entries out of their IFDs and zero their values, in a copy
 *  the same size as the file. A sub-IFD left empty goes with its pointers;
 *  pages always stay. Bytes a kept entry or the image data uses are never
 *  zeroed. */
function rewrite(
  r: Reader,
  pages: Ifd[],
  subs: Ifd[],
  pointerOf: Map<Ifd, { owner: Ifd; tag: number }[]>,
  removed: Set<Entry>,
): Uint8Array {
  const out = r.b.slice();
  const view = new DataView(out.buffer);
  const all = [...pages, ...subs];
  const kept = new Map(all.map((ifd) => [ifd, ifd.entries.filter((e) => !removed.has(e))]));

  // Innermost first, so an emptied Interop IFD can leave an Exif IFD empty.
  const order = [...subs].sort((a, z) => Number(z.name === "Interop") - Number(a.name === "Interop"));
  const dropped = new Set<Ifd>();
  for (const sub of order) {
    if (kept.get(sub)!.length > 0) continue;
    dropped.add(sub);
    for (const { owner, tag } of pointerOf.get(sub) ?? []) {
      kept.set(owner, kept.get(owner)!.filter((e) => e.tag !== tag));
    }
  }

  const live = new Uint8Array(out.length);
  const mark = (at: number, size: number) => live.fill(1, at, Math.min(out.length, at + size));
  const zero: [number, number][] = [];
  const tableSize = (n: number) => 2 + 12 * n + 4;

  mark(0, 8);
  for (const ifd of all) {
    const entries = kept.get(ifd)!;
    if (dropped.has(ifd)) {
      zero.push([ifd.at, tableSize(ifd.entries.length)]);
    } else {
      mark(ifd.at, tableSize(entries.length));
      zero.push([ifd.at + tableSize(entries.length), tableSize(ifd.entries.length) - tableSize(entries.length)]);
    }
    for (const e of ifd.entries) {
      if (e.size <= 4) continue;
      if (entries.includes(e)) mark(e.valueAt, e.size);
      else zero.push([e.valueAt, e.size]);
    }
  }
  // The pixels: every strip, tile and old-style JPEG stream on every page.
  for (const page of pages) {
    const find = (tag: number) => page.entries.find((e) => e.tag === tag);
    for (const [offsets, counts] of [[TAG.stripOffsets, TAG.stripByteCounts], [TAG.tileOffsets, TAG.tileByteCounts], [TAG.jpegOffset, TAG.jpegLength]]) {
      const o = ints(r, find(offsets));
      const c = ints(r, find(counts));
      o.forEach((at, i) => mark(at, c[i] ?? 0));
    }
  }

  for (const ifd of all) {
    if (dropped.has(ifd)) continue;
    const entries = kept.get(ifd)!;
    const next = r.u32(r.nextAt(ifd));
    const table = entries.map((e) => r.b.slice(e.at, e.at + 12));
    view.setUint16(ifd.at, entries.length, r.le);
    table.forEach((t, i) => out.set(t, ifd.at + 2 + 12 * i));
    view.setUint32(ifd.at + 2 + 12 * entries.length, next, r.le);
  }

  for (const [at, size] of zero) {
    for (let i = at; i < at + size; i++) if (!live[i]) out[i] = 0;
  }
  return out;
}

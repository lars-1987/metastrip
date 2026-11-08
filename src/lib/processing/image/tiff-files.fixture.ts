/** TIFFs built in memory for the TIFF processor tests: real page structure
 *  (a strip of pixels and the tags that locate it) with metadata beside it,
 *  in either byte order. Nothing is read from disk. */

export type TiffValue = { tag: number; type: 2 | 3 | 4 | 5 | 7; value: string | number[] };
export interface TiffPage {
  /** Metadata tags in the page's IFD, next to its structure tags. */
  tags?: TiffValue[];
  exif?: TiffValue[];
  gps?: TiffValue[];
  /** The page's pixels: one 4 x 2 strip of 8-bit grey. */
  pixels?: number[];
}

export const PIXELS = [11, 22, 33, 44, 55, 66, 77, 88];

const SIZE: Record<number, number> = { 2: 1, 3: 2, 4: 4, 5: 8, 7: 1 };

export function tiff(pages: TiffPage[], { bigEndian = false, loop = false } = {}): Uint8Array<ArrayBuffer> {
  const le = !bigEndian;
  const out: number[] = [];
  const u16 = (v: number, at = out.length) => {
    const b = le ? [v & 0xff, v >> 8] : [v >> 8, v & 0xff];
    out.splice(at, at < out.length ? 2 : 0, ...b);
  };
  const u32 = (v: number, at = out.length) => {
    const b = [v >>> 24, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];
    out.splice(at, at < out.length ? 4 : 0, ...(le ? b.reverse() : b));
  };
  const valueBytes = (t: TiffValue): number[] => {
    if (typeof t.value === "string") return [...new TextEncoder().encode(t.value), ...(t.type === 2 ? [0] : [])];
    const bytes: number[] = [];
    for (const v of t.value) {
      const at = out.length;
      if (t.type === 3) u16(v); else u32(v);
      bytes.push(...out.splice(at));
    }
    return bytes;
  };
  const writeIfd = (tags: TiffValue[]) => {
    const sorted = [...tags].sort((a, z) => a.tag - z.tag);
    const at = out.length;
    u16(sorted.length);
    const slots: [number, number[]][] = [];
    for (const t of sorted) {
      const bytes = valueBytes(t);
      u16(t.tag); u16(t.type); u32(bytes.length / SIZE[t.type]);
      if (bytes.length <= 4) out.push(...bytes, ...new Array(4 - bytes.length).fill(0));
      else { slots.push([out.length, bytes]); u32(0); }
    }
    const nextAt = out.length;
    u32(0);
    for (const [slot, bytes] of slots) {
      u32(out.length, slot);
      out.push(...bytes);
      if (out.length % 2) out.push(0);
    }
    return { at, nextAt };
  };

  out.push(...(le ? [0x49, 0x49] : [0x4d, 0x4d]));
  u16(42);
  u32(0);
  let prevNext = 4;
  let first = 0;
  for (const page of pages) {
    const strip = out.length;
    out.push(...(page.pixels ?? PIXELS));
    const pointers: TiffValue[] = [];
    if (page.exif) pointers.push({ tag: 0x8769, type: 4, value: [writeIfd(page.exif).at] });
    if (page.gps) pointers.push({ tag: 0x8825, type: 4, value: [writeIfd(page.gps).at] });
    const { at, nextAt } = writeIfd([
      { tag: 256, type: 3, value: [4] }, // ImageWidth
      { tag: 257, type: 3, value: [2] }, // ImageLength
      { tag: 258, type: 3, value: [8] }, // BitsPerSample
      { tag: 259, type: 3, value: [1] }, // Compression: none
      { tag: 262, type: 3, value: [1] }, // Photometric: black is zero
      { tag: 273, type: 4, value: [strip] }, // StripOffsets
      { tag: 277, type: 3, value: [1] }, // SamplesPerPixel
      { tag: 278, type: 3, value: [2] }, // RowsPerStrip
      { tag: 279, type: 4, value: [8] }, // StripByteCounts
      ...pointers,
      ...(page.tags ?? []),
    ]);
    u32(at, prevNext);
    first ||= at;
    prevNext = nextAt;
  }
  if (loop) u32(first, prevNext);
  return Uint8Array.from(out);
}


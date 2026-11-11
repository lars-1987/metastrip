import type { MetadataField, StripOptions } from "../processing/types";
import { Malformed, Reader, stripExif, type Entry } from "../processing/image/exif";
import { jpegExif, stripJpeg, withExif, MAX_EXIF_BYTES } from "../processing/image/jpeg";
import { heifExif } from "../processing/image/heic";
import { pngExif } from "../processing/image/png";
import { webpExif } from "../processing/image/webp";
import type { ConvertibleFormat } from "./formats";

/* What metadata a converted JPG carries.

   The canvas that encodes it starts with none, so by default nothing goes
   across. When the person keeps a category, the source's EXIF is carried
   over and run through the same EXIF stripper as the main tool, so a kept
   category means the same thing in both. Only EXIF travels: XMP, C2PA and
   the rest are left behind whatever the switches, the safe direction.

   Every output goes through the JPEG stripper first, because encoders add
   their own: Safari's canvas writes the image's width and height as EXIF,
   which would make "nothing left" untrue. */

const EVERYTHING: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

/** The source's EXIF block, to carry across; null when there's none or the
 *  container can't be walked. */
export function sourceExif(bytes: Uint8Array, format: ConvertibleFormat): Uint8Array | null {
  switch (format) {
    case "heic":
    case "avif":
      return heifExif(bytes);
    case "jpeg":
      return jpegExif(bytes);
    case "png":
      return pngExif(bytes);
    case "webp":
      return webpExif(bytes);
    default:
      return null;
  }
}

const TAG = {
  imageWidth: 0x0100,
  imageLength: 0x0101,
  orientation: 0x0112,
  exifIfd: 0x8769,
  pixelX: 0xa002,
  pixelY: 0xa003,
  thumbnailOffset: 0x0201,
  thumbnailLength: 0x0202,
};

/** A copy of the source's EXIF made true of the converted picture, or null
 *  when it can't be walked (then nothing is carried).
 *
 *  - Orientation becomes 1: the decoder has already turned the pixels
 *    upright, and a viewer obeying the old value would turn them again.
 *  - The size tags take the new size, which a rotation swaps.
 *  - The embedded thumbnail goes, with its IFD: a small copy of the original
 *    picture, stored the old way round, is not part of a new file. */
export function uprightExif(tiff: Uint8Array, width: number, height: number): Uint8Array | null {
  const out = tiff.slice();
  const view = new DataView(out.buffer);
  try {
    const r = new Reader(out);
    const set = (e: Entry | undefined, value: number) => {
      if (!e || e.count !== 1) return;
      if (e.type === 3) view.setUint16(e.valueAt, value, r.le);
      else if (e.type === 4) view.setUint32(e.valueAt, value, r.le);
    };
    const ifd0 = r.ifd("0th", r.u32(4));
    const in0 = (tag: number) => ifd0.entries.find((e) => e.tag === tag);
    set(in0(TAG.orientation), 1);
    set(in0(TAG.imageWidth), width);
    set(in0(TAG.imageLength), height);
    const exifAt = in0(TAG.exifIfd);
    if (exifAt) {
      const exif = r.ifd("Exif", r.u32(exifAt.valueAt));
      set(exif.entries.find((e) => e.tag === TAG.pixelX), width);
      set(exif.entries.find((e) => e.tag === TAG.pixelY), height);
    }

    const next = r.nextAt(ifd0);
    const ifd1At = r.u32(next);
    if (ifd1At !== 0) {
      view.setUint32(next, 0, r.le);
      const ifd1 = r.ifd("1st", ifd1At);
      const at = ifd1.entries.find((e) => e.tag === TAG.thumbnailOffset);
      const length = ifd1.entries.find((e) => e.tag === TAG.thumbnailLength);
      if (at && length) {
        const start = r.u32(at.valueAt);
        out.fill(0, start, Math.min(out.length, start + r.u32(length.valueAt)));
      }
      out.fill(0, ifd1.at, r.nextAt(ifd1) + 4);
    }
  } catch (err) {
    if (err instanceof Malformed) return null;
    throw err;
  }
  return out;
}

export interface Finished {
  bytes: Uint8Array;
  /** The source's EXIF fields the JPG carries, because their category was kept. */
  kept: MetadataField[];
}

/** The encoder's JPG with its own metadata gone and, where a category is
 *  kept, the source's EXIF for it. */
export function finishJpeg(
  jpeg: Uint8Array<ArrayBuffer>,
  source: Uint8Array | null,
  options: StripOptions,
  width: number,
  height: number
): Finished {
  const bare = stripJpeg(jpeg, EVERYTHING).cleaned;
  const upright = source && uprightExif(source, width, height);
  if (!upright) return { bytes: bare, kept: [] };
  const exif = stripExif(upright, options);
  // Too big for one segment only happens with a vendor's huge maker note:
  // carry nothing rather than a part.
  if (!exif.cleaned || exif.cleaned.length > MAX_EXIF_BYTES) return { bytes: bare, kept: [] };
  const removed = new Set(exif.fieldsRemoved);
  return { bytes: withExif(bare, exif.cleaned), kept: exif.fieldsFound.filter((f) => !removed.has(f)) };
}

/** EXIF blocks built tag by tag for the tests: the raw TIFF structure that a
 *  JPEG APP1 segment, a PNG eXIf chunk, a WebP EXIF chunk and a HEIF Exif item
 *  all carry. piexif can only write big-endian TIFF; most phones and cameras
 *  write little-endian, so this builds either. */

import { concat, type Bytes } from "./image-files.fixture";

/** TIFF field types used here: BYTE, ASCII, SHORT, LONG, RATIONAL, UNDEFINED, SRATIONAL. */
export const BYTE = 1, ASCII = 2, SHORT = 3, LONG = 4, RATIONAL = 5, UNDEFINED = 7, SRATIONAL = 10;
const TYPE_SIZE: Record<number, number> = {
  [BYTE]: 1, [ASCII]: 1, [SHORT]: 2, [LONG]: 4, [RATIONAL]: 8, [UNDEFINED]: 1, [SRATIONAL]: 8,
};

/** One IFD entry. RATIONAL values are flat numerator, denominator pairs;
 *  ASCII gets its NUL added; BYTE and UNDEFINED take bytes or a Latin-1 string. */
export interface TiffEntry {
  tag: number;
  type: number;
  value: string | number[] | Uint8Array;
}

export interface TiffSpec {
  littleEndian?: boolean;
  ifd0: TiffEntry[];
  exif?: TiffEntry[];
  gps?: TiffEntry[];
  /** IFD1, the thumbnail's IFD. The thumbnail's offset and length tags are added. */
  ifd1?: TiffEntry[];
  thumbnail?: Uint8Array;
}

const EXIF_IFD_POINTER = 0x8769;
const GPS_IFD_POINTER = 0x8825;
const THUMBNAIL_OFFSET = 0x0201;
const THUMBNAIL_LENGTH = 0x0202;

export function tiff(spec: TiffSpec): Bytes {
  const le = spec.littleEndian ?? false;
  const u16 = (v: number) => (le ? [v & 0xff, (v >>> 8) & 0xff] : [(v >>> 8) & 0xff, v & 0xff]);
  const u32 = (v: number) =>
    le
      ? [v & 0xff, (v >>> 8) & 0xff, (v >>> 16) & 0xff, (v >>> 24) & 0xff]
      : [(v >>> 24) & 0xff, (v >>> 16) & 0xff, (v >>> 8) & 0xff, v & 0xff];

  const encode = (e: TiffEntry): { bytes: number[]; count: number } => {
    if (e.type === ASCII) {
      const s = `${e.value as string}\0`;
      return { bytes: Array.from(s, (c) => c.charCodeAt(0) & 0xff), count: s.length };
    }
    if (e.type === BYTE || e.type === UNDEFINED) {
      const b = typeof e.value === "string" ? Array.from(e.value, (c) => c.charCodeAt(0) & 0xff) : Array.from(e.value);
      return { bytes: b, count: b.length };
    }
    const values = Array.from(e.value as number[]);
    const write = e.type === SHORT ? u16 : u32;
    const pairs = e.type === RATIONAL || e.type === SRATIONAL;
    return { bytes: values.flatMap(write), count: pairs ? values.length / 2 : values.length };
  };

  /** An IFD at `start`: count, 12-byte entries, next-IFD offset, then the
   *  values too big for an entry, each padded to an even length. Its length
   *  never depends on the offsets written into it. */
  const ifd = (entries: TiffEntry[], start: number, next: number): number[] => {
    const sorted = [...entries].sort((a, b) => a.tag - b.tag);
    const head: number[] = [...u16(sorted.length)];
    const data: number[] = [];
    let dataPos = start + 2 + 12 * sorted.length + 4;
    for (const e of sorted) {
      const { bytes, count } = encode(e);
      expectSize(e, bytes);
      head.push(...u16(e.tag), ...u16(e.type), ...u32(count));
      if (bytes.length <= 4) {
        head.push(...bytes, ...new Array<number>(4 - bytes.length).fill(0));
      } else {
        head.push(...u32(dataPos));
        data.push(...bytes);
        if (bytes.length % 2) data.push(0);
        dataPos += bytes.length + (bytes.length % 2);
      }
    }
    head.push(...u32(next));
    return [...head, ...data];
  };

  const long = (tag: number, v = 0): TiffEntry => ({ tag, type: LONG, value: [v] });
  const exif = spec.exif ?? [];
  const gps = spec.gps ?? [];
  const thumb = spec.thumbnail;
  const ifd1 = spec.ifd1 || thumb ? [...(spec.ifd1 ?? [])] : null;

  // Pass one measures, pass two writes the real offsets.
  const ifd0Entries = (exifAt: number, gpsAt: number) => [
    ...spec.ifd0,
    ...(spec.exif ? [long(EXIF_IFD_POINTER, exifAt)] : []),
    ...(spec.gps ? [long(GPS_IFD_POINTER, gpsAt)] : []),
  ];
  const ifd1Entries = (thumbAt: number) =>
    ifd1 && thumb ? [...ifd1, long(THUMBNAIL_OFFSET, thumbAt), long(THUMBNAIL_LENGTH, thumb.length)] : ifd1 ?? [];

  const at0 = 8;
  const atExif = at0 + ifd(ifd0Entries(0, 0), 0, 0).length;
  const atGps = atExif + (spec.exif ? ifd(exif, 0, 0).length : 0);
  const at1 = atGps + (spec.gps ? ifd(gps, 0, 0).length : 0);
  const atThumb = at1 + (ifd1 ? ifd(ifd1Entries(0), 0, 0).length : 0);

  return concat(
    le ? "II" : "MM",
    u16(42),
    u32(at0),
    ifd(ifd0Entries(atExif, atGps), at0, ifd1 ? at1 : 0),
    spec.exif ? ifd(exif, atExif, 0) : [],
    spec.gps ? ifd(gps, atGps, 0) : [],
    ifd1 ? ifd(ifd1Entries(atThumb), at1, 0) : [],
    thumb ?? []
  );
}

function expectSize(e: TiffEntry, bytes: number[]) {
  if (!TYPE_SIZE[e.type] || bytes.length % TYPE_SIZE[e.type]) throw new Error(`tag ${e.tag}: ${bytes.length} bytes for type ${e.type}`);
}

/** UTF-16LE with a terminating NUL, as Windows writes the XP* tags. */
export const ucs2 = (s: string): number[] => [...s, "\0"].flatMap((c) => [c.charCodeAt(0) & 0xff, c.charCodeAt(0) >>> 8]);

/** The smallest JPEG piexif accepts as a thumbnail: SOI, a frame and a scan
 *  header, a few data bytes, EOI. */
export const THUMBNAIL_JPEG = concat(
  [0xff, 0xd8],
  [0xff, 0xc0, 0, 11, 8, 0, 1, 0, 1, 1, 1, 0x11, 0],
  [0xff, 0xda, 0, 8, 1, 1, 0, 0, 63, 0],
  [0x7f, 0x00, 0x3f],
  [0xff, 0xd9]
);

/** Serial number inside the maker note, so a test can look for it in the output. */
export const MAKER_NOTE_SERIAL = "SN-4821-TEST";

/** EXIF the way a phone writes it: little-endian, a portrait photo stored
 *  sideways with Orientation 6, a vendor maker note, Windows' XPAuthor, a
 *  thumbnail, and a GPS fix in Melbourne (37.8136 S, 144.9631 E). */
export const phoneExif = (): Bytes =>
  tiff({
    littleEndian: true,
    ifd0: [
      { tag: 0x010f, type: ASCII, value: "Apple" }, // Make
      { tag: 0x0110, type: ASCII, value: "iPhone 15 Pro" }, // Model
      { tag: 0x0112, type: SHORT, value: [6] }, // Orientation
      { tag: 0x011a, type: RATIONAL, value: [72, 1] }, // XResolution
      { tag: 0x0131, type: ASCII, value: "17.5" }, // Software
      { tag: 0x0132, type: ASCII, value: "2026:07:01 12:00:00" }, // DateTime
      { tag: 0x9c9d, type: BYTE, value: ucs2("Jane") }, // XPAuthor
    ],
    exif: [
      { tag: 0x829d, type: RATIONAL, value: [178, 100] }, // FNumber
      { tag: 0x8827, type: SHORT, value: [100] }, // ISOSpeedRatings
      { tag: 0x9003, type: ASCII, value: "2026:07:01 12:00:00" }, // DateTimeOriginal
      { tag: 0x927c, type: UNDEFINED, value: `Apple iOS\0${MAKER_NOTE_SERIAL}` }, // MakerNote
      { tag: 0xa434, type: ASCII, value: "iPhone 15 Pro back camera" }, // LensModel
    ],
    gps: [
      { tag: 0x0000, type: BYTE, value: [2, 2, 0, 0] }, // GPSVersionID
      { tag: 0x0001, type: ASCII, value: "S" }, // GPSLatitudeRef
      { tag: 0x0002, type: RATIONAL, value: [37, 1, 48, 1, 4896, 100] }, // GPSLatitude
      { tag: 0x0003, type: ASCII, value: "E" }, // GPSLongitudeRef
      { tag: 0x0004, type: RATIONAL, value: [144, 1, 57, 1, 4716, 100] }, // GPSLongitude
      { tag: 0x0005, type: BYTE, value: [0] }, // GPSAltitudeRef
      { tag: 0x0006, type: RATIONAL, value: [12, 1] }, // GPSAltitude
    ],
    ifd1: [{ tag: 0x0103, type: SHORT, value: [6] }], // Compression: JPEG
    thumbnail: THUMBNAIL_JPEG,
  });

/** A TIFF header whose first IFD offset points far past the end of the block,
 *  followed by tags that are still readable as text: EXIF no reader can walk,
 *  holding a camera make anyway. */
export const unwalkableExif = (): Bytes => {
  const block = tiff({ littleEndian: true, ifd0: [{ tag: 0x010f, type: ASCII, value: "Apple" }, { tag: 0x0110, type: ASCII, value: "iPhone 15 Pro" }] });
  block.set([0x00, 0xff, 0xff, 0x00], 4);
  return block;
};

/** EXIF over 64 KB, which a JPEG segment can't hold but a HEIF item can: a
 *  maker note padded out to 70,000 bytes beside an ordinary make and GPS fix. */
export const largeExif = (): Bytes =>
  tiff({
    littleEndian: true,
    ifd0: [{ tag: 0x010f, type: ASCII, value: "Apple" }],
    exif: [{ tag: 0x927c, type: UNDEFINED, value: new Uint8Array(70_000) }],
    gps: [
      { tag: 0x0001, type: ASCII, value: "S" },
      { tag: 0x0002, type: RATIONAL, value: [37, 1, 48, 1, 4896, 100] },
      { tag: 0x0003, type: ASCII, value: "E" },
      { tag: 0x0004, type: RATIONAL, value: [144, 1, 57, 1, 4716, 100] },
    ],
  });

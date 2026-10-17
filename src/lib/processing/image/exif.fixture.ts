/** EXIF blocks for the tests: the raw TIFF structure that a JPEG APP1
 *  segment, a PNG eXIf chunk, a WebP EXIF chunk and a HEIF Exif item all
 *  carry. Most phones and cameras write little-endian, so these do too. */

import { concat, type Bytes } from "./image-files.fixture";
import { ASCII, BYTE, RATIONAL, SHORT, UNDEFINED, tiff, ucs2 } from "../../tiff-builder";

export * from "../../tiff-builder";

/** The smallest JPEG that passes for a thumbnail: SOI, a frame and a scan
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

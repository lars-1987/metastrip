/**
 * A small JPEG carrying fake EXIF, for the /terminal desktop: dragging the
 * desktop's photo.jpg onto the terminal strips this for real. Drawn on a
 * canvas so it is a genuine JPEG, then given an EXIF segment after its SOI.
 */

import { ASCII, BYTE, RATIONAL, tiff } from "./tiff-builder";

/** Degrees, minutes and hundredths of a second, as flat RATIONAL pairs. */
function degToDms(deg: number): number[] {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = Math.round(((Math.abs(deg) - d) * 60 - m) * 60 * 100);
  return [d, 1, m, 1, s, 100];
}

export function createDemoJpeg(): File {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const gradient = ctx.createLinearGradient(0, 0, 64, 64);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.5, "#16213e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(32, 32, 12, 0, Math.PI * 2);
  ctx.fill();

  const dataUri = canvas.toDataURL("image/jpeg", 0.92);

  const exif = tiff({
    ifd0: [
      { tag: 0x010e, type: ASCII, value: "A totally innocent photo" }, // ImageDescription
      { tag: 0x010f, type: ASCII, value: "Apple" }, // Make
      { tag: 0x0110, type: ASCII, value: "iPhone 15 Pro Max" }, // Model
      { tag: 0x0131, type: ASCII, value: "iOS 19.3.1" }, // Software
      { tag: 0x013b, type: ASCII, value: "John Privacy-Doesn't-Care" }, // Artist
      { tag: 0x8298, type: ASCII, value: "All Rights Reserved 2026" }, // Copyright
    ],
    exif: [
      { tag: 0x9003, type: ASCII, value: "2026:03:19 08:42:17" }, // DateTimeOriginal
      { tag: 0x9004, type: ASCII, value: "2026:03:19 08:42:17" }, // DateTimeDigitized
      { tag: 0xa431, type: ASCII, value: "DNQXYZ123456" }, // BodySerialNumber
      { tag: 0xa433, type: ASCII, value: "Apple" }, // LensMake
      { tag: 0xa434, type: ASCII, value: "iPhone 15 Pro Max back triple camera 6.765mm f/1.78" }, // LensModel
    ],
    gps: [
      { tag: 0x0001, type: ASCII, value: "N" }, // GPSLatitudeRef
      { tag: 0x0002, type: RATIONAL, value: degToDms(37.7749) }, // GPSLatitude
      { tag: 0x0003, type: ASCII, value: "W" }, // GPSLongitudeRef
      { tag: 0x0004, type: RATIONAL, value: degToDms(122.4194) }, // GPSLongitude
      { tag: 0x0005, type: BYTE, value: [0] }, // GPSAltitudeRef
      { tag: 0x0006, type: RATIONAL, value: [52, 1] }, // GPSAltitude
    ],
  });

  // The canvas JPEG with an APP1 segment ("Exif\0\0" and the TIFF) after
  // SOI, or after the JFIF APP0 segment when there is one, which comes first.
  const jpeg = Uint8Array.from(atob(dataUri.split(",")[1]), (c) => c.charCodeAt(0));
  const at = jpeg[2] === 0xff && jpeg[3] === 0xe0 ? 4 + ((jpeg[4] << 8) | jpeg[5]) : 2;
  const length = 2 + 6 + exif.length;
  const bytes = new Uint8Array(jpeg.length + 2 + length);
  bytes.set(jpeg.subarray(0, at));
  bytes.set([0xff, 0xe1, length >> 8, length & 0xff, 0x45, 0x78, 0x69, 0x66, 0, 0], at);
  bytes.set(exif, at + 10);
  bytes.set(jpeg.subarray(at), at + 10 + exif.length);
  return new File([bytes], "photo.jpg", { type: "image/jpeg" });
}

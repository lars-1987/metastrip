/**
 * Creates a small demo JPEG file with fake EXIF metadata for the desktop easter egg.
 * Generates a real JPEG via canvas, then injects EXIF with piexifjs.
 */

import piexif from "piexifjs";

function degToDms(deg: number): [[number, number], [number, number], [number, number]] {
  const d = Math.floor(Math.abs(deg));
  const m = Math.floor((Math.abs(deg) - d) * 60);
  const s = Math.round(((Math.abs(deg) - d) * 60 - m) * 60 * 100);
  return [[d, 1], [m, 1], [s, 100]];
}

export function createDemoJpeg(): File {
  // Generate a real JPEG using canvas — guaranteed valid
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  // Draw a little gradient so it's not just white
  const gradient = ctx.createLinearGradient(0, 0, 64, 64);
  gradient.addColorStop(0, "#1a1a2e");
  gradient.addColorStop(0.5, "#16213e");
  gradient.addColorStop(1, "#0f3460");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  // Add a little camera icon hint
  ctx.fillStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.arc(32, 32, 12, 0, Math.PI * 2);
  ctx.fill();

  // Get as JPEG data URI
  const dataUri = canvas.toDataURL("image/jpeg", 0.92);

  // Build EXIF data
  const exifObj: Record<string, Record<number, unknown>> = {
    "0th": {
      [piexif.ImageIFD.Make]: "Apple",
      [piexif.ImageIFD.Model]: "iPhone 15 Pro Max",
      [piexif.ImageIFD.Software]: "iOS 19.3.1",
      [piexif.ImageIFD.Artist]: "John Privacy-Doesn't-Care",
      [piexif.ImageIFD.Copyright]: "All Rights Reserved 2026",
      [piexif.ImageIFD.ImageDescription]: "A totally innocent photo",
    },
    Exif: {
      [piexif.ExifIFD.DateTimeOriginal]: "2026:03:19 08:42:17",
      [piexif.ExifIFD.DateTimeDigitized]: "2026:03:19 08:42:17",
      [piexif.ExifIFD.LensMake]: "Apple",
      [piexif.ExifIFD.LensModel]: "iPhone 15 Pro Max back triple camera 6.765mm f/1.78",
      [piexif.ExifIFD.BodySerialNumber]: "DNQXYZ123456",
    },
    GPS: {
      [piexif.GPSIFD.GPSLatitudeRef]: "N",
      [piexif.GPSIFD.GPSLatitude]: degToDms(37.7749),
      [piexif.GPSIFD.GPSLongitudeRef]: "W",
      [piexif.GPSIFD.GPSLongitude]: degToDms(122.4194),
      [piexif.GPSIFD.GPSAltitudeRef]: 0,
      [piexif.GPSIFD.GPSAltitude]: [52, 1] as unknown as number,
    },
  };

  const exifBytes = piexif.dump(exifObj);
  const inserted = piexif.insert(exifBytes, dataUri);

  // Convert data URI to File
  const byteString = atob(inserted.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  return new File([ab], "photo.jpg", { type: "image/jpeg" });
}

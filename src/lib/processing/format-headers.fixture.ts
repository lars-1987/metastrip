/** Tiny real headers for every format, shared by the identification tests.
 *
 *  Each case is what a browser would hand us: a file name, the MIME type the
 *  operating system guessed, and the first 32 bytes (what the coordinator
 *  reads). `today` pins what the current functions return, so a change in
 *  behaviour shows up as a failing row rather than going unnoticed. */

export interface HeaderCase {
  label: string;
  name: string;
  mime: string;
  head: Uint8Array;
  today: {
    /** sniffFormat(head) */
    sniff: string | null;
    /** detectFileType(file), from MIME then extension */
    detect: string | null;
  };
}

/** Bytes from ASCII strings and raw numbers, zero-padded to 32. */
export function bytes(...parts: (string | number[])[]): Uint8Array {
  const out: number[] = [];
  for (const p of parts) {
    if (typeof p === "string") for (const ch of p) out.push(ch.charCodeAt(0));
    else out.push(...p);
  }
  while (out.length < 32) out.push(0);
  return Uint8Array.from(out);
}

/** An ISO base media `ftyp` box: size, "ftyp", major brand, minor version,
 *  compatible brands. */
export function ftyp(major: string, ...compatible: string[]): Uint8Array {
  const size = 16 + 4 * compatible.length;
  return bytes([0, 0, 0, size], "ftyp", major, [0, 0, 0, 0], ...compatible);
}

const DOCX = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
const XLSX = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const PPTX = "application/vnd.openxmlformats-officedocument.presentationml.presentation";
const ZIP = bytes("PK", [3, 4, 20, 0, 6, 0]);

export const HEADER_CASES: HeaderCase[] = [
  // Images
  { label: "JPEG", name: "photo.jpg", mime: "image/jpeg", head: bytes([0xff, 0xd8, 0xff, 0xe0, 0, 16], "JFIF"), today: { sniff: "jpeg", detect: "jpeg" } },
  { label: "PNG", name: "shot.png", mime: "image/png", head: bytes([0x89], "PNG", [13, 10, 26, 10, 0, 0, 0, 13], "IHDR"), today: { sniff: "png", detect: "png" } },
  { label: "WebP", name: "pic.webp", mime: "image/webp", head: bytes("RIFF", [36, 0, 0, 0], "WEBPVP8 "), today: { sniff: "webp", detect: "webp" } },
  { label: "GIF", name: "anim.gif", mime: "image/gif", head: bytes("GIF89a"), today: { sniff: "gif", detect: "gif" } },
  { label: "HEIC", name: "IMG_0001.HEIC", mime: "image/heic", head: ftyp("heic", "mif1", "heic"), today: { sniff: "heic", detect: "heic" } },
  { label: "HEIF with a mif1 major brand", name: "IMG_0002.heif", mime: "image/heif", head: ftyp("mif1", "mif1", "heic"), today: { sniff: "heic", detect: "heic" } },
  { label: "AVIF", name: "pic.avif", mime: "image/avif", head: ftyp("avif", "mif1", "miaf"), today: { sniff: "avif", detect: "avif" } },
  { label: "AVIF with a mif1 major brand", name: "pic.avif", mime: "image/avif", head: ftyp("mif1", "mif1", "avif"), today: { sniff: "avif", detect: "avif" } },
  { label: "TIFF, little-endian", name: "scan.tif", mime: "image/tiff", head: bytes("II*", [0, 8, 0, 0, 0]), today: { sniff: "tiff", detect: "tiff" } },
  { label: "TIFF, big-endian", name: "scan.tiff", mime: "image/tiff", head: bytes("MM", [0], "*", [0, 0, 0, 8]), today: { sniff: "tiff", detect: "tiff" } },
  { label: "BMP", name: "old.bmp", mime: "image/bmp", head: bytes("BM", [0x36, 0x10, 0, 0]), today: { sniff: "bmp", detect: null } },

  // Documents
  { label: "PDF", name: "doc.pdf", mime: "application/pdf", head: bytes("%PDF-1.7\n"), today: { sniff: "pdf", detect: "pdf" } },
  { label: "DOCX", name: "letter.docx", mime: DOCX, head: ZIP, today: { sniff: null, detect: "docx" } },
  { label: "XLSX", name: "sheet.xlsx", mime: XLSX, head: ZIP, today: { sniff: null, detect: "xlsx" } },
  { label: "PPTX", name: "deck.pptx", mime: PPTX, head: ZIP, today: { sniff: null, detect: "pptx" } },

  // Video
  { label: "MP4", name: "clip.mp4", mime: "video/mp4", head: ftyp("isom", "isom", "iso2", "mp41"), today: { sniff: "mp4", detect: "mp4" } },
  { label: "MOV", name: "IMG_0003.MOV", mime: "video/quicktime", head: ftyp("qt  ", "qt  "), today: { sniff: "mov", detect: "mov" } },
  { label: "M4V", name: "film.m4v", mime: "video/x-m4v", head: ftyp("M4V ", "M4V ", "mp42"), today: { sniff: "mp4", detect: "mp4" } },

  // Audio
  { label: "M4A", name: "voice.m4a", mime: "audio/mp4", head: ftyp("M4A ", "M4A ", "mp42", "isom"), today: { sniff: "mp4", detect: "m4a" } },
  { label: "MP3 with an ID3 tag", name: "song.mp3", mime: "audio/mpeg", head: bytes("ID3", [4, 0, 0, 0, 0, 0, 0]), today: { sniff: "mp3", detect: "mp3" } },
  { label: "MP3 without an ID3 tag", name: "raw.mp3", mime: "audio/mpeg", head: bytes([0xff, 0xfb, 0x90, 0x64]), today: { sniff: null, detect: "mp3" } },
  { label: "FLAC", name: "track.flac", mime: "audio/flac", head: bytes("fLaC", [0, 0, 0, 34]), today: { sniff: "flac", detect: "flac" } },
  { label: "WAV", name: "take.wav", mime: "audio/wav", head: bytes("RIFF", [36, 0, 0, 0], "WAVEfmt "), today: { sniff: "wav", detect: "wav" } },

  // Where the name and the bytes disagree, or the browser gives no MIME type
  { label: "JPEG named .png", name: "photo.png", mime: "image/png", head: bytes([0xff, 0xd8, 0xff, 0xe1]), today: { sniff: "jpeg", detect: "png" } },
  { label: "HEIC with no MIME type", name: "IMG_0004.HEIC", mime: "", head: ftyp("heic", "mif1", "heic"), today: { sniff: "heic", detect: "heic" } },
  { label: "AVIF with no MIME type", name: "pic.avif", mime: "", head: ftyp("avif", "mif1"), today: { sniff: "avif", detect: "avif" } },
  { label: "DOCX with no MIME type", name: "letter.docx", mime: "", head: ZIP, today: { sniff: null, detect: null } },
  { label: "HEIC tagged octet-stream", name: "IMG_0005.heic", mime: "application/octet-stream", head: ftyp("heic", "mif1"), today: { sniff: "heic", detect: "heic" } },

  // Not a format we know
  { label: "Plain text", name: "notes.txt", mime: "text/plain", head: bytes("hello, this is a text file"), today: { sniff: null, detect: null } },
  { label: "RIFF AVI", name: "old.avi", mime: "video/x-msvideo", head: bytes("RIFF", [36, 0, 0, 0], "AVI LIST"), today: { sniff: null, detect: null } },
  { label: "Header under 12 bytes", name: "tiny.jpg", mime: "image/jpeg", head: Uint8Array.from([0xff, 0xd8, 0xff]), today: { sniff: null, detect: "jpeg" } },
];

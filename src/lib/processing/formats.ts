import type { FileCategory } from "./types";

/* The format registry: every format MetaStrip can identify, in one table.

   Adding a format is one entry here (plus its processor in the coordinator,
   which the type checker asks for once the entry is marked supported).
   Identification has one rule, used at drop time and again before
   processing, so the two can never disagree: the leading bytes decide; the
   MIME type and then the extension decide only when the bytes are
   ambiguous. */

interface FormatEntry {
  label: string;
  category: FileCategory;
  /** supported: we can strip it. recognised: we can name it, not strip it. */
  status: "supported" | "recognised";
  mimes: readonly string[];
  extensions: readonly string[];
}

// Entry order is the order formats are listed to the user.
const FORMATS = {
  jpeg: { label: "JPEG", category: "image", status: "supported", mimes: ["image/jpeg"], extensions: ["jpg", "jpeg"] },
  png: { label: "PNG", category: "image", status: "supported", mimes: ["image/png"], extensions: ["png"] },
  webp: { label: "WebP", category: "image", status: "supported", mimes: ["image/webp"], extensions: ["webp"] },
  gif: { label: "GIF", category: "image", status: "supported", mimes: ["image/gif"], extensions: ["gif"] },
  heic: {
    label: "HEIC", category: "image", status: "supported",
    mimes: ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"],
    extensions: ["heic", "heif"],
  },
  avif: { label: "AVIF", category: "image", status: "supported", mimes: ["image/avif"], extensions: ["avif"] },
  pdf: { label: "PDF", category: "document", status: "supported", mimes: ["application/pdf"], extensions: ["pdf"] },
  docx: {
    label: "DOCX", category: "document", status: "supported",
    mimes: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
    extensions: ["docx"],
  },
  xlsx: {
    label: "XLSX", category: "document", status: "supported",
    mimes: ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
    extensions: ["xlsx"],
  },
  pptx: {
    label: "PPTX", category: "document", status: "supported",
    mimes: ["application/vnd.openxmlformats-officedocument.presentationml.presentation"],
    extensions: ["pptx"],
  },
  mp4: { label: "MP4", category: "video", status: "supported", mimes: ["video/mp4", "video/x-m4v"], extensions: ["mp4", "m4v"] },
  mov: { label: "MOV", category: "video", status: "supported", mimes: ["video/quicktime"], extensions: ["mov"] },
  mp3: { label: "MP3", category: "audio", status: "supported", mimes: ["audio/mpeg", "audio/mp3"], extensions: ["mp3"] },
  m4a: { label: "M4A", category: "audio", status: "supported", mimes: ["audio/mp4", "audio/x-m4a", "audio/aac"], extensions: ["m4a"] },
  flac: { label: "FLAC", category: "audio", status: "supported", mimes: ["audio/flac", "audio/x-flac"], extensions: ["flac"] },
  wav: { label: "WAV", category: "audio", status: "supported", mimes: ["audio/wav", "audio/x-wav", "audio/wave"], extensions: ["wav"] },
  tiff: { label: "TIFF", category: "image", status: "recognised", mimes: ["image/tiff"], extensions: ["tif", "tiff"] },
  bmp: { label: "BMP", category: "image", status: "recognised", mimes: ["image/bmp"], extensions: ["bmp"] },
} as const satisfies Record<string, FormatEntry>;

type Formats = typeof FORMATS;
export type Format = keyof Formats;
export type SupportedFormat = { [F in Format]: Formats[F]["status"] extends "supported" ? F : never }[Format];
export type RecognisedFormat = Exclude<Format, SupportedFormat>;

export type Identity =
  | { status: "supported"; format: SupportedFormat }
  | { status: "recognised"; format: RecognisedFormat }
  | { status: "unknown" };

const ALL = Object.keys(FORMATS) as Format[];

/** Identify a file: bytes first, then MIME type, then extension. Reads only
 *  the first 32 bytes. */
export async function identify(file: File): Promise<Identity> {
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const format =
    formatFromBytes(head) ??
    ALL.find((f) => (FORMATS[f].mimes as readonly string[]).includes(file.type)) ??
    ALL.find((f) => (FORMATS[f].extensions as readonly string[]).includes(extensionOf(file.name)));
  if (!format) return { status: "unknown" };
  return { status: FORMATS[format].status, format } as Identity;
}

export function labelOf(format: Format): string {
  return FORMATS[format].label;
}

export function categoryOf(format: Format): FileCategory {
  return FORMATS[format].category;
}

/** Supported formats in display order, for listing what the tool accepts. */
export const SUPPORTED_FORMATS = ALL.filter(
  (f): f is SupportedFormat => FORMATS[f].status === "supported"
);

/** The file input's `accept` value. It only narrows the picker dialog, so it
 *  lists recognised formats too: picking a TIFF should get the plain "not
 *  supported yet" message, not a greyed-out file. */
export const ACCEPT_ATTRIBUTE = ALL.flatMap((f) => [
  ...FORMATS[f].mimes,
  ...FORMATS[f].extensions.map((e) => `.${e}`),
]).join(",");

function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot >= 0 ? name.slice(dot + 1).toLowerCase() : "";
}

/** The format the leading bytes prove, or null when they are ambiguous (zip
 *  containers, MP3 frames with no ID3 tag) or unknown.
 *
 *  `File.type` is the operating system guessing from the extension, so a JPEG
 *  saved as photo.png arrives tagged image/png. The bytes are the only
 *  reliable answer. */
function formatFromBytes(head: Uint8Array): Format | null {
  if (head.length < 12) return null;
  const at = (i: number, len: number) => String.fromCharCode(...head.subarray(i, i + len));

  if (head[0] === 0x89 && at(1, 3) === "PNG") return "png";
  if (head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff) return "jpeg";
  if (at(0, 3) === "GIF") return "gif";
  if (at(0, 4) === "II*\u0000" || at(0, 4) === "MM\u0000*") return "tiff";
  if (at(0, 5) === "%PDF-") return "pdf";
  if (at(0, 4) === "fLaC") return "flac";
  if (at(0, 3) === "ID3") return "mp3";
  if (head[0] === 0x42 && head[1] === 0x4d) return "bmp";
  if (at(0, 4) === "RIFF") {
    const kind = at(8, 4);
    if (kind === "WEBP") return "webp";
    if (kind === "WAVE") return "wav";
    return null;
  }
  // ISO base media: HEIC, AVIF, MP4, MOV and M4A all carry `ftyp` at byte 4.
  if (at(4, 4) === "ftyp") {
    const brand = at(8, 4);
    if (brand.startsWith("avi")) return "avif";
    if (brand.startsWith("hei") || brand.startsWith("mif") || brand.startsWith("msf")) {
      // A generic HEIF major brand (mif1) with AV1 images names avif among its
      // compatible brands, which start at byte 16 after the minor version.
      for (let i = 16; i + 4 <= head.length && i < 8 + boxSize(head); i += 4) {
        if (at(i, 3) === "avi") return "avif";
      }
      return "heic";
    }
    if (brand === "qt  ") return "mov";
    // Apple's audio brands: music, audiobooks, protected music.
    if (brand === "M4A " || brand === "M4B " || brand === "M4P ") return "m4a";
    return "mp4";
  }
  return null;
}

/** The ftyp box's declared size, from its first four bytes. */
function boxSize(head: Uint8Array): number {
  return ((head[0] << 24) | (head[1] << 16) | (head[2] << 8) | head[3]) >>> 0;
}

import { findBox, iterBoxes, readFullBoxHeader } from "../processing/isobmff";
import type { ConvertibleFormat } from "./formats";

/* Which colour space the converted JPG should be in.

   Wide-colour photos (every recent iPhone shoots Display P3) keep their
   colour only if the canvas that encodes them is P3 too. An ordinary sRGB
   photo should stay sRGB: drawn into a P3 canvas it would be re-encoded in
   different numbers and tagged P3, and a viewer that ignores profiles would
   show it dull. So the source's own colour information decides.

   Where the browser decodes (JPG, PNG, WebP, AVIF, and HEIC in Safari) it
   converts from the source's profile into the canvas itself, so all this
   picks is the room: any wide-gamut source gets a P3 canvas. Where libheif
   decodes it hands over the raw values, which are tagged P3 as they are;
   that's exact for Display P3, which is what HEIC photos carry. */

export type Colour = "display-p3" | "srgb";

/** The colour space a JPG made from these bytes should use. Never throws:
 *  anything unreadable is sRGB, as browsers treat untagged images. */
export async function sourceColour(bytes: Uint8Array, format: ConvertibleFormat): Promise<Colour> {
  try {
    switch (format) {
      case "heic":
      case "avif":
        return heifColour(bytes);
      case "jpeg":
        return iccColour(jpegIcc(bytes));
      case "webp":
        return iccColour(webpIcc(bytes));
      case "png":
        return await pngColour(bytes);
      default:
        return "srgb";
    }
  } catch {
    return "srgb";
  }
}

/* ── ICC profiles ──────────────────────────────────────────────────── */

/** sRGB's red primary has X 0.436 in an ICC profile; Display P3's is 0.515,
 *  Adobe RGB's 0.610, Rec. 2020's 0.674. Halfway to P3 tells them apart. */
const WIDE_RED_X = 0.47;

/** Whether an RGB profile's red primary lies outside sRGB's. Profiles without
 *  primaries (lookup tables, grey, CMYK) count as sRGB. */
export function iccIsWide(icc: Uint8Array): boolean {
  if (icc.length < 132) return false;
  const view = new DataView(icc.buffer, icc.byteOffset, icc.byteLength);
  if (ascii(icc, 16, 4) !== "RGB ") return false;
  const count = view.getUint32(128);
  for (let i = 0; i < count && 132 + 12 * (i + 1) <= icc.length; i++) {
    const entry = 132 + 12 * i;
    if (ascii(icc, entry, 4) !== "rXYZ") continue;
    const at = view.getUint32(entry + 4);
    if (at + 12 > icc.length || ascii(icc, at, 4) !== "XYZ ") return false;
    return view.getInt32(at + 8) / 65536 > WIDE_RED_X;
  }
  return false;
}

const iccColour = (icc: Uint8Array | null): Colour => (icc && iccIsWide(icc) ? "display-p3" : "srgb");

/* ── HEIC and AVIF: the colr property ──────────────────────────────── */

/** CICP colour primaries 12: Display P3 (P3 primaries, D65 white). */
const CICP_P3 = 12;

/** From the colr properties in meta/iprp/ipco: an ICC profile, or CICP
 *  numbers (nclx). Any P3 one wins: a photo's tiles and its grid can each
 *  carry one, and they agree. */
function heifColour(bytes: Uint8Array): Colour {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const meta = findBox(view, 0, view.byteLength, "meta");
  if (!meta) return "srgb";
  const iprp = findBox(view, readFullBoxHeader(view, meta).childrenStart, meta.end, "iprp");
  const ipco = iprp && findBox(view, iprp.contentStart, iprp.end, "ipco");
  if (!ipco) return "srgb";
  for (const colr of iterBoxes(view, ipco.contentStart, ipco.end)) {
    if (colr.type !== "colr" || colr.end - colr.contentStart < 4) continue;
    const kind = ascii(bytes, colr.contentStart, 4);
    const body = colr.contentStart + 4;
    if (kind === "nclx" && body + 2 <= colr.end && view.getUint16(body) === CICP_P3) return "display-p3";
    if ((kind === "prof" || kind === "rICC") && iccIsWide(bytes.subarray(body, colr.end))) return "display-p3";
  }
  return "srgb";
}

/* ── JPEG, WebP and PNG profiles ───────────────────────────────────── */

const ICC_MARKER = "ICC_PROFILE\0";

/** A JPEG's profile: APP2 segments, each "ICC_PROFILE\0", its number, the
 *  count, then a piece of the profile. */
function jpegIcc(b: Uint8Array): Uint8Array | null {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  const pieces: { n: number; data: Uint8Array }[] = [];
  let at = 2;
  while (at + 4 <= b.length && b[at] === 0xff) {
    const marker = b[at + 1];
    if (marker === 0xda || marker === 0xd9) break; // image data: no more headers
    const end = at + 2 + ((b[at + 2] << 8) | b[at + 3]);
    if (end > b.length) break;
    if (marker === 0xe2 && ascii(b, at + 4, 12) === ICC_MARKER) pieces.push({ n: b[at + 16], data: b.subarray(at + 18, end) });
    at = end;
  }
  if (!pieces.length) return null;
  return join(pieces.sort((x, y) => x.n - y.n).map((p) => p.data));
}

/** A WebP's profile: the ICCP chunk. */
function webpIcc(b: Uint8Array): Uint8Array | null {
  if (ascii(b, 0, 4) !== "RIFF" || ascii(b, 8, 4) !== "WEBP") return null;
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let at = 12; at + 8 <= b.length; ) {
    const size = view.getUint32(at + 4, true);
    if (ascii(b, at, 4) === "ICCP") return b.subarray(at + 8, Math.min(b.length, at + 8 + size));
    at += 8 + size + (size % 2);
  }
  return null;
}

/** A PNG's colour: CICP numbers (cICP), which take precedence, or an ICC
 *  profile (iCCP: a name, a method byte, then the zlib-compressed profile). */
async function pngColour(b: Uint8Array): Promise<Colour> {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  let icc: Uint8Array | null = null;
  for (let at = 8; at + 12 <= b.length; ) {
    const size = view.getUint32(at);
    const type = ascii(b, at + 4, 4);
    const data = b.subarray(at + 8, Math.min(b.length, at + 8 + size));
    if (type === "cICP") return data[0] === CICP_P3 ? "display-p3" : "srgb";
    if (type === "iCCP") icc = data;
    if (type === "IDAT" || type === "IEND") break; // colour chunks come first
    at += 12 + size;
  }
  if (!icc) return "srgb";
  const compressed = icc.subarray(icc.indexOf(0) + 2);
  const stream = new Blob([compressed as Uint8Array<ArrayBuffer>]).stream().pipeThrough(new DecompressionStream("deflate"));
  return iccColour(new Uint8Array(await new Response(stream).arrayBuffer()));
}

/* ── Helpers ───────────────────────────────────────────────────────── */

function ascii(b: Uint8Array, at: number, length: number): string {
  let s = "";
  for (let i = at; i < at + length && i < b.length; i++) s += String.fromCharCode(b[i]);
  return s;
}

function join(parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) {
    out.set(p, at);
    at += p.length;
  }
  return out;
}

/* ──────────────────────────────────────────────────────────────────
   Shared ISOBMFF (ISO base media file format) box primitives.

   HEIC/HEIF and MP4/MOV both use this box grammar. These generic
   readers are used by the HEIC processor; the MP4 processor keeps its
   own private copies for now (can adopt this module later).
   ────────────────────────────────────────────────────────────────── */

export interface BoxInfo {
  offset: number;
  size: number;
  type: string;
  /** byte offset where children/content begin (immediately after the header) */
  contentStart: number;
  /** byte offset where this box ends */
  end: number;
  /** true if size was specified as 64-bit */
  largeSize: boolean;
}

const ASCII = new TextDecoder("ascii");

/** Parse one box header at `offset`. Returns null if malformed / out of range. */
export function readBox(view: DataView, offset: number): BoxInfo | null {
  if (offset + 8 > view.byteLength) return null;
  const size32 = view.getUint32(offset);
  const type = ASCII.decode(
    new Uint8Array(view.buffer, view.byteOffset + offset + 4, 4)
  );

  let size = size32;
  let headerSize = 8;
  let largeSize = false;

  if (size32 === 0) {
    size = view.byteLength - offset; // extends to EOF
  } else if (size32 === 1) {
    if (offset + 16 > view.byteLength) return null;
    const high = view.getUint32(offset + 8);
    const low = view.getUint32(offset + 12);
    size = high * 0x100000000 + low;
    headerSize = 16;
    largeSize = true;
  }

  if (size < headerSize || offset + size > view.byteLength) return null;

  return {
    offset,
    size,
    type,
    contentStart: offset + headerSize,
    end: offset + size,
    largeSize,
  };
}

/** Iterate sibling boxes across [start, end). */
export function* iterBoxes(
  view: DataView,
  start: number,
  end: number
): Generator<BoxInfo> {
  let pos = start;
  while (pos < end) {
    const box = readBox(view, pos);
    if (!box) break;
    yield box;
    if (box.size === 0) break; // safety
    pos = box.end;
  }
}

/** Find the first child box of a given type within [start, end). */
export function findBox(
  view: DataView,
  start: number,
  end: number,
  type: string
): BoxInfo | null {
  for (const box of iterBoxes(view, start, end)) {
    if (box.type === type) return box;
  }
  return null;
}

/** A FullBox has a 1-byte version + 3-byte flags header before its content. */
export interface FullBoxHeader {
  version: number;
  flags: number;
  /** byte offset where the FullBox payload begins (after version+flags) */
  childrenStart: number;
}

export function readFullBoxHeader(view: DataView, box: BoxInfo): FullBoxHeader {
  const version = view.getUint8(box.contentStart);
  const flags =
    (view.getUint8(box.contentStart + 1) << 16) |
    (view.getUint8(box.contentStart + 2) << 8) |
    view.getUint8(box.contentStart + 3);
  return { version, flags, childrenStart: box.contentStart + 4 };
}

/** Read a big-endian unsigned integer of `byteCount` bytes (0 → 0). */
export function readUintN(view: DataView, offset: number, byteCount: number): number {
  let v = 0;
  for (let i = 0; i < byteCount; i++) {
    v = v * 256 + view.getUint8(offset + i);
  }
  return v;
}

export function writeAscii(buf: Uint8Array, offset: number, text: string) {
  for (let i = 0; i < text.length; i++) buf[offset + i] = text.charCodeAt(i);
}

/** Zero `length` bytes starting at `offset` (in-place metadata neutralization). */
export function zeroBytes(buf: Uint8Array, offset: number, length: number) {
  buf.fill(0, offset, offset + length);
}

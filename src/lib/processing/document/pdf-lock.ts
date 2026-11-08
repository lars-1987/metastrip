import { PDFArray, PDFBool, PDFDict, PDFHexString, PDFName, PDFNumber, PDFString, type PDFDocument } from "pdf-lib";

/* Whether an encrypted PDF opens without a password.

   An encrypted PDF is locked one of two ways. Most ask for nothing when opened:
   the "user" password is empty, and only an "owner" password guards printing,
   copying or editing. The rest need a password just to open. pdf-lib can't
   change either kind, but the advice differs: someone with a password-to-open
   PDF can unlock it with that password; someone whose PDF opens freely usually
   has no password to give.

   Telling them apart is the PDF standard security handler's own check, run
   with an empty password: derive the key, rebuild the /U entry from it and
   compare (ISO 32000-1 §7.6.3.4, algorithms 2, 4 and 5; ISO 32000-2 §7.6.4.3.4
   for AES-256). Nothing is decrypted. Only the trailer's /ID and the /Encrypt
   dictionary are read, and the standard leaves those unencrypted. */

/** The 32-byte pad every pre-AES-256 password is filled out with. */
const PAD = Uint8Array.from([
  0x28, 0xbf, 0x4e, 0x5e, 0x4e, 0x75, 0x8a, 0x41, 0x64, 0x00, 0x4e, 0x56, 0xff, 0xfa, 0x01, 0x08,
  0x2e, 0x2e, 0x00, 0xb6, 0xd0, 0x68, 0x3e, 0x80, 0x2f, 0x0c, 0xa9, 0xfe, 0x64, 0x53, 0x69, 0x7a,
]);

/**
 * True if the PDF opens without a password, false if it needs one, and
 * undefined when it can't be told: a security handler other than the standard
 * one (certificates), a revision this doesn't know, or an /Encrypt dictionary
 * missing what the check needs.
 */
export async function opensWithoutPassword(pdfDoc: PDFDocument): Promise<boolean | undefined> {
  const ctx = pdfDoc.context;
  const encrypt = ctx.lookup(ctx.trailerInfo.Encrypt);
  if (!(encrypt instanceof PDFDict)) return undefined;
  if (name(encrypt, "Filter") !== "Standard") return undefined;

  const r = num(encrypt, "R");
  const u = bytes(encrypt, "U");
  if (r === undefined || !u) return undefined;

  if (r === 5 || r === 6) {
    if (u.length < 40) return undefined;
    const salt = u.subarray(32, 40);
    const hash = r === 5 ? await sha("SHA-256", salt) : await hardenedHash(salt);
    return equal(hash.subarray(0, 32), u.subarray(0, 32));
  }

  if (r < 2 || r > 4) return undefined;
  const o = bytes(encrypt, "O");
  const p = num(encrypt, "P");
  const ids = ctx.lookup(ctx.trailerInfo.ID);
  const id0 = ids instanceof PDFArray ? stringBytes(ids.lookup(0)) : undefined;
  if (!o || p === undefined || u.length < 16) return undefined;

  // Key length in bytes: always 5 for revision 2, /Length bits otherwise. A
  // crypt filter's AESV2 is 128-bit whatever /Length says.
  const lengthBits = r === 2 ? 40 : (num(encrypt, "Length") ?? 40);
  const n = r === 2 ? 5 : Math.min(16, Math.max(5, Math.floor(lengthBits / 8)));

  // Algorithm 2: the file key from an empty password.
  const metadataClear = r === 4 && encrypt.lookup(PDFName.of("EncryptMetadata")) === PDFBool.False;
  const pBytes = new Uint8Array(4);
  new DataView(pBytes.buffer).setInt32(0, p, true);
  let key = md5(concat(PAD, o.subarray(0, 32), pBytes, id0 ?? new Uint8Array(0), metadataClear ? Uint8Array.of(0xff, 0xff, 0xff, 0xff) : new Uint8Array(0)));
  if (r >= 3) for (let i = 0; i < 50; i++) key = md5(key.subarray(0, n));
  key = key.subarray(0, n);

  if (r === 2) {
    // Algorithm 4: /U is the pad encrypted with the key.
    return equal(rc4(key, PAD), u.subarray(0, 32));
  }
  // Algorithm 5: hash the pad with the ID, encrypt it 20 times with variants
  // of the key, and compare the first 16 bytes.
  let x = rc4(key, md5(concat(PAD, id0 ?? new Uint8Array(0))));
  for (let i = 1; i <= 19; i++) x = rc4(key.map((b) => b ^ i), x);
  return equal(x, u.subarray(0, 16));
}

function name(dict: PDFDict, key: string): string | undefined {
  const v = dict.lookup(PDFName.of(key));
  return v instanceof PDFName ? v.decodeText() : undefined;
}

function num(dict: PDFDict, key: string): number | undefined {
  const v = dict.lookup(PDFName.of(key));
  return v instanceof PDFNumber ? v.asNumber() : undefined;
}

function stringBytes(v: unknown): Uint8Array | undefined {
  return v instanceof PDFString || v instanceof PDFHexString ? v.asBytes() : undefined;
}

function bytes(dict: PDFDict, key: string): Uint8Array | undefined {
  return stringBytes(dict.lookup(PDFName.of(key)));
}

function concat(...parts: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(parts.reduce((n, p) => n + p.length, 0));
  let at = 0;
  for (const p of parts) { out.set(p, at); at += p.length; }
  return out;
}

function equal(a: Uint8Array, b: Uint8Array): boolean {
  return a.length === b.length && a.every((v, i) => v === b[i]);
}

async function sha(alg: "SHA-256" | "SHA-384" | "SHA-512", data: Uint8Array): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest(alg, data as BufferSource));
}

/** Algorithm 2.B (ISO 32000-2), with an empty password and no user key, which
 *  is how /U is checked. AES-CBC from Web Crypto always pads, so the input is
 *  always a whole number of blocks and the padding block is dropped. */
async function hardenedHash(salt: Uint8Array): Promise<Uint8Array> {
  let k = await sha("SHA-256", salt);
  for (let round = 0; ; round++) {
    const k1 = new Uint8Array(64 * k.length);
    for (let i = 0; i < 64; i++) k1.set(k, i * k.length);
    const aesKey = await crypto.subtle.importKey("raw", k.subarray(0, 16) as BufferSource, "AES-CBC", false, ["encrypt"]);
    const e = new Uint8Array(
      await crypto.subtle.encrypt({ name: "AES-CBC", iv: k.subarray(16, 32) as BufferSource }, aesKey, k1 as BufferSource)
    ).subarray(0, k1.length);
    let sum = 0;
    for (let i = 0; i < 16; i++) sum += e[i];
    k = await sha(["SHA-256", "SHA-384", "SHA-512"][sum % 3] as "SHA-256", e);
    if (round >= 63 && e[e.length - 1] <= round - 31) return k.subarray(0, 32);
  }
}

function rc4(key: Uint8Array, data: Uint8Array): Uint8Array {
  const s = new Uint8Array(256);
  for (let i = 0; i < 256; i++) s[i] = i;
  for (let i = 0, j = 0; i < 256; i++) {
    j = (j + s[i] + key[i % key.length]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
  }
  const out = new Uint8Array(data.length);
  for (let n = 0, i = 0, j = 0; n < data.length; n++) {
    i = (i + 1) & 255;
    j = (j + s[i]) & 255;
    [s[i], s[j]] = [s[j], s[i]];
    out[n] = data[n] ^ s[(s[i] + s[j]) & 255];
  }
  return out;
}

/** MD5 (RFC 1321). Web Crypto doesn't offer it, and the older PDF revisions
 *  are built on it. */
function md5(input: Uint8Array): Uint8Array {
  const K = new Uint32Array(64);
  for (let i = 0; i < 64; i++) K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32);
  const S = [7, 12, 17, 22, 5, 9, 14, 20, 4, 11, 16, 23, 6, 10, 15, 21];

  const len = input.length;
  const padded = new Uint8Array(((len + 8) >>> 6) * 64 + 64);
  padded.set(input);
  padded[len] = 0x80;
  const view = new DataView(padded.buffer);
  view.setUint32(padded.length - 8, (len * 8) >>> 0, true);
  view.setUint32(padded.length - 4, Math.floor(len / 0x20000000), true);

  let a0 = 0x67452301, b0 = 0xefcdab89, c0 = 0x98badcfe, d0 = 0x10325476;
  const m = new Uint32Array(16);
  for (let off = 0; off < padded.length; off += 64) {
    for (let i = 0; i < 16; i++) m[i] = view.getUint32(off + i * 4, true);
    let a = a0, b = b0, c = c0, d = d0;
    for (let i = 0; i < 64; i++) {
      let f: number, g: number;
      if (i < 16) { f = (b & c) | (~b & d); g = i; }
      else if (i < 32) { f = (d & b) | (~d & c); g = (5 * i + 1) % 16; }
      else if (i < 48) { f = b ^ c ^ d; g = (3 * i + 5) % 16; }
      else { f = c ^ (b | ~d); g = (7 * i) % 16; }
      const s = S[(i >>> 4) * 4 + (i % 4)];
      const t = (a + f + K[i] + m[g]) >>> 0;
      a = d; d = c; c = b;
      b = (b + ((t << s) | (t >>> (32 - s)))) >>> 0;
    }
    a0 = (a0 + a) >>> 0; b0 = (b0 + b) >>> 0; c0 = (c0 + c) >>> 0; d0 = (d0 + d) >>> 0;
  }
  const out = new Uint8Array(16);
  const ov = new DataView(out.buffer);
  [a0, b0, c0, d0].forEach((w, i) => ov.setUint32(i * 4, w, true));
  return out;
}

import type { MetadataField } from "./types";

/**
 * Reading a C2PA manifest store for the report: what made the image, with
 * which model, and whose certificate signed it. Every processor used to show
 * only "C2PA Content Credential (4,096 bytes)".
 *
 * Layout: a JUMBF superbox labelled "c2pa" holding one superbox per manifest,
 * the last being the active one. A manifest holds "c2pa.assertions" (CBOR or
 * JSON assertions such as "c2pa.actions"), the claim ("c2pa.claim" or
 * "c2pa.claim.v2", CBOR) and "c2pa.signature" (a CBOR COSE_Sign1 whose header
 * carries the signer's certificate chain).
 *
 * Read-only and defensive: anything unexpected falls back to the old one-line
 * field. Nothing here verifies the signature. "Signed by" is the name on the
 * certificate, not a validation result, and the report says so.
 *
 * Every field stays in the "ai" category: each format removes the manifest as
 * one unit under the AI toggle, so splitting it across categories would let
 * the toggles disagree with what is removed.
 */

const UTF8 = new TextDecoder();

/* ── CBOR (RFC 8949), just enough for C2PA ─────────────────────────── */

type CborMap = Record<string, unknown>;

function halfToFloat(h: number): number {
  const exp = (h >> 10) & 0x1f;
  const frac = h & 0x3ff;
  const sign = h & 0x8000 ? -1 : 1;
  if (exp === 0) return sign * 2 ** -14 * (frac / 1024);
  if (exp === 31) return frac ? NaN : sign * Infinity;
  return sign * 2 ** (exp - 15) * (1 + frac / 1024);
}

export function decodeCbor(buf: Uint8Array): unknown {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = 0;
  const need = (n: number) => {
    if (p + n > buf.length) throw new Error("cbor: truncated");
  };
  const readArg = (ai: number): number => {
    if (ai < 24) return ai;
    if (ai === 24) { need(1); return buf[p++]; }
    if (ai === 25) { need(2); const v = view.getUint16(p); p += 2; return v; }
    if (ai === 26) { need(4); const v = view.getUint32(p); p += 4; return v; }
    if (ai === 27) { need(8); const v = view.getUint32(p) * 2 ** 32 + view.getUint32(p + 4); p += 8; return v; }
    throw new Error("cbor: bad argument");
  };
  const isBreak = () => { need(1); return buf[p] === 0xff; };

  const item = (depth: number): unknown => {
    if (depth > 64) throw new Error("cbor: too deep");
    need(1);
    const ib = buf[p++];
    const mt = ib >> 5;
    const ai = ib & 0x1f;
    const indefinite = ai === 31;

    switch (mt) {
      case 0: return readArg(ai);
      case 1: return -1 - readArg(ai);
      case 2:
      case 3: {
        let bytes: Uint8Array;
        if (indefinite) {
          const parts: Uint8Array[] = [];
          while (!isBreak()) {
            const chunk = item(depth + 1);
            if (typeof chunk === "string") parts.push(new TextEncoder().encode(chunk));
            else if (chunk instanceof Uint8Array) parts.push(chunk);
            else throw new Error("cbor: bad chunk");
          }
          p++;
          bytes = new Uint8Array(parts.reduce((n, c) => n + c.length, 0));
          let o = 0;
          for (const c of parts) { bytes.set(c, o); o += c.length; }
        } else {
          const n = readArg(ai);
          need(n);
          bytes = buf.subarray(p, p + n);
          p += n;
        }
        return mt === 2 ? bytes : UTF8.decode(bytes);
      }
      case 4: {
        const arr: unknown[] = [];
        if (indefinite) { while (!isBreak()) arr.push(item(depth + 1)); p++; }
        else { const n = readArg(ai); for (let i = 0; i < n; i++) arr.push(item(depth + 1)); }
        return arr;
      }
      case 5: {
        const obj: CborMap = {};
        const pair = () => { const k = item(depth + 1); obj[String(k)] = item(depth + 1); };
        if (indefinite) { while (!isBreak()) pair(); p++; }
        else { const n = readArg(ai); for (let i = 0; i < n; i++) pair(); }
        return obj;
      }
      case 6: // a tag: the tagged value passes through (COSE_Sign1 is tag 18)
        readArg(ai);
        return item(depth + 1);
      default: // 7: floats and simple values
        if (ai === 20) return false;
        if (ai === 21) return true;
        if (ai === 22) return null;
        if (ai === 23) return undefined;
        if (ai === 25) { need(2); const h = view.getUint16(p); p += 2; return halfToFloat(h); }
        if (ai === 26) { need(4); const v = view.getFloat32(p); p += 4; return v; }
        if (ai === 27) { need(8); const v = view.getFloat64(p); p += 8; return v; }
        if (ai < 24) return ai;
        if (ai === 24) { need(1); p++; return undefined; }
        throw new Error("cbor: unexpected break");
    }
  };
  return item(0);
}

/* ── JUMBF (ISO/IEC 19566-5) ───────────────────────────────────────── */

interface Superbox {
  label: string | null;
  children: Superbox[];
  contents: { type: string; data: Uint8Array }[];
}

function* boxes(buf: Uint8Array, start: number, end: number) {
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  let p = start;
  while (p + 8 <= end) {
    let size = view.getUint32(p);
    const type = String.fromCharCode(buf[p + 4], buf[p + 5], buf[p + 6], buf[p + 7]);
    let header = 8;
    if (size === 1) {
      if (p + 16 > end) return;
      size = view.getUint32(p + 8) * 2 ** 32 + view.getUint32(p + 12);
      header = 16;
    } else if (size === 0) {
      size = end - p;
    }
    if (size < header || p + size > end) return;
    yield { type, start: p + header, end: p + size };
    p += size;
  }
}

function parseSuperbox(buf: Uint8Array, start: number, end: number, depth: number): Superbox {
  const out: Superbox = { label: null, children: [], contents: [] };
  if (depth > 16) return out;
  for (const b of boxes(buf, start, end)) {
    if (b.type === "jumd") {
      // A 16-byte content-type UUID, a toggles byte, then the label
      // (null-terminated) when toggle bit 0x02 is set.
      const t = b.start + 16;
      if (t < b.end && buf[t] & 0x02) {
        let q = t + 1;
        while (q < b.end && buf[q] !== 0) q++;
        out.label = UTF8.decode(buf.subarray(t + 1, q));
      }
    } else if (b.type === "jumb") {
      out.children.push(parseSuperbox(buf, b.start, b.end, depth + 1));
    } else {
      out.contents.push({ type: b.type, data: buf.subarray(b.start, b.end) });
    }
  }
  return out;
}

/** The manifest store in a payload that may carry headers before the JUMBF
 *  (an HEIC uuid box's version, purpose and offset, for one). */
function findManifestStore(bytes: Uint8Array): Superbox | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let i = 0; i + 8 <= bytes.length; i++) {
    if (bytes[i + 4] !== 0x6a || bytes[i + 5] !== 0x75 || bytes[i + 6] !== 0x6d || bytes[i + 7] !== 0x62) continue; // "jumb"
    const size = view.getUint32(i);
    const end = size === 0 ? bytes.length : i + size;
    if (size !== 0 && (size < 8 || end > bytes.length)) continue;
    const store = parseSuperbox(bytes, i + 8, end, 0);
    if (store.label === "c2pa") return store;
  }
  return null;
}

/**
 * JPEG splits JUMBF across APP11 segments. Each payload (after the segment
 * length) is "JP", a 2-byte box instance, a 4-byte packet sequence, then box
 * data; every packet after the first repeats the superbox header, which is
 * dropped when rejoining. Returns one buffer per box instance.
 */
export function jumbfFromApp11(payloads: Uint8Array[]): Uint8Array[] {
  const groups = new Map<number, { seq: number; data: Uint8Array }[]>();
  for (const pl of payloads) {
    if (pl.length < 16 || pl[0] !== 0x4a || pl[1] !== 0x50) continue; // "JP"
    const view = new DataView(pl.buffer, pl.byteOffset, pl.byteLength);
    const en = view.getUint16(2);
    const seq = view.getUint32(4);
    const list = groups.get(en) ?? [];
    list.push({ seq, data: pl.subarray(8) });
    groups.set(en, list);
  }
  const out: Uint8Array[] = [];
  for (const list of groups.values()) {
    list.sort((a, b) => a.seq - b.seq);
    const parts = list.map((pkt, i) => {
      if (i === 0) return pkt.data;
      const lbox = new DataView(pkt.data.buffer, pkt.data.byteOffset, pkt.data.byteLength).getUint32(0);
      return pkt.data.subarray(lbox === 1 ? 16 : 8);
    });
    const joined = new Uint8Array(parts.reduce((n, c) => n + c.length, 0));
    let o = 0;
    for (const c of parts) { joined.set(c, o); o += c.length; }
    out.push(joined);
  }
  return out;
}

/* ── The certificate: the signer's name, without verifying anything ── */

/** The last organisation and common name in a DER certificate. The subject
 *  follows the issuer in a certificate, so the last one is the signer's. */
function certificateNames(cert: Uint8Array): { org?: string; cn?: string } {
  const last = (oidByte: number): string | undefined => {
    let found: string | undefined;
    for (let i = 0; i + 7 < cert.length; i++) {
      // OID 2.5.4.x encodes as 06 03 55 04 x
      if (cert[i] !== 0x06 || cert[i + 1] !== 0x03 || cert[i + 2] !== 0x55 || cert[i + 3] !== 0x04 || cert[i + 4] !== oidByte) continue;
      const tag = cert[i + 5];
      let len = cert[i + 6];
      let s = i + 7;
      if (len & 0x80) {
        const n = len & 0x7f;
        if (n === 0 || n > 2) continue;
        len = 0;
        for (let k = 0; k < n; k++) len = (len << 8) | cert[s + k];
        s += n;
      }
      if (s + len > cert.length) continue;
      const bytes = cert.subarray(s, s + len);
      if (tag === 0x0c || tag === 0x13 || tag === 0x14 || tag === 0x16) found = UTF8.decode(bytes);
      else if (tag === 0x1e) found = new TextDecoder("utf-16be").decode(bytes);
    }
    return found;
  };
  return { org: last(0x0a), cn: last(0x03) };
}

/* ── Turning a manifest into report fields ──────────────────────────── */

const SOURCE_TYPES: Record<string, string> = {
  trainedAlgorithmicMedia: "AI-generated",
  compositeWithTrainedAlgorithmicMedia: "Edited with AI",
  algorithmicMedia: "Computer-generated",
  compositeSynthetic: "Composite with synthetic elements",
  digitalCapture: "Camera capture",
  composite: "Composite",
};

const baseLabel = (l: string) => l.replace(/__\d+$/, "");

function contentOf(box: Superbox | undefined): unknown {
  if (!box) return undefined;
  const cbor = box.contents.find((c) => c.type === "cbor");
  if (cbor) return decodeCbor(cbor.data);
  const json = box.contents.find((c) => c.type === "json");
  if (json) return JSON.parse(UTF8.decode(json.data));
  return undefined;
}

const asMap = (v: unknown): CborMap | undefined => (v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Uint8Array) ? (v as CborMap) : undefined);
const asString = (v: unknown): string | undefined => (typeof v === "string" && v.trim() ? v.trim() : undefined);

/** "Adobe_Photoshop/25.0 adobe_c2pa/0.7.6" -> "Adobe Photoshop 25.0". */
function generatorName(claim: CborMap | undefined): string | undefined {
  if (!claim) return undefined;
  const infoRaw = claim["claim_generator_info"];
  const info = asMap(Array.isArray(infoRaw) ? infoRaw[0] : infoRaw);
  const name = asString(info?.["name"]);
  if (name) {
    const version = asString(info?.["version"]);
    return version ? `${name} ${version}` : name;
  }
  const legacy = asString(claim["claim_generator"]);
  if (!legacy) return undefined;
  return legacy.split(/\s+/)[0].replace("/", " ").replace(/_/g, " ");
}

function agentName(agent: unknown): string | undefined {
  const s = asString(agent);
  if (s) return s;
  const m = asMap(agent);
  const name = asString(m?.["name"]);
  if (!name) return undefined;
  const version = asString(m?.["version"]);
  return version ? `${name} ${version}` : name;
}

/** "c2pa.watermarked", ".bound" and ".unbound" mean an invisible watermark
 *  went into the pixels (the first real ChatGPT image carried one). Say so
 *  plainly: removing the manifest removes this record, not the watermark. */
function actionLabel(action: string | undefined): string | undefined {
  if (!action) return undefined;
  if (/^c2pa\.watermarked/.test(action)) return "invisible watermark added (it stays in the pixels)";
  return action.replace(/^c2pa\./, "");
}

function sourceTypeLabel(url: unknown): string | undefined {
  const s = asString(url);
  if (!s) return undefined;
  const code = s.split("/").pop() ?? s;
  return SOURCE_TYPES[code] ?? code;
}

function signerName(signature: unknown): string | undefined {
  const cose = Array.isArray(signature) ? signature : undefined;
  if (!cose || cose.length < 2) return undefined;
  const protectedHeader = cose[0] instanceof Uint8Array && cose[0].length ? asMap(decodeCbor(cose[0])) : undefined;
  const x5 = protectedHeader?.["33"] ?? asMap(cose[1])?.["33"]; // 33 = x5chain
  const leaf = Array.isArray(x5) ? x5[0] : x5;
  if (!(leaf instanceof Uint8Array)) return undefined;
  const { org, cn } = certificateNames(leaf);
  return org ?? cn;
}

function field(key: string, label: string, value: string): MetadataField {
  return { category: "ai", key, label, value: value.length > 200 ? value.slice(0, 200) + "…" : value, removable: true };
}

/**
 * Report fields for a C2PA payload: the raw JUMBF from a PNG caBX or WebP
 * C2PA chunk, a rejoined JPEG APP11 box, or an HEIC uuid box's payload.
 * Falls back to the one-line "C2PA Content Credential (N bytes)".
 */
export function describeC2pa(payload: Uint8Array, totalBytes = payload.length): MetadataField[] {
  const fallback = [field("C2PA", "C2PA Content Credential", `(${totalBytes} bytes)`)];
  try {
    const store = findManifestStore(payload);
    const manifests = store?.children.filter((c) => c.label) ?? [];
    const active = manifests[manifests.length - 1];
    if (!active) return fallback;

    const child = (name: string) => active.children.find((c) => c.label && baseLabel(c.label) === name);
    const claim = asMap(contentOf(child("c2pa.claim.v2") ?? child("c2pa.claim")));
    const assertions = child("c2pa.assertions")?.children ?? [];

    const actions: CborMap[] = [];
    let credited: string[] = [];
    for (const a of assertions) {
      const label = a.label ? baseLabel(a.label) : "";
      try {
        if (label === "c2pa.actions" || label === "c2pa.actions.v2") {
          const list = asMap(contentOf(a))?.["actions"];
          if (Array.isArray(list)) for (const x of list) { const m = asMap(x); if (m) actions.push(m); }
        } else if (label === "stds.schema-org.CreativeWork") {
          const author = asMap(contentOf(a))?.["author"];
          const people = Array.isArray(author) ? author : author ? [author] : [];
          credited = people.map((x) => asString(asMap(x)?.["name"]) ?? asString(x)).filter((x): x is string => !!x);
        }
      } catch {
        // one unreadable assertion should not hide the rest
      }
    }

    let signer: string | undefined;
    try {
      signer = signerName(contentOf(child("c2pa.signature")));
    } catch {
      signer = undefined;
    }

    const created = actions.find((a) => a["action"] === "c2pa.created") ?? actions.find((a) => a["digitalSourceType"]);
    const generator = generatorName(claim);
    const model = agentName(created?.["softwareAgent"]);
    const source = sourceTypeLabel(created?.["digitalSourceType"] ?? actions.find((a) => a["digitalSourceType"])?.["digitalSourceType"]);
    const when = asString(created?.["when"]);
    const actionNames = [...new Set(actions.map((a) => actionLabel(asString(a["action"]))).filter((x): x is string => !!x))];

    const out = [field("C2PA", "C2PA Content Credential", signer ? `certificate issued to ${signer}` : `(${totalBytes} bytes)`)];
    if (generator) out.push(field("C2PA:generator", "Made with", generator));
    if (model && model !== generator) out.push(field("C2PA:model", "AI model", model));
    if (source) out.push(field("C2PA:source", "Source", source));
    if (when) out.push(field("C2PA:when", "Created", when.replace("T", " ").replace(/(\.\d+)?(Z|[+-]\d\d:?\d\d)?$/, (_m, _f, z) => (z === "Z" ? " UTC" : z ? ` ${z}` : ""))));
    if (actionNames.length) out.push(field("C2PA:actions", "Actions", actionNames.join(", ")));
    if (credited.length) out.push(field("C2PA:author", "Credited to", credited.join(", ")));
    if (manifests.length > 1) out.push(field("C2PA:history", "Earlier manifests", `${manifests.length - 1} (the history of edits before this one)`));
    return out;
  } catch {
    return fallback;
  }
}

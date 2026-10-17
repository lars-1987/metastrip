import type { MetadataCategory, MetadataField, StripOptions } from "./types";
import { blockGoes } from "./contract";
import { exifCategory, humanizeTagName } from "./image/exif";
import { iptcSourceTypeLabel, looksLikeAiGeneration, namesGenerator } from "./ai-signatures";

/* XMP is an RDF/XML packet that JPEG, PNG, WebP, GIF, HEIF and PDF all carry
   the same way, so this one module reads it for every container. A packet
   can only go whole: the container drops it when `goes` is true.

   Properties come as attributes on rdf:Description or as elements, holding
   text, an rdf:Seq / Bag / Alt list, or a struct of their own. A small XML
   reader follows that structure; the regex readers it replaces missed
   attribute-form properties, which is how Lightroom writes GPS and serial
   numbers, and anything inside a list. */

export interface XmpStripped {
  /** Every field, whatever the options; none for a packet that is only
   *  zeroes or whitespace (what a strip that zeroes in place leaves). */
  fieldsFound: MetadataField[];
  fieldsRemoved: MetadataField[];
  /** Whether the container should drop the packet. */
  goes: boolean;
}

export function stripXmp(packet: string, options: StripOptions): XmpStripped {
  if (!packet.replace(/[\0\s]/g, "")) return { fieldsFound: [], fieldsRemoved: [], goes: false };
  const props = readProperties(packet);
  if (!props?.length) {
    // Nothing we can read, so we can't tell what's inside: one field, and the
    // packet goes whenever any category XMP can hold is being removed.
    const field: MetadataField = {
      category: "custom",
      key: "XMP",
      label: "XMP packet",
      // No size: some containers hand over padding or a trailer with it.
      value: "(nothing readable)",
      removable: true,
    };
    const goes = XMP_CATEGORIES.some((c) => options[c]);
    return { fieldsFound: [field], fieldsRemoved: goes ? [field] : [], goes };
  }
  const fieldsFound = fieldsOf(props);
  const goes = blockGoes(fieldsFound, options);
  return { fieldsFound, fieldsRemoved: goes ? [...fieldsFound] : [], goes };
}

/** Every category but Comments, which XMP has no property for. */
const XMP_CATEGORIES: MetadataCategory[] = ["gps", "device", "dates", "author", "software", "copyright", "ai", "custom"];

/* ── Categories and labels ─────────────────────────────────────────── */

/** Properties with a category of their own. tiff:, exif:, exifEX: and aux:
 *  mirror EXIF tags and take their category from EXIF's table instead. */
const KNOWN: Record<string, MetadataCategory> = {
  "dc:title": "custom",
  "dc:description": "custom",
  "dc:subject": "custom",
  "dc:creator": "author",
  "dc:publisher": "author",
  "dc:contributor": "author",
  "dc:rights": "copyright",
  "xmp:CreatorTool": "software",
  "xmp:CreateDate": "dates",
  "xmp:ModifyDate": "dates",
  "xmp:MetadataDate": "dates",
  "pdf:Producer": "software",
  "pdf:Keywords": "custom",
  "photoshop:AuthorsPosition": "author",
  "photoshop:CaptionWriter": "author",
  "photoshop:Credit": "copyright",
  "photoshop:DateCreated": "dates",
  // Place names say where the photo was taken as plainly as coordinates.
  "photoshop:City": "gps",
  "photoshop:State": "gps",
  "photoshop:Country": "gps",
  "Iptc4xmpCore:Location": "gps",
  "Iptc4xmpCore:CountryCode": "gps",
  "Iptc4xmpExt:LocationShown": "gps",
  "Iptc4xmpExt:LocationCreated": "gps",
  // The photographer's email, phone and address.
  "Iptc4xmpCore:CreatorContactInfo": "author",
  "xmpRights:Marked": "copyright",
  "xmpRights:Owner": "copyright",
  "xmpRights:UsageTerms": "copyright",
  "xmpRights:WebStatement": "copyright",
  // Persistent identifiers that link copies of a file back to each other.
  "xmpMM:DocumentID": "custom",
  "xmpMM:InstanceID": "custom",
  "xmpMM:OriginalDocumentID": "custom",
  "xmpMM:DerivedFrom": "custom",
  "photoshop:DocumentAncestors": "custom",
  // Each save, with its time and the app and version that made it.
  "xmpMM:History": "software",
};

const EXIF_MIRRORS = new Set(["tiff", "exif", "exifEX", "aux"]);

/** XMP names for EXIF tags whose EXIF name differs. */
const EXIF_NAMES: Record<string, string> = {
  SerialNumber: "BodySerialNumber",
  Lens: "LensModel",
  LensID: "LensModel",
  OwnerName: "CameraOwnerName",
};

const LABELS: Record<string, string> = {
  "dc:subject": "XMP Keywords",
  "pdf:Keywords": "XMP Keywords",
  "dcterms:provenance": "C2PA manifest stored online",
  "xmpMM:History": "XMP Edit History",
  "tiff:Make": "XMP Camera Make",
  "tiff:Model": "XMP Camera Model",
};

function categoryOf(key: string, value: string): MetadataCategory {
  // AI first: the online manifest link, IPTC's source type, a generator
  // named anywhere, or a generation record in a free-text value.
  if (key === "dcterms:provenance") return "ai";
  if (key === "Iptc4xmpExt:DigitalSourceType") return /trainedAlgorithmicMedia/i.test(value) ? "ai" : "custom";
  if (namesGenerator(value) || looksLikeAiGeneration(value)) return "ai";
  if (KNOWN[key]) return KNOWN[key];
  const [prefix, local] = key.split(":");
  // The GPS IFD is all location, and so is its mirror.
  if (prefix === "exif" && local.startsWith("GPS")) return "gps";
  if (EXIF_MIRRORS.has(prefix)) return exifCategory(EXIF_NAMES[local] ?? local, value);
  return "custom";
}

function labelOf(key: string, value: string): string {
  if (key === "Iptc4xmpExt:DigitalSourceType") return iptcSourceTypeLabel(value) ?? "XMP Digital Source Type";
  if (LABELS[key]) return LABELS[key];
  const name = humanizeTagName(key.split(":")[1]);
  return `XMP ${name.charAt(0).toUpperCase()}${name.slice(1)}`;
}

/* ── From properties to fields ─────────────────────────────────────── */

const MAX_VALUE = 200;
const MAX_EXTRA = 12;

function fieldsOf(props: Property[]): MetadataField[] {
  const listed: MetadataField[] = [];
  const extra: MetadataField[] = [];
  const seen = new Set<string>();
  for (const { key, value } of props) {
    if (seen.has(key)) continue;
    seen.add(key);
    const shown = display(key, value);
    if (!shown) continue;
    const field: MetadataField = {
      category: categoryOf(key, shown),
      key: `XMP:${key}`,
      label: labelOf(key, shown),
      value: shown.length > MAX_VALUE ? `${shown.slice(0, MAX_VALUE)}…` : shown,
      removable: true,
    };
    // Properties we know, or that belong to a category, are always listed;
    // the rest (a Lightroom packet carries hundreds of develop settings) up
    // to a limit, then counted.
    (KNOWN[key] || field.category !== "custom" ? listed : extra).push(field);
  }
  const fields = [...listed, ...extra.slice(0, MAX_EXTRA)];
  if (extra.length > MAX_EXTRA) {
    fields.push({
      category: "custom",
      key: "XMP:more",
      label: "More XMP properties",
      value: `${extra.length - MAX_EXTRA} not shown`,
      removable: true,
    });
  }
  return fields;
}

/** What the review shows for a property. */
function display(key: string, value: Value): string {
  if (key === "xmpMM:History" && "items" in value) {
    const steps = value.items.length;
    const agents = value.items.map((step) => ("struct" in step ? leaf(step, "stEvt:softwareAgent") : "")).filter(Boolean);
    const last = agents[agents.length - 1];
    return `${steps} step${steps === 1 ? "" : "s"}${last ? `, last by ${last}` : ""}`;
  }
  if (key === "photoshop:DocumentAncestors" && "items" in value) {
    return `${value.items.length} document ID${value.items.length === 1 ? "" : "s"}`;
  }
  return texts(value).filter(Boolean).join(", ");
}

function texts(value: Value): string[] {
  if ("text" in value) return [value.text];
  if ("items" in value) return value.items.flatMap(texts);
  return value.struct.flatMap(([, v]) => texts(v));
}

function leaf(value: Value, key: string): string {
  if (!("struct" in value)) return "";
  const found = value.struct.find(([k]) => k === key);
  return found ? texts(found[1]).join(", ") : "";
}

/* ── RDF/XML ───────────────────────────────────────────────────────── */

type Value = { text: string } | { items: Value[] } | { struct: [string, Value][] };

interface Property {
  key: string;
  value: Value;
}

/** Canonical prefixes by namespace, so a packet that writes the xmp
 *  namespace as "xap:" (older Adobe apps) reads the same. */
const NAMESPACES: Record<string, string> = {
  "adobe:ns:meta/": "x",
  "http://www.w3.org/1999/02/22-rdf-syntax-ns#": "rdf",
  "http://purl.org/dc/elements/1.1/": "dc",
  "http://purl.org/dc/terms/": "dcterms",
  "http://ns.adobe.com/xap/1.0/": "xmp",
  "http://ns.adobe.com/xap/1.0/mm/": "xmpMM",
  "http://ns.adobe.com/xap/1.0/rights/": "xmpRights",
  "http://ns.adobe.com/xap/1.0/sType/ResourceEvent#": "stEvt",
  "http://ns.adobe.com/xap/1.0/sType/ResourceRef#": "stRef",
  "http://ns.adobe.com/tiff/1.0/": "tiff",
  "http://ns.adobe.com/exif/1.0/": "exif",
  "http://ns.adobe.com/exif/1.0/aux/": "aux",
  "http://cipa.jp/exif/1.0/": "exifEX",
  "http://ns.adobe.com/photoshop/1.0/": "photoshop",
  "http://ns.adobe.com/pdf/1.3/": "pdf",
  "http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/": "Iptc4xmpCore",
  "http://iptc.org/std/Iptc4xmpExt/2008-02-29/": "Iptc4xmpExt",
  "http://ns.adobe.com/camera-raw-settings/1.0/": "crs",
};

/** Names that are RDF and XML structure, never properties. */
const isStructure = (name: string) => /^(xmlns(:|$)|rdf:|xml:|x:)/.test(name);

interface Element {
  name: string;
  attrs: [string, string][];
  children: Element[];
  text: string;
}

/** The properties of every top-level rdf:Description, or null when there is
 *  no RDF to read. */
function readProperties(packet: string): Property[] | null {
  const root = parseXml(packet);
  if (!root) return null;
  const rdf = find(root, "rdf:RDF");
  if (!rdf) return null;
  return rdf.children.filter((d) => d.name === "rdf:Description").flatMap((d) => {
    const fromAttrs = d.attrs.filter(([name]) => !isStructure(name)).map(([key, text]) => ({ key, value: { text } }));
    const fromChildren = d.children.filter((c) => !isStructure(c.name)).map((c) => ({ key: c.name, value: valueOf(c) }));
    return [...fromAttrs, ...fromChildren];
  });
}

function valueOf(el: Element): Value {
  const resource = el.attrs.find(([name]) => name === "rdf:resource");
  if (resource) return { text: resource[1] };
  const list = el.children.find((c) => c.name === "rdf:Seq" || c.name === "rdf:Bag" || c.name === "rdf:Alt");
  if (list) return { items: list.children.filter((c) => c.name === "rdf:li").map(valueOf) };
  const description = el.children.find((c) => c.name === "rdf:Description");
  const holder = description ?? el;
  const struct: [string, Value][] = [
    ...holder.attrs.filter(([name]) => !isStructure(name)).map(([k, text]): [string, Value] => [k, { text }]),
    ...holder.children.filter((c) => !isStructure(c.name)).map((c): [string, Value] => [c.name, valueOf(c)]),
  ];
  if (struct.length) return { struct };
  return { text: el.text.replace(/\s+/g, " ").trim() };
}

function find(el: Element, name: string): Element | null {
  if (el.name === name) return el;
  for (const c of el.children) {
    const hit = find(c, name);
    if (hit) return hit;
  }
  return null;
}

const TOKEN =
  /<!--[\s\S]*?-->|<\?[\s\S]*?\?>|<!\[CDATA\[([\s\S]*?)\]\]>|<!(?:[^>"']|"[^"]*"|'[^']*')*>|<\/([^\s>]+)\s*>|<([A-Za-z_][\w.:-]*)((?:\s+[^\s=/>]+\s*=\s*(?:"[^"]*"|'[^']*'))*)\s*(\/?)>|([^<]+)|</g;
const ATTR = /([^\s=]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;

/** A forgiving XML reader: enough for machine-written RDF. Only the span
 *  from the first <x:xmpmeta> or <rdf:RDF> to the last closing one is read,
 *  so a container's padding or GIF's binary trailer never becomes markup.
 *  Prefixes are rewritten to the canonical ones for their namespace. */
function parseXml(packet: string): Element | null {
  const start = packet.search(/<([\w-]+:)?(xmpmeta|RDF)\b/);
  if (start < 0) return null;
  const closes = [...packet.matchAll(/<\/([\w-]+:)?(xmpmeta|RDF)\s*>/g)];
  const last = closes[closes.length - 1];
  const xml = packet.slice(start, last ? last.index + last[0].length : packet.length);

  const root: Element = { name: "", attrs: [], children: [], text: "" };
  const stack = [root];
  const prefixes = new Map<string, string>(); // written prefix -> namespace
  for (const m of xml.matchAll(TOKEN)) {
    const [, cdata, close, open, rawAttrs, selfClose, text] = m;
    const top = stack[stack.length - 1];
    if (cdata !== undefined) top.text += cdata;
    else if (text !== undefined) top.text += decodeEntities(text);
    else if (close !== undefined) {
      const at = stack.map((e) => e.name).lastIndexOf(close);
      if (at > 0) stack.length = at;
    } else if (open !== undefined) {
      const attrs: [string, string][] = [...(rawAttrs ?? "").matchAll(ATTR)].map((a) => [a[1], decodeEntities(a[2] ?? a[3] ?? "")]);
      for (const [name, value] of attrs) if (name.startsWith("xmlns:") && !prefixes.has(name.slice(6))) prefixes.set(name.slice(6), value);
      const el: Element = { name: open, attrs, children: [], text: "" };
      top.children.push(el);
      if (!selfClose) stack.push(el);
    }
  }
  canonicalise(root, prefixes);
  return root;
}

function canonicalise(el: Element, prefixes: Map<string, string>) {
  const rename = (name: string) => {
    const colon = name.indexOf(":");
    if (colon < 0 || name.startsWith("xmlns")) return name;
    const canonical = NAMESPACES[prefixes.get(name.slice(0, colon)) ?? ""];
    return canonical ? `${canonical}${name.slice(colon)}` : name;
  };
  el.name = rename(el.name);
  el.attrs = el.attrs.map(([name, value]) => [rename(name), value]);
  for (const c of el.children) canonicalise(c, prefixes);
}

function decodeEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&amp;/g, "&"); // last, so a literal &amp;lt; survives intact
}

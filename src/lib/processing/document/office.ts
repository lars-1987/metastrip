import JSZip from "jszip";
import { parseCoreXml, stripCoreXml, parseAppXml, stripAppXml } from "./office-common";
import { Unreadable, type Stripped } from "../contract";
import type { StripOptions, MetadataField, MetadataCategory } from "../types";

/* DOCX, XLSX and PPTX are all Office Open XML zips with the same property
   parts (docProps/core.xml, app.xml, custom.xml). What differs is where each
   keeps its comments and the people who wrote them, and DOCX's tracked
   changes, so one processor serves all three with a spec per format. */

/** A zip part removed whole, with its category. */
interface OfficePart {
  pattern: RegExp;
  category: MetadataCategory;
  label: (path: string) => string;
  /** The report key; the part's path unless given. */
  key?: string;
}

interface OfficeFormat {
  parts: OfficePart[];
  /** A format's own metadata outside the zip parts (DOCX tracked changes). */
  extra?: (zip: JSZip, options: StripOptions) => Promise<{ found: MetadataField[]; removed: MetadataField[] }>;
}

const CUSTOM_PROPERTIES: OfficePart = {
  pattern: /^docProps\/custom\.xml$/,
  category: "custom",
  key: "custom.xml",
  label: () => "Custom Properties File",
};

const commentPart = (pattern: RegExp): OfficePart => ({
  pattern,
  category: "comments",
  label: (path) => `Comment part: ${path}`,
});

const DOCX: OfficeFormat = {
  parts: [
    CUSTOM_PROPERTIES,
    { pattern: /^word\/comments\.xml$/, category: "comments", label: (path) => `File: ${path}` },
    { pattern: /^word\/commentsExtended\.xml$/, category: "comments", label: (path) => `File: ${path}` },
    // The people who commented or edited: removed with Author, its category.
    // It used to go with Comments while being reported as Author.
    { pattern: /^word\/people\.xml$/, category: "author", label: (path) => `File: ${path}` },
  ],
  extra: trackedChanges,
};

// Cell comments, modern threaded comments, and their author records, none of
// which the core/app metadata pass touches.
const XLSX: OfficeFormat = {
  parts: [
    CUSTOM_PROPERTIES,
    commentPart(/^xl\/comments\d*\.xml$/i),
    commentPart(/^xl\/threadedComments\/.*\.xml$/i),
    commentPart(/^xl\/persons\/.*\.xml$/i),
  ],
};

// Slide comments (modern per-slide + legacy) and their author records. Speaker
// notes are deliberately left alone: they're author-written content, not
// metadata.
const PPTX: OfficeFormat = {
  parts: [
    CUSTOM_PROPERTIES,
    commentPart(/^ppt\/comments\/.*\.xml$/i),
    commentPart(/^ppt\/authors\.xml$/i),
    commentPart(/^ppt\/commentAuthors\.xml$/i),
  ],
};

export const stripDocx = (bytes: Uint8Array, options: StripOptions) => stripOffice(bytes, options, DOCX);
export const stripXlsx = (bytes: Uint8Array, options: StripOptions) => stripOffice(bytes, options, XLSX);
export const stripPptx = (bytes: Uint8Array, options: StripOptions) => stripOffice(bytes, options, PPTX);

async function stripOffice(bytes: Uint8Array, options: StripOptions, format: OfficeFormat): Promise<Stripped> {
  let zip: JSZip;
  try {
    zip = await JSZip.loadAsync(bytes);
  } catch {
    throw new Unreadable();
  }

  const categoriesToStrip = (Object.entries(options) as [MetadataCategory, boolean][])
    .filter(([, enabled]) => enabled)
    .map(([category]) => category);
  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];

  // Core and app properties are rewritten per field.
  const core = zip.file("docProps/core.xml");
  if (core) {
    const xml = await core.async("text");
    const { fields } = parseCoreXml(xml);
    fieldsFound.push(...fields);
    fieldsRemoved.push(...fields.filter((f) => options[f.category]));
    zip.file("docProps/core.xml", stripCoreXml(xml, categoriesToStrip));
  }
  const app = zip.file("docProps/app.xml");
  if (app) {
    const xml = await app.async("text");
    const fields = parseAppXml(xml);
    fieldsFound.push(...fields);
    fieldsRemoved.push(...fields.filter((f) => options[f.category]));
    zip.file("docProps/app.xml", stripAppXml(xml, categoriesToStrip));
  }

  // Parts go whole, each with its own category. They're always looked for, so
  // a kept part is reported kept; they used to be looked for only when being
  // removed, which left kept comments out of the report altogether. Dangling
  // relationship references to a removed part are tolerated by Office.
  const seen = new Set<string>();
  for (const part of format.parts) {
    for (const entry of zip.file(part.pattern)) {
      if (seen.has(entry.name)) continue;
      seen.add(entry.name);
      const field: MetadataField = {
        category: part.category,
        key: part.key ?? entry.name,
        label: part.label(entry.name),
        value: "(present)",
        removable: true,
      };
      fieldsFound.push(field);
      if (options[part.category]) {
        zip.remove(entry.name);
        fieldsRemoved.push(field);
      }
    }
  }

  if (format.extra) {
    const { found, removed } = await format.extra(zip, options);
    fieldsFound.push(...found);
    fieldsRemoved.push(...removed);
  }

  return { cleaned: await zip.generateAsync({ type: "uint8array" }), fieldsFound, fieldsRemoved };
}

/** Tracked changes (revision markup) live in word/document.xml, not in a
 *  metadata part. "Accept All Changes" in Word doesn't guarantee they're gone,
 *  and the deleted text inside <w:del>/<w:delText> is fully recoverable. */
async function trackedChanges(zip: JSZip, options: StripOptions) {
  const found: MetadataField[] = [];
  const removed: MetadataField[] = [];
  const doc = zip.file("word/document.xml");
  if (doc) {
    const xml = await doc.async("text");
    if (/<w:(ins|del|moveFrom|moveTo|rPrChange|pPrChange)\b/.test(xml)) {
      const field: MetadataField = {
        category: "comments",
        key: "tracked-changes",
        label: "Tracked changes / revision history",
        value: "(present)",
        removable: true,
      };
      found.push(field);
      if (options.comments) {
        zip.file("word/document.xml", stripTrackedChanges(xml));
        removed.push(field);
      }
    }
  }
  return { found, removed };
}

/**
 * Excise Word tracked-change markup from a document.xml string. Targeted string
 * surgery (not a full DOM reparse) so the rest of the document body is left
 * byte-identical. The `\b` after each tag name avoids matching siblings like
 * `w:delText` or `w:instrText`.
 *
 *  - `<w:del>` / `<w:moveFrom>`: removed entirely (drops the deleted text)
 *  - `w:rPrChange`/`w:pPrChange`/table+section change records: removed
 *  - `<w:ins>` / `<w:moveTo>`: unwrapped (the inserted text is kept)
 */
export function stripTrackedChanges(xml: string): string {
  return xml
    // Drop deleted / moved-from content (paired and self-closing).
    .replace(/<w:(del|moveFrom)\b[^>]*>[\s\S]*?<\/w:\1>/g, "")
    .replace(/<w:(del|moveFrom)\b[^>]*\/>/g, "")
    // Drop formatting-revision records.
    .replace(
      /<w:(rPrChange|pPrChange|tblPrChange|tcPrChange|trPrChange|sectPrChange|tblGridChange)\b[^>]*>[\s\S]*?<\/w:\1>/g,
      ""
    )
    .replace(/<w:(numberingChange|cellIns|cellDel|cellMerge)\b[^>]*\/>/g, "")
    // Accept insertions / moves-to: unwrap, keeping the inserted text.
    .replace(/<\/?w:(ins|moveTo)\b[^>]*>/g, "");
}

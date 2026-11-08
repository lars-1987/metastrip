import { PDFArray, PDFDocument, PDFName, PDFNumber, PDFDict, PDFHexString, PDFObject, PDFRef, PDFRawStream, PDFStream, PDFString } from "pdf-lib";
import { stripXmp } from "../xmp";
import { Locked, Unreadable, type MarkStep, type Stripped } from "../contract";
import { opensWithoutPassword } from "./pdf-lock";
import type {
  StripOptions,
  MetadataField,
  MetadataCategory,
} from "../types";

/** An Info value as the file holds it, whatever its type. */
function rawInfoValue(pdfDoc: PDFDocument, key: string): string | undefined {
  const infoRef = pdfDoc.context.trailerInfo.Info;
  const info = infoRef ? pdfDoc.context.lookup(infoRef, PDFDict) : undefined;
  const value = info?.lookup(PDFName.of(key));
  if (value instanceof PDFString || value instanceof PDFHexString) return value.decodeText();
  return value?.toString();
}

export async function stripPdf(bytes: Uint8Array, options: StripOptions, at: MarkStep): Promise<Stripped> {
  let pdfDoc: PDFDocument;

  try {
    // updateMetadata defaults to true, which makes pdf-lib stamp its own
    // Producer and a fresh ModDate onto the Info dict during load, before we
    // have read anything. That made us report pdf-lib as the user's PDF
    // Producer and "now" as their modification date, and it wrote both into
    // the output whenever the user chose to KEEP those categories.
    //
    // ignoreEncryption only lets an encrypted file load so we can see that it
    // is one: it is never edited. Before, pdf-lib's EncryptedPDFError was
    // caught below with everything else, so a locked PDF was called damaged.
    pdfDoc = await PDFDocument.load(bytes, { updateMetadata: false, ignoreEncryption: true });
  } catch {
    throw new Unreadable();
  }
  if (pdfDoc.isEncrypted) {
    // A lock we can't classify is still a lock: never let the check itself
    // turn it into a crash.
    const opens = await opensWithoutPassword(pdfDoc).catch(() => undefined);
    throw new Locked(opens === undefined ? "unknown" : opens ? "permissions" : "password");
  }
  // pdf-lib loads a file cut off after its header without complaint, but a
  // PDF with no document catalog isn't a PDF, and reading it would throw.
  if (!pdfDoc.context.trailerInfo.Root) throw new Unreadable();

  const fieldsFound: MetadataField[] = [];

  // Objects nothing in the document refers to any more, read before anything
  // is changed so what's found never depends on the options. See leftovers().
  const leftover = leftovers(pdfDoc);
  const fieldsRemoved: MetadataField[] = [];

  // Dates are deleted outright. Setting them to the epoch left a 1 Jan 1970
  // date that any re-read, ours included, still reports as a date.
  const dropInfoKey = (name: string) => {
    const infoRef = pdfDoc.context.trailerInfo.Info;
    const info = infoRef ? pdfDoc.context.lookup(infoRef, PDFDict) : undefined;
    info?.delete(PDFName.of(name));
  };

  const metadataMap: Array<{
    getter: () => string | Date | string[] | undefined;
    setter: () => void;
    category: MetadataCategory;
    key: string;
    label: string;
  }> = [
    {
      getter: () => pdfDoc.getTitle(),
      setter: () => pdfDoc.setTitle(""),
      category: "author",
      key: "Title",
      label: "Document Title",
    },
    {
      getter: () => pdfDoc.getAuthor(),
      setter: () => pdfDoc.setAuthor(""),
      category: "author",
      key: "Author",
      label: "Author",
    },
    {
      getter: () => pdfDoc.getSubject(),
      setter: () => pdfDoc.setSubject(""),
      category: "author",
      key: "Subject",
      label: "Subject",
    },
    {
      getter: () => pdfDoc.getKeywords(),
      setter: () => pdfDoc.setKeywords([]),
      category: "custom",
      key: "Keywords",
      label: "Keywords",
    },
    {
      getter: () => pdfDoc.getCreator(),
      setter: () => pdfDoc.setCreator(""),
      category: "software",
      key: "Creator",
      label: "Creator Application",
    },
    {
      getter: () => pdfDoc.getProducer(),
      setter: () => pdfDoc.setProducer(""),
      category: "software",
      key: "Producer",
      label: "PDF Producer",
    },
    {
      getter: () => pdfDoc.getCreationDate(),
      setter: () => dropInfoKey("CreationDate"),
      category: "dates",
      key: "CreationDate",
      label: "Creation Date",
    },
    {
      getter: () => pdfDoc.getModificationDate(),
      setter: () => dropInfoKey("ModDate"),
      category: "dates",
      key: "ModDate",
      label: "Modification Date",
    },
  ];

  // pdf-lib's getters throw on a value they can't type: a date written as text
  // or left empty, a title that isn't a string. An impossible date doesn't
  // throw, but comes back as an Invalid Date. Either way the field is still
  // there and still has to go, so read what the file actually holds.
  const readField = (meta: (typeof metadataMap)[number]) => {
    try {
      const value = meta.getter();
      if (!(value instanceof Date) || !Number.isNaN(value.getTime())) return value;
    } catch {
      // Falls through to the raw value.
    }
    return rawInfoValue(pdfDoc, meta.key);
  };

  for (const meta of metadataMap) {
    at(`info:${meta.key}`);
    const value = readField(meta);
    if (value) {
      const field: MetadataField = {
        category: meta.category,
        key: meta.key,
        label: meta.label,
        value: value instanceof Date ? value.toISOString() : String(value),
        removable: true,
      };
      fieldsFound.push(field);

      if (options[meta.category]) {
        meta.setter();
        fieldsRemoved.push(field);
      }
    }
  }

  // ── XMP metadata stream ────────────────────────────────────────────────
  // pdf-lib's setters only touch the Document Info dictionary; a PDF also keeps
  // a parallel XMP packet in the catalog's /Metadata stream (author, title,
  // rights, creator-tool, edit history). Clearing the Info fields leaves XMP
  // fully intact — the classic "looks clean but isn't" trap. Drop the whole
  // stream, from both the catalog reference and the object table so it isn't
  // written back as an orphan.
  at("xmp");
  const xmpValue = pdfDoc.catalog.get(PDFName.of("Metadata"));
  if (xmpValue) {
    // XMP streams are required to be plain, so decoding the raw contents is
    // normally enough. Anything else reads as a packet with nothing readable,
    // which goes whenever any category XMP can hold is being removed.
    const stream = pdfDoc.context.lookup(xmpValue);
    const packet = stream instanceof PDFRawStream ? new TextDecoder().decode(stream.getContents()) : "(not a plain stream)";
    const xmp = stripXmp(packet, options);
    fieldsFound.push(...xmp.fieldsFound);
    if (xmp.goes) {
      pdfDoc.catalog.delete(PDFName.of("Metadata"));
      if (xmpValue instanceof PDFRef) pdfDoc.context.delete(xmpValue);
      fieldsRemoved.push(...xmp.fieldsRemoved);
    }
  }

  // ── Custom Info-dictionary properties ──────────────────────────────────
  // Templates and Office exports inject non-standard keys (Company, Manager,
  // classification codes, and so on) that the standard setters never clear.
  // Always looked for, so a kept one is reported kept.
  at("custom");
  const infoRef = pdfDoc.context.trailerInfo.Info;
  const info = infoRef ? pdfDoc.context.lookup(infoRef, PDFDict) : undefined;
  if (info) {
    const STANDARD = new Set([
      "Title", "Author", "Subject", "Keywords", "Creator",
      "Producer", "CreationDate", "ModDate", "Trapped",
    ]);
    for (const key of info.keys()) {
      const name = key.asString().replace(/^\//, "");
      if (!STANDARD.has(name)) {
        const field: MetadataField = {
          category: "custom",
          key: name,
          label: `Custom property: ${name}`,
          value: "(present)",
          removable: true,
        };
        fieldsFound.push(field);
        if (options.custom) {
          info.delete(key);
          fieldsRemoved.push(field);
        }
      }
    }
  }

  // ── Leftovers from earlier edits ───────────────────────────────────────
  // pdf-lib loads every object in the file and saves every object it loaded,
  // including ones nothing refers to any more: an XMP stream an earlier edit
  // unlinked, an Info dictionary it replaced, a deleted comment or page. A
  // checker shows none of them, because they aren't part of the document, but
  // the bytes are still there. A PDF ExifTool had "stripped" came out of
  // MetaStrip with its first author's name intact this way (8 Nov 2026). They
  // can hold anything, so they go whenever anything is being removed.
  at("leftovers");
  if (leftover.field) {
    fieldsFound.push(leftover.field);
    if (Object.values(options).some(Boolean)) fieldsRemoved.push(leftover.field);
  }
  if (fieldsRemoved.length > 0) {
    for (const [ref] of leftovers(pdfDoc).unreachable) pdfDoc.context.delete(ref);
  }

  at("save");
  return { cleaned: await pdfDoc.save(), fieldsFound, fieldsRemoved };
}

/** Every indirect object the document can't reach from its trailer (the
 *  catalog and the Info dictionary), and a field describing them. pdf-lib's
 *  own bookkeeping from the old file (cross-reference and object streams, a
 *  linearisation dictionary) is unreachable too and goes with the rest, but
 *  isn't counted: it carries no content. */
function leftovers(pdfDoc: PDFDocument): { unreachable: [PDFRef, PDFObject][]; field?: MetadataField } {
  const ctx = pdfDoc.context;
  const reached = new Set<string>();
  const visit = (obj: PDFObject | undefined) => {
    const stack = [obj];
    while (stack.length) {
      const o = stack.pop();
      if (o instanceof PDFRef) {
        if (reached.has(o.tag)) continue;
        reached.add(o.tag);
        stack.push(ctx.lookup(o));
      } else if (o instanceof PDFDict) {
        stack.push(...o.values());
      } else if (o instanceof PDFArray) {
        stack.push(...o.asArray());
      } else if (o instanceof PDFStream) {
        stack.push(...o.dict.values());
      }
    }
  };
  visit(ctx.trailerInfo.Root);
  visit(ctx.trailerInfo.Info);

  const unreachable = ctx.enumerateIndirectObjects().filter(([ref]) => !reached.has(ref.tag));
  const dictOf = (o: PDFObject) => (o instanceof PDFStream ? o.dict : o instanceof PDFDict ? o : undefined);
  const linearized = unreachable.some(([, o]) => dictOf(o)?.has(PDFName.of("Linearized")));
  const content = unreachable.filter(([, o]) => {
    const d = dictOf(o);
    const type = d?.get(PDFName.of("Type"));
    if (type === PDFName.of("XRef") || type === PDFName.of("ObjStm") || d?.has(PDFName.of("Linearized"))) return false;
    // A linearised file's hint stream: untyped, with the shared-object hint
    // table's offset in /S.
    if (linearized && o instanceof PDFStream && !type && d?.get(PDFName.of("S")) instanceof PDFNumber) return false;
    return true;
  });
  if (content.length === 0) return { unreachable };

  const metadata = content.some(([, o]) => {
    const d = dictOf(o);
    if (!d) return false;
    if (d.get(PDFName.of("Type")) === PDFName.of("Metadata")) return true;
    return ["Author", "Title", "Creator", "Producer"].some((k) => d.has(PDFName.of(k)));
  });
  const n = content.length;
  return {
    unreachable,
    field: {
      category: "custom",
      key: "Leftovers",
      label: "Leftovers from earlier edits",
      value: `${n} object${n === 1 ? "" : "s"} the document no longer uses${metadata ? ", including an earlier copy of its metadata" : ""}`,
      removable: true,
    },
  };
}

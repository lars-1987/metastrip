import { PDFDocument, PDFName, PDFDict, PDFHexString, PDFRef, PDFRawStream, PDFString } from "pdf-lib";
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

  at("save");
  return { cleaned: await pdfDoc.save(), fieldsFound, fieldsRemoved };
}

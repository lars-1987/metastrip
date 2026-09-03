import { PDFDocument, PDFName, PDFDict, PDFRef, PDFRawStream } from "pdf-lib";
import { parseXmp, type XmpProperty } from "./xmp";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

export async function processPdf(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  let pdfDoc: PDFDocument;

  try {
    // updateMetadata defaults to true, which makes pdf-lib stamp its own
    // Producer and a fresh ModDate onto the Info dict during load, before we
    // have read anything. That made us report pdf-lib as the user's PDF
    // Producer and "now" as their modification date, and it wrote both into
    // the output whenever the user chose to KEEP those categories.
    pdfDoc = await PDFDocument.load(arrayBuffer, { updateMetadata: false });
  } catch {
    const blob = new Blob([arrayBuffer], { type: "application/pdf" });
    return {
      originalFile: file,
      cleanedBlob: blob,
      report: {
        fileName: file.name,
        fileType: "pdf",
        fileSize: file.size,
        cleanedFileSize: blob.size,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: "Could not parse PDF",
    };
  }

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

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
      setter: () => pdfDoc.setCreationDate(new Date(0)),
      category: "dates",
      key: "CreationDate",
      label: "Creation Date",
    },
    {
      getter: () => pdfDoc.getModificationDate(),
      setter: () => pdfDoc.setModificationDate(new Date(0)),
      category: "dates",
      key: "ModDate",
      label: "Modification Date",
    },
  ];

  for (const meta of metadataMap) {
    const value = meta.getter();
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
      } else {
        fieldsKept.push(field);
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
  const xmpValue = pdfDoc.catalog.get(PDFName.of("Metadata"));
  if (xmpValue) {
    // Read the packet so the report can name what is inside it rather than
    // just admitting something is. XMP streams are required to be plain, so a
    // decode is normally enough; anything unreadable falls back to the old
    // single "(present)" row.
    let parsed: XmpProperty[] = [];
    try {
      const stream = pdfDoc.context.lookup(xmpValue);
      if (stream instanceof PDFRawStream) {
        parsed = parseXmp(new TextDecoder().decode(stream.getContents()));
      }
    } catch {
      parsed = [];
    }

    const xmpFields: MetadataField[] = parsed.length
      ? parsed.map((prop) => ({
          category: prop.category,
          key: `XMP:${prop.key}`,
          label: prop.label,
          value: prop.value,
          removable: true,
        }))
      : [{
          category: "custom" as MetadataCategory,
          key: "XMP",
          label: "XMP metadata stream",
          value: "(present)",
          removable: true,
        }];

    for (const field of xmpFields) fieldsFound.push(field);

    // The packet can only be dropped whole, so it goes if ANY category it
    // carries is being stripped. Everything in it is then reported as removed,
    // including a category the user chose to keep: that is what actually
    // happens to the file, and reporting otherwise would be the same class of
    // untruth as the pdf-lib Producer bug. Per-property rewriting of the packet
    // is the fix if that partial case ever matters.
    const removeXmp = parsed.length
      ? xmpFields.some((field) => options[field.category])
      : options.author || options.dates || options.software || options.copyright || options.custom;

    if (removeXmp) {
      pdfDoc.catalog.delete(PDFName.of("Metadata"));
      if (xmpValue instanceof PDFRef) pdfDoc.context.delete(xmpValue);
      for (const field of xmpFields) fieldsRemoved.push(field);
    } else {
      for (const field of xmpFields) fieldsKept.push(field);
    }
  }

  // ── Custom Info-dictionary properties ──────────────────────────────────
  // Templates and Office exports inject non-standard keys (Company, Manager,
  // classification codes, …) that the standard setters never clear.
  if (options.custom) {
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
          info.delete(key);
          fieldsRemoved.push(field);
        }
      }
    }
  }

  const cleanedBytes = await pdfDoc.save();
  const cleanedBlob = new Blob([cleanedBytes.buffer as ArrayBuffer], { type: "application/pdf" });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "pdf",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

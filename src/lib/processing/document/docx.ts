import JSZip from "jszip";
import {
  parseCoreXml,
  stripCoreXml,
  parseAppXml,
  stripAppXml,
  SENSITIVE_FILES,
} from "./office-common";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

export async function processDocx(
  file: File,
  options: StripOptions
): Promise<ProcessingResult> {
  const arrayBuffer = await file.arrayBuffer();
  let zip: JSZip;

  try {
    zip = await JSZip.loadAsync(arrayBuffer);
  } catch {
    const blob = new Blob([arrayBuffer], { type: file.type });
    return {
      originalFile: file,
      cleanedBlob: blob,
      report: {
        fileName: file.name,
        fileType: "docx",
        fileSize: file.size,
        cleanedFileSize: blob.size,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: "Could not parse DOCX",
    };
  }

  const fieldsFound: MetadataField[] = [];
  const fieldsRemoved: MetadataField[] = [];
  const fieldsKept: MetadataField[] = [];

  const categoriesToStrip: MetadataCategory[] = (
    Object.entries(options) as [MetadataCategory, boolean][]
  )
    .filter(([, enabled]) => enabled)
    .map(([category]) => category);

  // Process core.xml
  const coreFile = zip.file("docProps/core.xml");
  if (coreFile) {
    const coreXml = await coreFile.async("text");
    const parsed = parseCoreXml(coreXml);
    fieldsFound.push(...parsed.fields);

    for (const field of parsed.fields) {
      if (categoriesToStrip.includes(field.category)) {
        fieldsRemoved.push(field);
      } else {
        fieldsKept.push(field);
      }
    }

    const strippedCore = stripCoreXml(coreXml, categoriesToStrip);
    zip.file("docProps/core.xml", strippedCore);
  }

  // Process app.xml
  const appFile = zip.file("docProps/app.xml");
  if (appFile) {
    const appXml = await appFile.async("text");
    const appFields = parseAppXml(appXml);
    fieldsFound.push(...appFields);

    for (const field of appFields) {
      if (categoriesToStrip.includes(field.category)) {
        fieldsRemoved.push(field);
      } else {
        fieldsKept.push(field);
      }
    }

    const strippedApp = stripAppXml(appXml, categoriesToStrip);
    zip.file("docProps/app.xml", strippedApp);
  }

  // Remove custom.xml if custom stripping enabled
  if (options.custom) {
    const customFile = zip.file("docProps/custom.xml");
    if (customFile) {
      fieldsFound.push({
        category: "custom",
        key: "custom.xml",
        label: "Custom Properties File",
        value: "(present)",
        removable: true,
      });
      fieldsRemoved.push({
        category: "custom",
        key: "custom.xml",
        label: "Custom Properties File",
        value: "(removed)",
        removable: true,
      });
      zip.remove("docProps/custom.xml");
    }
  }

  // Remove comments and people files if enabled
  if (options.comments) {
    for (const [path, category] of Object.entries(SENSITIVE_FILES)) {
      const sensitiveFile = zip.file(path);
      if (sensitiveFile) {
        fieldsFound.push({
          category,
          key: path,
          label: `File: ${path}`,
          value: "(present)",
          removable: true,
        });
        fieldsRemoved.push({
          category,
          key: path,
          label: `File: ${path}`,
          value: "(removed)",
          removable: true,
        });
        zip.remove(path);
      }
    }
  }

  // Tracked changes (revision markup) live in word/document.xml, not in a
  // metadata file. "Accept All Changes" in Word doesn't guarantee they're gone,
  // and the deleted text inside <w:del>/<w:delText> is fully recoverable. Excise
  // it: drop deletions/moves-from and format-change records entirely, and unwrap
  // insertions/moves-to so the inserted text stays as normal content.
  if (options.comments) {
    const docFile = zip.file("word/document.xml");
    if (docFile) {
      const docXml = await docFile.async("text");
      if (/<w:(ins|del|moveFrom|moveTo|rPrChange|pPrChange)\b/.test(docXml)) {
        const field: MetadataField = {
          category: "comments",
          key: "tracked-changes",
          label: "Tracked changes / revision history",
          value: "(present)",
          removable: true,
        };
        fieldsFound.push(field);
        zip.file("word/document.xml", stripTrackedChanges(docXml));
        fieldsRemoved.push(field);
      }
    }
  }

  const cleanedArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const cleanedBlob = new Blob([cleanedArrayBuffer], { type: file.type });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "docx",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

/**
 * Excise Word tracked-change markup from a document.xml string. Targeted string
 * surgery (not a full DOM reparse) so the rest of the document body is left
 * byte-identical. The `\b` after each tag name avoids matching siblings like
 * `w:delText` or `w:instrText`.
 *
 *  - `<w:del>` / `<w:moveFrom>`  → removed entirely (drops the deleted text)
 *  - `w:rPrChange`/`w:pPrChange`/table+section change records → removed
 *  - `<w:ins>` / `<w:moveTo>`    → unwrapped (the inserted text is kept)
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

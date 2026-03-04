import JSZip from "jszip";
import {
  parseCoreXml,
  stripCoreXml,
  parseAppXml,
  stripAppXml,
} from "./office-common";
import type {
  StripOptions,
  ProcessingResult,
  MetadataField,
  MetadataCategory,
} from "../types";

export async function processXlsx(
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
        fileType: "xlsx",
        fileSize: file.size,
        cleanedFileSize: blob.size,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      },
      error: "Could not parse XLSX",
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

  const cleanedArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });
  const cleanedBlob = new Blob([cleanedArrayBuffer], { type: file.type });

  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: "xlsx",
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound,
      fieldsRemoved,
      fieldsKept,
      processedAt: new Date(),
    },
  };
}

import type JSZip from "jszip";
import type { MetadataField, MetadataCategory } from "../types";

/**
 * Remove every zip entry matching any of the given patterns (e.g. numbered
 * comment/notes/author parts). JSZip's `file(regex)` returns all matches.
 * Returns the field records for the report. Note: dangling relationship
 * references to the removed parts are tolerated by Office (same approach the
 * DOCX comments removal already uses).
 */
export function removeZipParts(
  zip: JSZip,
  patterns: RegExp[],
  category: MetadataCategory,
  label: string
): { found: MetadataField[]; removed: MetadataField[] } {
  const found: MetadataField[] = [];
  const removed: MetadataField[] = [];
  const seen = new Set<string>();
  for (const pattern of patterns) {
    for (const zObj of zip.file(pattern)) {
      if (seen.has(zObj.name)) continue;
      seen.add(zObj.name);
      found.push({ category, key: zObj.name, label: `${label}: ${zObj.name}`, value: "(present)", removable: true });
      removed.push({ category, key: zObj.name, label: `${label}: ${zObj.name}`, value: "(removed)", removable: true });
      zip.remove(zObj.name);
    }
  }
  return { found, removed };
}

export const METADATA_FILES = {
  core: "docProps/core.xml",
  app: "docProps/app.xml",
  custom: "docProps/custom.xml",
};

export const SENSITIVE_FILES: Record<string, MetadataCategory> = {
  "word/comments.xml": "comments",
  "word/commentsExtended.xml": "comments",
  "word/people.xml": "author",
};

interface ParsedCoreMetadata {
  fields: MetadataField[];
  xml: string;
}

export function parseCoreXml(xmlString: string): ParsedCoreMetadata {
  const fields: MetadataField[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const coreMappings: Array<{
    tag: string;
    namespace: string;
    category: MetadataCategory;
    label: string;
  }> = [
    { tag: "creator", namespace: "dc", category: "author", label: "Creator" },
    {
      tag: "lastModifiedBy",
      namespace: "cp",
      category: "author",
      label: "Last Modified By",
    },
    { tag: "title", namespace: "dc", category: "author", label: "Title" },
    { tag: "subject", namespace: "dc", category: "author", label: "Subject" },
    {
      tag: "description",
      namespace: "dc",
      category: "author",
      label: "Description",
    },
    {
      tag: "keywords",
      namespace: "cp",
      category: "custom",
      label: "Keywords",
    },
    {
      tag: "created",
      namespace: "dcterms",
      category: "dates",
      label: "Created Date",
    },
    {
      tag: "modified",
      namespace: "dcterms",
      category: "dates",
      label: "Modified Date",
    },
    {
      tag: "revision",
      namespace: "cp",
      category: "custom",
      label: "Revision Number",
    },
  ];

  for (const mapping of coreMappings) {
    const elements = doc.getElementsByTagName(
      `${mapping.namespace}:${mapping.tag}`
    );
    if (elements.length > 0 && elements[0].textContent) {
      fields.push({
        category: mapping.category,
        key: mapping.tag,
        label: mapping.label,
        value: elements[0].textContent,
        removable: true,
      });
    }
  }

  return { fields, xml: xmlString };
}

export function stripCoreXml(
  xmlString: string,
  categoriesToStrip: MetadataCategory[]
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const tagCategoryMap: Record<string, MetadataCategory> = {
    "dc:creator": "author",
    "cp:lastModifiedBy": "author",
    "dc:title": "author",
    "dc:subject": "author",
    "dc:description": "author",
    "cp:keywords": "custom",
    "dcterms:created": "dates",
    "dcterms:modified": "dates",
    "cp:revision": "custom",
  };

  for (const [fullTag, category] of Object.entries(tagCategoryMap)) {
    if (categoriesToStrip.includes(category)) {
      const elements = doc.getElementsByTagName(fullTag);
      for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].textContent = "";
      }
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

export function parseAppXml(xmlString: string): MetadataField[] {
  const fields: MetadataField[] = [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const appMappings: Array<{
    tag: string;
    category: MetadataCategory;
    label: string;
  }> = [
    { tag: "Application", category: "software", label: "Application" },
    {
      tag: "AppVersion",
      category: "software",
      label: "Application Version",
    },
    { tag: "Company", category: "author", label: "Company" },
    { tag: "Template", category: "software", label: "Template Used" },
    {
      tag: "TotalTime",
      category: "dates",
      label: "Total Editing Time (mins)",
    },
    { tag: "Manager", category: "author", label: "Manager" },
  ];

  for (const mapping of appMappings) {
    const elements = doc.getElementsByTagName(mapping.tag);
    if (elements.length > 0 && elements[0].textContent) {
      fields.push({
        category: mapping.category,
        key: mapping.tag,
        label: mapping.label,
        value: elements[0].textContent,
        removable: true,
      });
    }
  }

  return fields;
}

export function stripAppXml(
  xmlString: string,
  categoriesToStrip: MetadataCategory[]
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, "text/xml");

  const tagCategoryMap: Record<string, MetadataCategory> = {
    Application: "software",
    AppVersion: "software",
    Company: "author",
    Template: "software",
    TotalTime: "dates",
    Manager: "author",
  };

  for (const [tag, category] of Object.entries(tagCategoryMap)) {
    if (categoriesToStrip.includes(category)) {
      const elements = doc.getElementsByTagName(tag);
      for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].textContent = "";
      }
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

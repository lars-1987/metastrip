import type { MetadataField, MetadataCategory } from "../types";

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
      // Removed, not blanked: every core property is optional, but an empty
      // one isn't always valid (an empty W3CDTF date isn't a date), and Office
      // treats an invalid one as damage and offers to repair the file.
      const elements = doc.getElementsByTagName(fullTag);
      for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].parentNode?.removeChild(elements[i]);
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
      // Removed, not blanked: TotalTime is a number and AppVersion has a fixed
      // pattern, so empty ones aren't valid. Every app property is optional.
      const elements = doc.getElementsByTagName(tag);
      for (let i = elements.length - 1; i >= 0; i--) {
        elements[i].parentNode?.removeChild(elements[i]);
      }
    }
  }

  const serializer = new XMLSerializer();
  return serializer.serializeToString(doc);
}

/** What the verify event can say about a leftover: which field it was, never
 *  what it held. */

import { describe, expect, it } from "vitest";
import { PDFDocument, PDFString } from "pdf-lib";
import { leftoverField, verifyCleaned } from "./verify";
import type { MetadataField, StripOptions } from "./types";

const ALL_ON: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

const field = (f: Partial<MetadataField>): MetadataField => ({
  category: "custom", key: "Key", label: "Label", value: "secret value", removable: true, ...f,
});

describe("leftoverField", () => {
  it("names a field by category and key", () => {
    expect(leftoverField(field({ category: "gps", key: "GPSLatitude" }))).toBe("gps:GPSLatitude");
    expect(leftoverField(field({ category: "custom", key: "XMP:dc:title" }))).toBe("custom:XMP:dc:title");
  });

  it("carries the Leftovers field's own summary of what it found", () => {
    expect(leftoverField(field({ key: "Leftovers", detail: "Font:2, dict:1" }))).toBe("custom:Leftovers(Font:2, dict:1)");
    expect(leftoverField(field({ key: "Leftovers" }))).toBe("custom:Leftovers(?)");
  });

  it("never passes on a name the file chose", () => {
    expect(leftoverField(field({ key: "Client Alice Smith", label: "Custom property: Client Alice Smith" }))).toBe("custom:custom_property");
    expect(leftoverField(field({ key: "weird key with spaces/and slashes" }))).toBe("custom:other");
    expect(leftoverField(field({ key: "x".repeat(41) }))).toBe("custom:other");
  });

  it("never includes the value", () => {
    expect(leftoverField(field({ key: "Author", category: "author" }))).not.toContain("secret");
  });
});

describe("verifyCleaned", () => {
  it("names the leftovers it finds", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    doc.context.register(doc.context.obj({ Author: PDFString.of("Alice") }));
    const bytes = await doc.save({ useObjectStreams: false });
    const v = await verifyCleaned(new Blob([bytes as Uint8Array<ArrayBuffer>]), "a.pdf", "application/pdf", ALL_ON);
    expect(v.status).toBe("leftovers");
    expect(v.leftoverFields).toContain("custom:Leftovers(info dict:1)");
    expect(v.leftoverFields.join(" ")).not.toContain("Alice");
  });

  it("names nothing when the file is clean", async () => {
    const doc = await PDFDocument.create();
    doc.addPage();
    const bytes = await doc.save({ useObjectStreams: false });
    const v = await verifyCleaned(new Blob([bytes as Uint8Array<ArrayBuffer>]), "a.pdf", "application/pdf", { ...ALL_ON, software: false, dates: false });
    expect(v.leftoverFields).toEqual([]);
  });
});

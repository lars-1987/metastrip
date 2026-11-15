// @vitest-environment happy-dom
// DOMParser (used by the Office processors) does not exist in Node.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { fieldLabel, TRANSLATED_FIELD_LABELS } from "./fields";
import { tagName } from "../processing/image/exif-tags";
import { humanizeTagName } from "../processing/image/exif";
import { processFile } from "../processing/coordinator";
import type { StripOptions } from "../processing/types";
import { jpegWithExif, jpegWithMetadata, pngWithMetadata } from "../processing/image/image-files.fixture";
import { phoneExif } from "../processing/image/exif.fixture";
import { buildPdf, buildDocx, PDF_MIME, DOCX_MIME } from "../processing/document/document-files.fixture";

const ALL_ON: StripOptions = { gps: true, device: true, dates: true, author: true, software: true, copyright: true, ai: true, comments: true, custom: true };

/** Every label a processor can produce from a fixed name: EXIF tag names as
 *  humanizeTagName shows them, every string literal in the processors, and
 *  XMP property names as the XMP reader shows them after "XMP ". */
function producibleLabels(): Set<string> {
  const out = new Set<string>();
  for (const ifd of ["0th", "Exif", "GPS", "Interop", "1st"] as const) {
    for (let t = 0; t < 0x10000; t++) {
      const n = tagName(ifd, t);
      if (n) out.add(humanizeTagName(n));
    }
  }
  const walk = (dir: string): string[] =>
    readdirSync(dir).flatMap((f) => {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) return walk(p);
      return /\.ts$/.test(f) && !/\.(test|fixture)\.ts$/.test(f) ? [p] : [];
    });
  for (const file of walk(join(__dirname, "../processing"))) {
    for (const [, lit] of readFileSync(file, "utf8").matchAll(/"([^"\n]*)"/g)) {
      out.add(lit);
      // "xmp:CreatorTool" shows as "XMP Creator Tool" and "dc:rights" as "XMP
      // Rights"; "XMP Keywords" as "Keywords (XMP)".
      const xmp = lit.match(/^[A-Za-z0-9]+:([A-Za-z][A-Za-z0-9]*)$/);
      if (xmp) {
        const name = humanizeTagName(xmp[1]);
        out.add(name.charAt(0).toUpperCase() + name.slice(1));
      }
      if (lit.startsWith("XMP ")) out.add(lit.slice(4));
    }
  }
  return out;
}

describe("field label translations", () => {
  it("only translates labels a processor can produce", () => {
    const producible = producibleLabels();
    expect(TRANSLATED_FIELD_LABELS.filter((l) => !producible.has(l))).toEqual([]);
  });

  it("has no em or en dashes", () => {
    for (const label of TRANSLATED_FIELD_LABELS) {
      for (const locale of ["es", "de"] as const) expect(fieldLabel(label, locale)).not.toMatch(/[—–]/);
    }
  });

  it("leaves English alone, and unknown labels unchanged", () => {
    expect(fieldLabel("GPS Latitude", "en")).toBe("GPS Latitude");
    expect(fieldLabel("Some Keyword A File Chose", "es")).toBe("Some Keyword A File Chose");
  });

  it("translates exact labels, XMP names and fixed prefixes", () => {
    expect(fieldLabel("GPS Latitude", "es")).toBe("Latitud GPS");
    expect(fieldLabel("GPS Latitude", "de")).toBe("GPS-Breitengrad");
    expect(fieldLabel("XMP Creator Tool", "es")).toBe("Aplicación de creación (XMP)");
    expect(fieldLabel("XMP GPS Latitude", "de")).toBe("GPS-Breitengrad (XMP)");
    expect(fieldLabel("XMP Something Unusual", "de")).toBe("XMP Something Unusual");
    expect(fieldLabel("Custom property: Client", "es")).toBe("Propiedad personalizada: Client");
    expect(fieldLabel("File: word/comments.xml", "de")).toBe("Datei: word/comments.xml");
  });

  // The fields a phone photo, a PDF and a Word file actually show must all be
  // translated: the point of the table.
  it.each([
    ["phone JPEG", () => new File([jpegWithExif(phoneExif(), { xmp: true })], "p.jpg", { type: "image/jpeg" })],
    ["JPEG with XMP, IPTC and C2PA", () => new File([jpegWithMetadata()], "m.jpg", { type: "image/jpeg" })],
    ["PNG", () => new File([pngWithMetadata()], "s.png", { type: "image/png" })],
    ["PDF", async () => new File([(await buildPdf()) as BlobPart], "d.pdf", { type: PDF_MIME })],
    ["Word", async () => new File([(await buildDocx()) as BlobPart], "w.docx", { type: DOCX_MIME })],
  ])("translates every field of a %s", async (_name, make) => {
    const result = await processFile(await make(), ALL_ON);
    const labels = result.report.fieldsFound.map((f) => f.label);
    expect(labels.length).toBeGreaterThan(0);
    // Some names read the same translated ("Software"), so a label counts
    // when the table has it or fieldLabel changes it. "XMP Department" is a
    // property the PDF fixture made up, a name the file chose.
    const translated = (l: string) => TRANSLATED_FIELD_LABELS.includes(l) || fieldLabel(l, "es") !== l;
    expect(labels.filter((l) => !translated(l) && l !== "XMP Department")).toEqual([]);
  });
});

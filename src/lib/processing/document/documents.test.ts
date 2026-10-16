// @vitest-environment happy-dom
// DOMParser and XMLSerializer (used by the Office processors) don't exist in
// Node, hence the happy-dom environment above.

/** Characterisation tests for the document processors (PDF, DOCX, XLSX,
 *  PPTX). They pin what each processor does TODAY, quirks included, so the
 *  move onto the shared processor contract shows every behaviour change as a
 *  failing, reviewed assertion. Comments marked "Quirk" are behaviours the
 *  contract is expected to change. */

import JSZip from "jszip";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { processFile } from "../coordinator";
import type { MetadataCategory, MetadataField, ProcessingResult, StripOptions } from "../types";
import {
  DOCX_MIME,
  PDF_MIME,
  PPTX_MIME,
  XLSX_MIME,
  buildDocx,
  buildPdf,
  buildPptx,
  buildXlsx,
  truncated,
} from "./document-files.fixture";

const ALL_ON: StripOptions = {
  gps: true,
  device: true,
  dates: true,
  author: true,
  software: true,
  copyright: true,
  ai: true,
  comments: true,
  custom: true,
};

const allBut = (category: MetadataCategory): StripOptions => ({ ...ALL_ON, [category]: false });

/** "category:key" rows, sorted, so a report reads as one stable list. */
const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

const sorted = (rows: string[]) => [...rows].sort();

async function run(bytes: Uint8Array, name: string, type: string, options: StripOptions) {
  const file = new File([bytes as BlobPart], name, { type });
  return { file, result: await processFile(file, options) };
}

/** Feed the cleaned output back in with everything on, as someone checking
 *  their download would. */
async function reread(result: ProcessingResult, name: string, type: string) {
  const file = new File([result.cleanedBlob], name, { type });
  return { file, result: await processFile(file, ALL_ON) };
}

async function zipText(blob: Blob, path: string): Promise<string> {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const entry = zip.file(path);
  if (!entry) throw new Error(`${path} is missing from the cleaned zip`);
  return entry.async("text");
}

async function zipPaths(blob: Blob): Promise<string[]> {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  return Object.keys(zip.files).sort();
}

// ── PDF ──────────────────────────────────────────────────────────────────

const PDF_INFO_FIELDS = [
  "author:Author",
  "author:Subject",
  "author:Title",
  "custom:Keywords",
  "dates:CreationDate",
  "dates:ModDate",
  "software:Creator",
  "software:Producer",
];

// The XMP packet in the fixture, as parseXmp names it.
const PDF_XMP_FIELDS = [
  "author:XMP:dc:creator",
  "author:XMP:dc:title",
  "copyright:XMP:dc:rights",
  "custom:XMP:pdfx:Department",
  "custom:XMP:xmpMM:DocumentID",
  "dates:XMP:xmp:CreateDate",
  "software:XMP:pdf:Producer",
  "software:XMP:xmp:CreatorTool",
];

// The non-standard Info key the fixture adds; only reported when custom is on.
const PDF_CUSTOM_INFO_FIELDS = ["custom:Company"];

describe("PDF", () => {
  const name = "report.pdf";

  it("removes every field when all categories are on, and a re-read finds nothing", async () => {
    const { result } = await run(await buildPdf(), name, PDF_MIME, ALL_ON);

    expect(result.error).toBeUndefined();
    const everything = sorted([...PDF_INFO_FIELDS, ...PDF_XMP_FIELDS, ...PDF_CUSTOM_INFO_FIELDS]);
    expect(summary(result.report.fieldsFound)).toEqual(everything);
    expect(summary(result.report.fieldsRemoved)).toEqual(everything);
    expect(summary(result.report.fieldsKept)).toEqual([]);

    const again = await reread(result, name, PDF_MIME);
    expect(again.result.error).toBeUndefined();
    expect(summary(again.result.report.fieldsFound)).toEqual([]);
    // Quirk: a file with nothing left to remove is still re-saved by pdf-lib
    // and handed back as a new blob rather than the input.
    expect(summary(again.result.report.fieldsRemoved)).toEqual([]);
    expect(again.result.cleanedBlob).not.toBe(again.file);
  });

  it("keeps the Info author fields when author is off, but drops the whole XMP packet", async () => {
    const { result } = await run(await buildPdf(), name, PDF_MIME, allBut("author"));

    expect(result.error).toBeUndefined();
    // Quirk (deliberate today): XMP can only be dropped whole, so its author
    // properties are reported removed even though author was kept.
    expect(summary(result.report.fieldsRemoved)).toEqual(
      sorted([
        "custom:Keywords",
        "dates:CreationDate",
        "dates:ModDate",
        "software:Creator",
        "software:Producer",
        ...PDF_XMP_FIELDS,
        ...PDF_CUSTOM_INFO_FIELDS,
      ])
    );
    expect(summary(result.report.fieldsKept)).toEqual(["author:Author", "author:Subject", "author:Title"]);

    const again = await reread(result, name, PDF_MIME);
    expect(summary(again.result.report.fieldsFound)).toEqual(["author:Author", "author:Subject", "author:Title"]);
  });

  describe("broken file", () => {
    // pdf-lib logs a console.warn for every object it can't parse.
    beforeEach(() => {
      vi.spyOn(console, "warn").mockImplementation(() => {});
    });
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("crashes on a PDF cut off right after its header", async () => {
      // 16 bytes: "%PDF-1.7", the binary comment line, and nothing else.
      // pdf-lib loads this without complaint, then processPdf throws a
      // TypeError reading the missing catalog, so the coordinator's crash
      // guard answers instead of processPdf's own error path.
      const { file, result } = await run(truncated(await buildPdf(), 16), name, PDF_MIME, ALL_ON);

      expect(result.error).toBe(
        "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet."
      );
      expect(result.crashed).toBe("TypeError");
      expect(result.cleanedBlob.size).toBe(16);
      expect(result.cleanedBlob).toBe(file);
      expect(result.report.cleanedFileSize).toBe(0);
    });

    it("reports a PDF cut off inside its first object as unparseable", async () => {
      // 64 bytes: the header plus the start of the XMP stream object.
      const { file, result } = await run(truncated(await buildPdf(), 64), name, PDF_MIME, ALL_ON);

      // Quirk: a terse internal error, unlike the coordinator's user-facing
      // wording, and a copy of the bytes (with cleanedFileSize set) where the
      // crash path above returns the file itself with cleanedFileSize 0.
      expect(result.error).toBe("Could not parse PDF");
      expect(result.crashed).toBeUndefined();
      expect(result.cleanedBlob.size).toBe(64);
      expect(result.cleanedBlob).not.toBe(file);
      expect(result.report.cleanedFileSize).toBe(64);
    });
  });
});

// ── Office (shared by DOCX, XLSX, PPTX) ──────────────────────────────────

// core.xml and app.xml rows from the shared fixture parts, as
// office-common.ts categorises them.
const OFFICE_PROPERTY_FIELDS = [
  "author:Company",
  "author:Manager",
  "author:creator",
  "author:description",
  "author:lastModifiedBy",
  "author:subject",
  "author:title",
  "custom:keywords",
  "custom:revision",
  "dates:TotalTime",
  "dates:created",
  "dates:modified",
  "software:AppVersion",
  "software:Application",
  "software:Template",
];

const OFFICE_AUTHOR_FIELDS = OFFICE_PROPERTY_FIELDS.filter((row) => row.startsWith("author:"));
const OFFICE_NON_AUTHOR_FIELDS = OFFICE_PROPERTY_FIELDS.filter((row) => !row.startsWith("author:"));

// Office files are zips, so identification falls back to the MIME type. A zip
// cut off after its first local header has the right signature but no central
// directory, so JSZip can't open it.
const BROKEN_ZIP_LENGTH = 64;

// ── DOCX ─────────────────────────────────────────────────────────────────

const DOCX_PART_FIELDS = [
  "author:word/people.xml",
  "comments:tracked-changes",
  "comments:word/comments.xml",
  "comments:word/commentsExtended.xml",
  "custom:custom.xml",
];

describe("DOCX", () => {
  const name = "report.docx";

  it("removes every field when all categories are on, and a re-read finds nothing", async () => {
    const { result } = await run(await buildDocx(), name, DOCX_MIME, ALL_ON);

    expect(result.error).toBeUndefined();
    const everything = sorted([...OFFICE_PROPERTY_FIELDS, ...DOCX_PART_FIELDS]);
    expect(summary(result.report.fieldsFound)).toEqual(everything);
    expect(summary(result.report.fieldsRemoved)).toEqual(everything);
    expect(summary(result.report.fieldsKept)).toEqual([]);

    // Tracked changes are resolved as "accept all": the deleted word goes, the
    // inserted one stays as plain text.
    const body = await zipText(result.cleanedBlob, "word/document.xml");
    expect(body).toContain("<w:t>twelve</w:t>");
    expect(body).not.toContain(">ten<");
    expect(body).not.toMatch(/<w:(ins|del|rPrChange)\b/);

    const again = await reread(result, name, DOCX_MIME);
    expect(again.result.error).toBeUndefined();
    expect(summary(again.result.report.fieldsFound)).toEqual([]);
    // Quirk: the zip is regenerated even when nothing was removed.
    expect(summary(again.result.report.fieldsRemoved)).toEqual([]);
    expect(again.result.cleanedBlob).not.toBe(again.file);
  });

  it("keeps the author fields when author is off, but still removes word/people.xml", async () => {
    const { result } = await run(await buildDocx(), name, DOCX_MIME, allBut("author"));

    expect(result.error).toBeUndefined();
    // Quirk: people.xml is categorised "author" but removal is gated on the
    // comments switch, so it is reported (and really is) removed while author
    // is being kept.
    expect(summary(result.report.fieldsRemoved)).toEqual(
      sorted([...OFFICE_NON_AUTHOR_FIELDS, ...DOCX_PART_FIELDS])
    );
    expect(summary(result.report.fieldsKept)).toEqual(OFFICE_AUTHOR_FIELDS);
    expect(await zipPaths(result.cleanedBlob)).not.toContain("word/people.xml");

    const again = await reread(result, name, DOCX_MIME);
    expect(summary(again.result.report.fieldsFound)).toEqual(OFFICE_AUTHOR_FIELDS);
  });

  it("blanks properties in place and leaves references to the parts it removed", async () => {
    const { result } = await run(await buildDocx(), name, DOCX_MIME, ALL_ON);

    // Quirk: stripped properties stay as empty elements, including the W3CDTF
    // dates, whose empty value is not a valid date.
    const core = await zipText(result.cleanedBlob, "docProps/core.xml");
    expect(core).toContain("<dc:creator/>");
    expect(core).toContain(`<dcterms:created xsi:type="dcterms:W3CDTF"/>`);
    const app = await zipText(result.cleanedBlob, "docProps/app.xml");
    expect(app).toContain("<Company/>");

    // Quirk: the comment, people and custom parts are deleted, but their
    // content-type overrides, relationships and the comment anchors in the
    // body all still point at them. office-common.ts notes Office tolerates it.
    expect(await zipPaths(result.cleanedBlob)).toEqual([
      "[Content_Types].xml",
      "_rels/",
      "_rels/.rels",
      "docProps/",
      "docProps/app.xml",
      "docProps/core.xml",
      "word/",
      "word/_rels/",
      "word/_rels/document.xml.rels",
      "word/document.xml",
    ]);
    const types = await zipText(result.cleanedBlob, "[Content_Types].xml");
    expect(types).toContain(`PartName="/word/comments.xml"`);
    expect(types).toContain(`PartName="/docProps/custom.xml"`);
    const rels = await zipText(result.cleanedBlob, "word/_rels/document.xml.rels");
    expect(rels).toContain(`Target="people.xml"`);
    const body = await zipText(result.cleanedBlob, "word/document.xml");
    expect(body).toContain(`<w:commentReference w:id="0"/>`);
  });

  it("reports a zip that won't open as unparseable", async () => {
    const { file, result } = await run(truncated(await buildDocx(), BROKEN_ZIP_LENGTH), name, DOCX_MIME, ALL_ON);

    // Quirk: a terse internal error and a copy of the bytes rather than the
    // file itself, with cleanedFileSize set (the coordinator's failures use 0).
    expect(result.error).toBe("Could not parse DOCX");
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob.size).toBe(BROKEN_ZIP_LENGTH);
    expect(result.cleanedBlob).not.toBe(file);
    expect(result.report.cleanedFileSize).toBe(BROKEN_ZIP_LENGTH);
  });
});

// ── XLSX and PPTX ────────────────────────────────────────────────────────
// Near-identical processors (to be merged), so one parallel set of tests
// covers both; only the comment-part paths and the error text differ.

describe.each([
  {
    label: "XLSX",
    name: "numbers.xlsx",
    mime: XLSX_MIME,
    build: buildXlsx,
    // A legacy cell comment, a threaded comment and the threaded-comment
    // person list.
    commentParts: [
      "comments:xl/comments1.xml",
      "comments:xl/persons/person.xml",
      "comments:xl/threadedComments/threadedComment1.xml",
    ],
    parseError: "Could not parse XLSX",
  },
  {
    label: "PPTX",
    name: "deck.pptx",
    mime: PPTX_MIME,
    build: buildPptx,
    // A modern slide comment and both author lists. The speaker notes part in
    // the fixture is left alone on purpose, so it never appears here.
    commentParts: [
      "comments:ppt/authors.xml",
      "comments:ppt/commentAuthors.xml",
      "comments:ppt/comments/modernComment_100_1A2B3C4D.xml",
    ],
    parseError: "Could not parse PPTX",
  },
])("$label", ({ name, mime, build, commentParts, parseError }) => {
  it("removes every field when all categories are on, and a re-read finds nothing", async () => {
    const { result } = await run(await build(), name, mime, ALL_ON);

    expect(result.error).toBeUndefined();
    // Quirk: the person and author lists name people but are filed under
    // "comments", where DOCX files word/people.xml under "author".
    const everything = sorted([...OFFICE_PROPERTY_FIELDS, "custom:custom.xml", ...commentParts]);
    expect(summary(result.report.fieldsFound)).toEqual(everything);
    expect(summary(result.report.fieldsRemoved)).toEqual(everything);
    expect(summary(result.report.fieldsKept)).toEqual([]);

    const again = await reread(result, name, mime);
    expect(again.result.error).toBeUndefined();
    expect(summary(again.result.report.fieldsFound)).toEqual([]);
    // Quirk: the zip is regenerated even when nothing was removed.
    expect(summary(again.result.report.fieldsRemoved)).toEqual([]);
    expect(again.result.cleanedBlob).not.toBe(again.file);
  });

  it("leaves comment parts unreported when comments are off", async () => {
    const { result } = await run(await build(), name, mime, allBut("comments"));

    expect(result.error).toBeUndefined();
    // Quirk: the comment parts are only looked for when they are being
    // removed, so keeping them leaves them out of found AND kept; the report
    // says nothing about comments the file still carries.
    const properties = sorted([...OFFICE_PROPERTY_FIELDS, "custom:custom.xml"]);
    expect(summary(result.report.fieldsFound)).toEqual(properties);
    expect(summary(result.report.fieldsRemoved)).toEqual(properties);
    expect(summary(result.report.fieldsKept)).toEqual([]);

    // A re-read with everything on shows they were there all along.
    const again = await reread(result, name, mime);
    expect(summary(again.result.report.fieldsFound)).toEqual(commentParts);
  });

  it("reports a zip that won't open as unparseable", async () => {
    const { file, result } = await run(truncated(await build(), BROKEN_ZIP_LENGTH), name, mime, ALL_ON);

    // Quirk: same shape as DOCX: a terse internal error and a copy of the
    // bytes rather than the file itself, with cleanedFileSize set.
    expect(result.error).toBe(parseError);
    expect(result.crashed).toBeUndefined();
    expect(result.cleanedBlob.size).toBe(BROKEN_ZIP_LENGTH);
    expect(result.cleanedBlob).not.toBe(file);
    expect(result.report.cleanedFileSize).toBe(BROKEN_ZIP_LENGTH);
  });
});

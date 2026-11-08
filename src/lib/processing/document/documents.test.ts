// @vitest-environment happy-dom
// DOMParser and XMLSerializer (used by the Office processors) don't exist in
// Node, hence the happy-dom environment above.

/** Behaviour tests for the document processors (PDF, DOCX, XLSX, PPTX),
 *  driven through processFile as the app drives them. They began as
 *  characterisation tests pinning the old behaviour; where the processor
 *  contract changed it, a comment says what it used to do. Comments marked
 *  "Quirk" are known gaps left for later. */

import JSZip from "jszip";
import { PDFDict, PDFDocument, PDFName, PDFNumber, PDFString } from "pdf-lib";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { isUnexplained, lockKindOf, processFile } from "../coordinator";
import { lockedPdf } from "./locked-pdfs.fixture";
import { expectFoundIgnoresOptions } from "../contract-checks.fixture";
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
  pdfWithInfo,
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

// The XMP packet in the fixture, as the XMP reader names it. dc:title is
// Custom, as EXIF's ImageDescription is; it used to be Author.
const PDF_XMP_FIELDS = [
  "author:XMP:dc:creator",
  "copyright:XMP:dc:rights",
  "custom:XMP:dc:title",
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
    await expectUntouched(again);
  });

  it("keeps the Info author fields when author is off, but drops the whole XMP packet", async () => {
    const { result } = await run(await buildPdf(), name, PDF_MIME, allBut("author"));

    expect(result.error).toBeUndefined();
    // XMP can only be dropped whole, and its other categories are being
    // removed, so its author properties go too and are reported removed.
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

    it("refuses a PDF cut off right after its header", async () => {
      // 16 bytes: "%PDF-1.7", the binary comment line, and nothing else.
      // pdf-lib loads it without complaint but finds no document catalog;
      // reading it used to throw a TypeError, reported as a crash.
      const { file, result } = await run(truncated(await buildPdf(), 16), name, PDF_MIME, ALL_ON);
      expectUnreadable(file, result, "pdf");
    });

    it("refuses a PDF cut off inside its first object", async () => {
      // 64 bytes: the header plus the start of the XMP stream object. This
      // used to return "Could not parse PDF" and a copy of the bytes.
      const { file, result } = await run(truncated(await buildPdf(), 64), name, PDF_MIME, ALL_ON);
      expectUnreadable(file, result, "pdf");
    });
  });

  // pdf-lib's Info getters throw on anything they can't type, which used to
  // fail the whole file as a crash and leave all its metadata in place.
  describe("an Info value pdf-lib can't read", () => {
    it.each([
      ["a date in words", "CreationDate", PDFString.of("Monday, 5 January"), "dates:CreationDate", "Monday, 5 January"],
      ["an impossible date", "ModDate", PDFString.of("D:20261399120000Z"), "dates:ModDate", "D:20261399120000Z"],
      ["a date that's a number", "ModDate", PDFNumber.of(5), "dates:ModDate", "5"],
      ["a title that's a name", "Title", PDFName.of("Foo"), "author:Title", "/Foo"],
      ["keywords that are a name", "Keywords", PDFName.of("Foo"), "custom:Keywords", "/Foo"],
    ])("reports and removes %s", async (_label, key, value, field, shown) => {
      const { result } = await run(await pdfWithInfo(key, value), name, PDF_MIME, ALL_ON);

      expect(result.error).toBeUndefined();
      expect(summary(result.report.fieldsRemoved)).toEqual([field]);
      expect(result.report.fieldsFound[0].value).toBe(shown);

      const again = await reread(result, name, PDF_MIME);
      expect(again.result.error).toBeUndefined();
      expect(summary(again.result.report.fieldsFound)).toEqual([]);
    });

    it("keeps one whose category is off, and says so", async () => {
      const input = await pdfWithInfo("CreationDate", PDFString.of("Monday, 5 January"));
      const { result } = await run(input, name, PDF_MIME, allBut("dates"));

      expect(result.error).toBeUndefined();
      expect(summary(result.report.fieldsKept)).toEqual(["dates:CreationDate"]);

      const again = await reread(result, name, PDF_MIME);
      expect(summary(again.result.report.fieldsFound)).toEqual(["dates:CreationDate"]);
    });

    it("treats an empty date as nothing to report", async () => {
      const { result } = await run(await pdfWithInfo("CreationDate", PDFString.of("")), name, PDF_MIME, ALL_ON);
      expect(result.error).toBeUndefined();
      expect(result.report.fieldsFound).toEqual([]);
    });
  });

  describe("a crash", () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    it("names the Info field it happened on", async () => {
      const input = await buildPdf();
      vi.spyOn(PDFDocument.prototype, "setTitle").mockImplementation(() => {
        throw new Error("boom");
      });
      const { result } = await run(input, name, PDF_MIME, ALL_ON);
      expect(result.reason).toBe("crash: Error at info:Title");
    });

    it("keeps the error's own text out of the reason", async () => {
      const input = await buildPdf();
      vi.spyOn(PDFDocument.prototype, "save").mockRejectedValue(new Error("Private Project Name"));
      const { result } = await run(input, name, PDF_MIME, ALL_ON);
      expect(result.reason).toBe("crash: Error at save");
    });
  });

  // pdf-lib saves every object it loaded, including ones nothing refers to any
  // more. A PDF that ExifTool had "stripped" (it unlinks the XMP stream and
  // leaves it in the file) came out of MetaStrip with its first author's name
  // still in the bytes, and the review never listed it (8 Nov 2026).
  describe("leftovers from earlier edits", () => {
    async function withOrphan(): Promise<Uint8Array> {
      const doc = await PDFDocument.load(await buildPdf(), { updateMetadata: false });
      const xmp = doc.context.flateStream("<x:xmpmeta><dc:creator>Original Author Alice</dc:creator></x:xmpmeta>", {
        Type: "Metadata", Subtype: "XML",
      });
      doc.context.register(xmp); // in the file, referred to by nothing
      return doc.save({ useObjectStreams: false });
    }
    const text = async (r: ProcessingResult) => new TextDecoder("latin1").decode(await r.cleanedBlob.arrayBuffer());

    it("lists them and removes them with everything else", async () => {
      const { result } = await run(await withOrphan(), name, PDF_MIME, ALL_ON);
      const field = result.report.fieldsFound.find((f) => f.key === "Leftovers");
      expect(field?.value).toBe("1 unused object, including old metadata");
      expect(summary(result.report.fieldsRemoved)).toContain("custom:Leftovers");
      expect(await text(result)).not.toContain("Original Author Alice");
      const again = await reread(result, name, PDF_MIME);
      expect(summary(again.result.report.fieldsFound)).toEqual([]);
    });

    it("removes them whenever anything is removed, even with Custom off", async () => {
      const { result } = await run(await withOrphan(), name, PDF_MIME, allBut("custom"));
      expect(summary(result.report.fieldsRemoved)).toContain("custom:Leftovers");
      expect(await text(result)).not.toContain("Original Author Alice");
    });

    it("finds none in an ordinary PDF", async () => {
      const { result } = await run(await buildPdf(), name, PDF_MIME, ALL_ON);
      expect(result.report.fieldsFound.some((f) => f.key === "Leftovers")).toBe(false);
    });
  });

  // pdf-lib refuses to load an encrypted PDF, and that refusal used to be
  // caught as "unreadable", so a locked file was called damaged. Two real ones
  // in the week of 1 Nov 2026 may have been this.
  describe("a locked PDF", () => {
    const opensFreely = ["r2-open", "r3-open", "r4-open", "r4-open-meta-clear", "r4-open-objstm", "r6-open", "r6-open-objstm"] as const;
    const needsPassword = ["r2-pass", "r3-pass", "r4-pass", "r4-pass-objstm", "r6-pass", "r6-pass-objstm"] as const;

    it.each(opensFreely)("%s opens without a password, so it's locked by permissions", async (fixture) => {
      const { file, result } = await run(lockedPdf(fixture), name, PDF_MIME, ALL_ON);
      expectLocked(file, result, "permissions");
    });

    it.each(needsPassword)("%s needs a password to open", async (fixture) => {
      const { file, result } = await run(lockedPdf(fixture), name, PDF_MIME, ALL_ON);
      expectLocked(file, result, "password");
    });

    it("is still locked, kind unknown, when the security handler isn't the standard one", async () => {
      const pdf = await PDFDocument.load(lockedPdf("r4-pass"), { ignoreEncryption: true });
      const encrypt = pdf.context.lookup(pdf.context.trailerInfo.Encrypt, PDFDict);
      encrypt.set(PDFName.of("Filter"), PDFName.of("Adobe.PubSec"));
      const { file, result } = await run(await pdf.save({ useObjectStreams: false }), name, PDF_MIME, ALL_ON);
      expectLocked(file, result, "unknown");
    });

    it("is never reported as unexplained, so it gets no email link", async () => {
      const { result } = await run(lockedPdf("r6-pass"), name, PDF_MIME, ALL_ON);
      expect(isUnexplained(result.reason)).toBe(false);
      expect(lockKindOf(result.reason)).toBe("password");
    });
  });
});

function expectLocked(file: File, result: ProcessingResult, kind: string) {
  expect(result.reason).toBe(`locked: pdf ${kind}`);
  expect(result.error).toMatch(/locked/);
  expect(result.error).not.toBe(DAMAGED);
  expect(result.cleanedBlob).toBe(file);
  expect(result.report.fieldsFound).toEqual([]);
}

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

/** What Word and Excel check before offering to "repair" a file: every
 *  content-type override and internal relationship points at a part that
 *  exists, and no core or app property is left empty. */
async function expectOpensCleanly(blob: Blob) {
  const zip = await JSZip.loadAsync(await blob.arrayBuffer());
  const parts = new Set(Object.values(zip.files).filter((f) => !f.dir).map((f) => f.name.toLowerCase()));
  const problems: string[] = [];

  const types = (await zip.file("[Content_Types].xml")?.async("text")) ?? "";
  for (const [, partName] of types.matchAll(/PartName="\/([^"]+)"/g)) {
    if (!parts.has(partName.toLowerCase())) problems.push(`content type for missing ${partName}`);
  }
  for (const rels of zip.file(/(^|\/)_rels\/[^/]*\.rels$/)) {
    const base = rels.name.replace(/(^|\/)_rels\/[^/]*$/, "");
    for (const [rel] of (await rels.async("text")).matchAll(/<Relationship\b[^>]*\/>/g)) {
      if (/TargetMode="External"/i.test(rel)) continue;
      const target = /Target="([^"]*)"/.exec(rel)![1];
      const segments = target.startsWith("/") ? [] : base.split("/").filter(Boolean);
      for (const s of target.split("/")) {
        if (s === "..") segments.pop();
        else if (s && s !== ".") segments.push(s);
      }
      const resolved = segments.join("/").toLowerCase();
      if (!parts.has(resolved)) problems.push(`${rels.name} points at missing ${resolved}`);
    }
  }
  for (const path of ["docProps/core.xml", "docProps/app.xml"]) {
    const xml = await zip.file(path)?.async("text");
    // An empty root is fine (every property is optional); an empty property isn't.
    for (const [empty, tag] of xml?.matchAll(/<([\w:]+)(?:\s[^>]*)?\/>/g) ?? []) {
      if (tag !== "cp:coreProperties" && tag !== "Properties") problems.push(`${path} has empty ${empty}`);
    }
  }
  expect(problems).toEqual([]);
}

const DAMAGED = "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.";

/** The contract's one failure shape: the original file handed back untouched,
 *  a plain message for the person, and a stable reason for telemetry. */
function expectUnreadable(file: File, result: ProcessingResult, format: string) {
  expect(result.error).toBe(DAMAGED);
  expect(result.reason).toBe(`unreadable: ${format}`);
  expect(result.cleanedBlob).toBe(file);
  expect(result.report.cleanedFileSize).toBe(file.size);
  expect(result.report.fieldsFound).toEqual([]);
}

/** Nothing left to remove: the contract hands back the original bytes, where
 *  pdf-lib and JSZip used to re-save the file anyway. */
async function expectUntouched(again: { file: File; result: ProcessingResult }) {
  expect(summary(again.result.report.fieldsRemoved)).toEqual([]);
  const before = new Uint8Array(await again.file.arrayBuffer());
  const after = new Uint8Array(await again.result.cleanedBlob.arrayBuffer());
  expect(after).toEqual(before);
}

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
    await expectUntouched(again);
  });

  it("keeps the author fields and word/people.xml when author is off", async () => {
    const { result } = await run(await buildDocx(), name, DOCX_MIME, allBut("author"));

    expect(result.error).toBeUndefined();
    // people.xml (the people who commented or edited) goes with Author, its
    // category. It used to be removed with Comments while reported as Author.
    const authorParts = DOCX_PART_FIELDS.filter((row) => row.startsWith("author:"));
    expect(authorParts).toEqual(["author:word/people.xml"]);
    expect(summary(result.report.fieldsRemoved)).toEqual(
      sorted([...OFFICE_NON_AUTHOR_FIELDS, ...DOCX_PART_FIELDS.filter((row) => !authorParts.includes(row))])
    );
    expect(summary(result.report.fieldsKept)).toEqual(sorted([...OFFICE_AUTHOR_FIELDS, ...authorParts]));
    expect(await zipPaths(result.cleanedBlob)).toContain("word/people.xml");

    const again = await reread(result, name, DOCX_MIME);
    expect(summary(again.result.report.fieldsFound)).toEqual(sorted([...OFFICE_AUTHOR_FIELDS, ...authorParts]));
  });

  it("leaves no reference to a removed part or comment, and no empty property", async () => {
    const { result } = await run(await buildDocx(), name, DOCX_MIME, ALL_ON);
    // This used to leave the parts' content-type entries and relationships,
    // the comment anchors in the body, and properties blanked to empty values
    // such as an empty W3CDTF date. Word called that "unreadable content".
    await expectOpensCleanly(result.cleanedBlob);
    const body = await zipText(result.cleanedBlob, "word/document.xml");
    expect(body).not.toMatch(/<w:comment(RangeStart|RangeEnd|Reference)\b/);
    expect(body).toContain("<w:t>");
  });

  it("refuses a zip that won't open", async () => {
    // This used to return "Could not parse DOCX" and a copy of the bytes.
    const { file, result } = await run(truncated(await buildDocx(), BROKEN_ZIP_LENGTH), name, DOCX_MIME, ALL_ON);
    expectUnreadable(file, result, "docx");
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
    format: "xlsx",
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
    format: "pptx",
  },
])("$label", ({ name, mime, build, commentParts, format }) => {
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
    await expectUntouched(again);
  });

  it("reports comment parts as kept when comments are off", async () => {
    const { result } = await run(await build(), name, mime, allBut("comments"));

    expect(result.error).toBeUndefined();
    // Parts are always looked for. They used to be looked for only when being
    // removed, so kept comments were missing from the report altogether.
    const properties = sorted([...OFFICE_PROPERTY_FIELDS, "custom:custom.xml"]);
    expect(summary(result.report.fieldsFound)).toEqual(sorted([...properties, ...commentParts]));
    expect(summary(result.report.fieldsRemoved)).toEqual(properties);
    expect(summary(result.report.fieldsKept)).toEqual(commentParts);

    const again = await reread(result, name, mime);
    expect(summary(again.result.report.fieldsFound)).toEqual(commentParts);
  });

  it("refuses a zip that won't open", async () => {
    const { file, result } = await run(truncated(await build(), BROKEN_ZIP_LENGTH), name, mime, ALL_ON);
    expectUnreadable(file, result, format);
  });
});

describe("every document format", () => {
  it.each([
    ["PDF", buildPdf, "doc.pdf", PDF_MIME],
    ["DOCX", buildDocx, "letter.docx", DOCX_MIME],
    ["XLSX", buildXlsx, "sheet.xlsx", XLSX_MIME],
    ["PPTX", buildPptx, "deck.pptx", PPTX_MIME],
  ] as const)("%s finds the same fields whatever the options", async (_, build, name, mime) => {
    const bytes = await build();
    await expectFoundIgnoresOptions(() => new File([bytes as BlobPart], name, { type: mime }));
  });
});

describe("every Office format opens cleanly", () => {
  it.each([
    ["DOCX", buildDocx, "letter.docx", DOCX_MIME],
    ["XLSX", buildXlsx, "sheet.xlsx", XLSX_MIME],
    ["PPTX", buildPptx, "deck.pptx", PPTX_MIME],
  ] as const)("%s, whatever is kept", async (_, build, name, mime) => {
    const bytes = await build();
    for (const options of [ALL_ON, allBut("author"), allBut("comments"), allBut("custom"), allBut("dates")]) {
      const { result } = await run(bytes, name, mime, options);
      await expectOpensCleanly(result.cleanedBlob);
    }
  });
});

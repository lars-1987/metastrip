/** Small but realistic documents built in memory for the processor tests.
 *
 *  Each builder carries metadata the matching processor actually looks for,
 *  spread across several categories, so the tests pin what is found, removed
 *  and kept rather than an empty report. Nothing is read from disk. */

import JSZip from "jszip";
import { PDFDict, PDFDocument, PDFName, PDFString } from "pdf-lib";

export const PDF_MIME = "application/pdf";
export const DOCX_MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
export const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
export const PPTX_MIME = "application/vnd.openxmlformats-officedocument.presentationml.presentation";

const XML_HEAD = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n`;

// An Acrobat-shaped XMP packet. It repeats the Info fields (the "looks clean
// but isn't" case pdf.ts guards against) and adds a rights statement, a
// persistent document ID and one property the reader does not know by name,
// which should surface as a generic custom row.
const PDF_XMP = `<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>
<x:xmpmeta xmlns:x="adobe:ns:meta/">
  <rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">
    <rdf:Description rdf:about=""
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:xmp="http://ns.adobe.com/xap/1.0/"
        xmlns:pdf="http://ns.adobe.com/pdf/1.3/"
        xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/"
        xmlns:pdfx="http://ns.adobe.com/pdfx/1.3/">
      <dc:title><rdf:Alt><rdf:li xml:lang="x-default">Quarterly Report</rdf:li></rdf:Alt></dc:title>
      <dc:creator><rdf:Seq><rdf:li>Jane Doe</rdf:li></rdf:Seq></dc:creator>
      <dc:rights><rdf:Alt><rdf:li xml:lang="x-default">Copyright 2026 Acme Ltd</rdf:li></rdf:Alt></dc:rights>
      <xmp:CreatorTool>Microsoft Word</xmp:CreatorTool>
      <xmp:CreateDate>2026-01-02T03:04:05Z</xmp:CreateDate>
      <pdf:Producer>Acrobat Distiller 23.0</pdf:Producer>
      <xmpMM:DocumentID>uuid:1b2c3d4e-0000-4000-8000-000000000001</xmpMM:DocumentID>
      <pdfx:Department>Finance</pdfx:Department>
    </rdf:Description>
  </rdf:RDF>
</x:xmpmeta>
<?xpacket end="w"?>`;

/** A one-page PDF with every Info field pdf.ts reads, one non-standard Info
 *  key (Company, the kind Office exports add) and a plain XMP stream. */
export async function buildPdf(): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  doc.addPage([200, 200]);
  doc.setTitle("Quarterly Report");
  doc.setAuthor("Jane Doe");
  doc.setSubject("Q3 numbers");
  doc.setKeywords(["finance", "internal"]);
  doc.setCreator("Microsoft Word");
  doc.setProducer("Acrobat Distiller 23.0");
  doc.setCreationDate(new Date("2026-01-02T03:04:05Z"));
  doc.setModificationDate(new Date("2026-02-03T04:05:06Z"));
  // getInfoDict is private, so reach the Info dict the way pdf.ts does.
  const info = doc.context.lookup(doc.context.trailerInfo.Info, PDFDict);
  info.set(PDFName.of("Company"), PDFString.of("Acme Ltd"));

  // Uncompressed on purpose: pdf.ts reads the raw stream contents without
  // inflating them, and real XMP streams are required to be plain.
  const xmp = doc.context.stream(PDF_XMP, { Type: "Metadata", Subtype: "XML" });
  doc.catalog.set(PDFName.of("Metadata"), doc.context.register(xmp));

  return doc.save();
}

/** A one-page PDF whose only metadata is an XMP stream: no Info fields, and
 *  pdf-lib told not to add its own producer and dates. */
export async function pdfWithXmp(xmp: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create({ updateMetadata: false });
  doc.addPage([200, 200]);
  const stream = doc.context.stream(new TextEncoder().encode(xmp), { Type: "Metadata", Subtype: "XML" });
  doc.catalog.set(PDFName.of("Metadata"), doc.context.register(stream));
  return doc.save({ updateFieldAppearances: false });
}

const CORE_XML = `${XML_HEAD}<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>Quarterly Report</dc:title><dc:subject>Q3 numbers</dc:subject><dc:creator>Jane Doe</dc:creator><cp:keywords>finance, internal</cp:keywords><dc:description>Draft for the board</dc:description><cp:lastModifiedBy>John Smith</cp:lastModifiedBy><cp:revision>7</cp:revision><dcterms:created xsi:type="dcterms:W3CDTF">2026-01-02T03:04:05Z</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">2026-02-03T04:05:06Z</dcterms:modified></cp:coreProperties>`;

/** app.xml with every element office-common.ts maps, under the application
 *  name the real writer would use. */
function appXml(application: string): string {
  return `${XML_HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Template>Normal.dotm</Template><TotalTime>42</TotalTime><Application>${application}</Application><Company>Acme Ltd</Company><Manager>Alice Boss</Manager><AppVersion>16.0000</AppVersion></Properties>`;
}

const CUSTOM_XML = `${XML_HEAD}<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/custom-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><property fmtid="{D5CDD505-2E9C-101B-9397-08002B2CF9AE}" pid="2" name="Classification"><vt:lpwstr>Confidential</vt:lpwstr></property></Properties>`;

/** The package relationships and content-type entries every Office file has. */
function packageBase(zip: JSZip, mainPart: string, mainType: string, overrides: Record<string, string>) {
  const entries = {
    [`/${mainPart}`]: mainType,
    "/docProps/core.xml": "application/vnd.openxmlformats-package.core-properties+xml",
    "/docProps/app.xml": "application/vnd.openxmlformats-officedocument.extended-properties+xml",
    "/docProps/custom.xml": "application/vnd.openxmlformats-officedocument.custom-properties+xml",
    ...overrides,
  };
  zip.file(
    "[Content_Types].xml",
    `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${Object.entries(entries)
      .map(([part, type]) => `<Override PartName="${part}" ContentType="${type}"/>`)
      .join("")}</Types>`
  );
  zip.file(
    "_rels/.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="${mainPart}"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/><Relationship Id="rId4" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/custom-properties" Target="docProps/custom.xml"/></Relationships>`
  );
  zip.file("docProps/core.xml", CORE_XML);
  zip.file("docProps/custom.xml", CUSTOM_XML);
}

const W_NS = `xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:w15="http://schemas.microsoft.com/office/word/2012/wordml"`;

// One paragraph with an insertion, a deletion and a formatting change, plus a
// comment anchor: every kind of revision markup docx.ts looks for.
const DOCX_DOCUMENT = `${XML_HEAD}<w:document ${W_NS}><w:body><w:p><w:commentRangeStart w:id="0"/><w:r><w:t xml:space="preserve">Revenue was </w:t></w:r><w:del w:id="1" w:author="John Smith" w:date="2026-02-03T04:05:06Z"><w:r><w:delText>ten</w:delText></w:r></w:del><w:ins w:id="2" w:author="John Smith" w:date="2026-02-03T04:05:06Z"><w:r><w:t>twelve</w:t></w:r></w:ins><w:r><w:rPr><w:b/><w:rPrChange w:id="3" w:author="John Smith" w:date="2026-02-03T04:05:06Z"><w:rPr/></w:rPrChange></w:rPr><w:t xml:space="preserve"> million.</w:t></w:r><w:commentRangeEnd w:id="0"/><w:r><w:commentReference w:id="0"/></w:r></w:p><w:sectPr/></w:body></w:document>`;

/** A Word document with core, app and custom properties, comments with their
 *  extended part and author list, and tracked changes. */
export async function buildDocx(): Promise<Uint8Array> {
  const zip = new JSZip();
  packageBase(zip, "word/document.xml", "application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml", {
    "/word/comments.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.comments+xml",
    "/word/commentsExtended.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.commentsExtended+xml",
    "/word/people.xml": "application/vnd.openxmlformats-officedocument.wordprocessingml.people+xml",
  });
  zip.file("docProps/app.xml", appXml("Microsoft Office Word"));
  zip.file("word/document.xml", DOCX_DOCUMENT);
  zip.file(
    "word/_rels/document.xml.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="comments.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/office/2011/relationships/commentsExtended" Target="commentsExtended.xml"/><Relationship Id="rId3" Type="http://schemas.microsoft.com/office/2011/relationships/people" Target="people.xml"/></Relationships>`
  );
  zip.file(
    "word/comments.xml",
    `${XML_HEAD}<w:comments ${W_NS}><w:comment w:id="0" w:author="John Smith" w:date="2026-02-03T04:05:06Z" w:initials="JS"><w:p><w:r><w:t>Check this figure.</w:t></w:r></w:p></w:comment></w:comments>`
  );
  zip.file(
    "word/commentsExtended.xml",
    `${XML_HEAD}<w15:commentsEx ${W_NS}><w15:commentEx w15:paraId="1A2B3C4D" w15:done="0"/></w15:commentsEx>`
  );
  zip.file(
    "word/people.xml",
    `${XML_HEAD}<w15:people ${W_NS}><w15:person w15:author="John Smith"><w15:presenceInfo w15:providerId="AD" w15:userId="john.smith@acme.example"/></w15:person></w15:people>`
  );
  return zip.generateAsync({ type: "uint8array" });
}

/** An Excel workbook with core, app and custom properties, a legacy cell
 *  comment, a threaded comment and the person list threaded comments use. */
export async function buildXlsx(): Promise<Uint8Array> {
  const zip = new JSZip();
  packageBase(zip, "xl/workbook.xml", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml", {
    "/xl/worksheets/sheet1.xml": "application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml",
    "/xl/comments1.xml": "application/vnd.openxmlformats-officedocument.spreadsheetml.comments+xml",
    "/xl/threadedComments/threadedComment1.xml": "application/vnd.ms-excel.threadedcomments+xml",
    "/xl/persons/person.xml": "application/vnd.ms-excel.person+xml",
  });
  zip.file("docProps/app.xml", appXml("Microsoft Excel"));
  zip.file(
    "xl/workbook.xml",
    `${XML_HEAD}<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Sheet1" sheetId="1" r:id="rId1"/></sheets></workbook>`
  );
  zip.file(
    "xl/_rels/workbook.xml.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/office/2017/10/relationships/person" Target="persons/person.xml"/></Relationships>`
  );
  zip.file(
    "xl/worksheets/sheet1.xml",
    `${XML_HEAD}<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData><row r="1"><c r="A1"><v>12</v></c></row></sheetData></worksheet>`
  );
  zip.file(
    "xl/worksheets/_rels/sheet1.xml.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/comments" Target="../comments1.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/office/2017/10/relationships/threadedComment" Target="../threadedComments/threadedComment1.xml"/></Relationships>`
  );
  zip.file(
    "xl/comments1.xml",
    `${XML_HEAD}<comments xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><authors><author>John Smith</author></authors><commentList><comment ref="A1" authorId="0"><text><r><t>Check this figure.</t></r></text></comment></commentList></comments>`
  );
  zip.file(
    "xl/threadedComments/threadedComment1.xml",
    `${XML_HEAD}<ThreadedComments xmlns="http://schemas.microsoft.com/office/spreadsheetml/2018/threadedcomments"><threadedComment ref="A1" dT="2026-02-03T04:05:06.00" personId="{00000000-0000-4000-8000-000000000001}" id="{00000000-0000-4000-8000-000000000002}"><text>Check this figure.</text></threadedComment></ThreadedComments>`
  );
  zip.file(
    "xl/persons/person.xml",
    `${XML_HEAD}<personList xmlns="http://schemas.microsoft.com/office/spreadsheetml/2018/threadedcomments"><person displayName="John Smith" id="{00000000-0000-4000-8000-000000000001}" userId="john.smith@acme.example" providerId="AD"/></personList>`
  );
  return zip.generateAsync({ type: "uint8array" });
}

/** A PowerPoint deck with core, app and custom properties, a modern slide
 *  comment with its author list, the legacy author list, and speaker notes
 *  (which pptx.ts deliberately leaves alone). */
export async function buildPptx(): Promise<Uint8Array> {
  const zip = new JSZip();
  packageBase(zip, "ppt/presentation.xml", "application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml", {
    "/ppt/slides/slide1.xml": "application/vnd.openxmlformats-officedocument.presentationml.slide+xml",
    "/ppt/notesSlides/notesSlide1.xml": "application/vnd.openxmlformats-officedocument.presentationml.notesSlide+xml",
    "/ppt/comments/modernComment_100_1A2B3C4D.xml": "application/vnd.ms-powerpoint.comments+xml",
    "/ppt/authors.xml": "application/vnd.ms-powerpoint.authors+xml",
    "/ppt/commentAuthors.xml": "application/vnd.openxmlformats-officedocument.presentationml.commentAuthors+xml",
  });
  zip.file("docProps/app.xml", appXml("Microsoft Office PowerPoint"));
  const P_NS = `xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"`;
  zip.file(
    "ppt/presentation.xml",
    `${XML_HEAD}<p:presentation ${P_NS}><p:sldIdLst><p:sldId id="256" r:id="rId1"/></p:sldIdLst></p:presentation>`
  );
  zip.file(
    "ppt/_rels/presentation.xml.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide1.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/office/2018/10/relationships/authors" Target="authors.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/commentAuthors" Target="commentAuthors.xml"/></Relationships>`
  );
  zip.file(
    "ppt/slides/slide1.xml",
    `${XML_HEAD}<p:sld ${P_NS}><p:cSld><p:spTree/></p:cSld></p:sld>`
  );
  zip.file(
    "ppt/slides/_rels/slide1.xml.rels",
    `${XML_HEAD}<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/notesSlide" Target="../notesSlides/notesSlide1.xml"/><Relationship Id="rId2" Type="http://schemas.microsoft.com/office/2018/10/relationships/comments" Target="../comments/modernComment_100_1A2B3C4D.xml"/></Relationships>`
  );
  zip.file(
    "ppt/notesSlides/notesSlide1.xml",
    `${XML_HEAD}<p:notes ${P_NS}><p:cSld><p:spTree/></p:cSld></p:notes>`
  );
  zip.file(
    "ppt/comments/modernComment_100_1A2B3C4D.xml",
    `${XML_HEAD}<p188:cmLst xmlns:p188="http://schemas.microsoft.com/office/powerpoint/2018/8/main"><p188:cm id="{00000000-0000-4000-8000-000000000002}" authorId="{00000000-0000-4000-8000-000000000001}" created="2026-02-03T04:05:06.000"><p188:txBody/></p188:cm></p188:cmLst>`
  );
  zip.file(
    "ppt/authors.xml",
    `${XML_HEAD}<p188:authorLst xmlns:p188="http://schemas.microsoft.com/office/powerpoint/2018/8/main"><p188:author id="{00000000-0000-4000-8000-000000000001}" name="John Smith" initials="JS" userId="john.smith@acme.example" providerId="AD"/></p188:authorLst>`
  );
  zip.file(
    "ppt/commentAuthors.xml",
    `${XML_HEAD}<p:cmAuthorLst ${P_NS}><p:cmAuthor id="1" name="John Smith" initials="JS" lastIdx="1" clrIdx="0"/></p:cmAuthorLst>`
  );
  return zip.generateAsync({ type: "uint8array" });
}

/** The first `length` bytes of a document: the right signature with the body
 *  (and, for a zip, the central directory) cut off, as an interrupted
 *  download leaves it. */
export function truncated(bytes: Uint8Array, length: number): Uint8Array {
  return bytes.slice(0, length);
}

/** How each container hands its XMP to the shared reader (xmp.ts) and drops
 *  the packet when it goes: JPEG, PNG, WebP, GIF, HEIC and PDF all list the
 *  same fields for the same packet and remove it by the same rule. */

import { describe, expect, it } from "vitest";
import { processFile } from "./coordinator";
import type { MetadataCategory, MetadataField, StripOptions } from "./types";
import { extractGpsCoordinates } from "../gps";
import { ALL_ON } from "./contract-checks.fixture";
import { gifWithXmp, heicWithXmp, jpegWithXmp, pngWithXmp, webpWithXmp } from "./image/image-files.fixture";
import { pdfWithXmp } from "./document/document-files.fixture";
import { AI_TOOL_XMP, EMPTY_XMP, LIGHTROOM_XMP } from "./xmp.fixture";

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();
const NONE = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;
const only = (c: MetadataCategory): StripOptions => ({ ...NONE, [c]: true });

type Make = (xmp: string) => Uint8Array | Promise<Uint8Array>;

async function strip(make: Make, xmp: string, name: string, type: string, options: StripOptions = ALL_ON) {
  const result = await processFile(new File([new Uint8Array(await make(xmp))], name, { type }), options);
  expect(result.error).toBeUndefined();
  const out = new TextDecoder("latin1").decode(new Uint8Array(await result.cleanedBlob.arrayBuffer()));
  return { result, out };
}

const CONTAINERS = [
  { label: "JPEG", name: "photo.jpg", type: "image/jpeg", make: (x: string) => jpegWithXmp(x) },
  { label: "PNG", name: "shot.png", type: "image/png", make: pngWithXmp },
  { label: "WebP", name: "pic.webp", type: "image/webp", make: webpWithXmp },
  { label: "GIF", name: "anim.gif", type: "image/gif", make: gifWithXmp },
  { label: "HEIC", name: "IMG_0001.HEIC", type: "image/heic", make: heicWithXmp },
  { label: "PDF", name: "doc.pdf", type: "application/pdf", make: pdfWithXmp },
].map((c) => [c.label, c] as const);

/** Every field of the Lightroom packet: [category, key, label, value]. The
 *  first twelve develop settings are listed, the other eight counted. */
const LIGHTROOM_FIELDS = [
  ["software", "XMP:xmp:CreatorTool", "XMP Creator Tool", "Adobe Photoshop Lightroom Classic 13.0 (Macintosh)"],
  ["dates", "XMP:xmp:CreateDate", "XMP Create Date", "2026-07-01T12:00:00+10:00"],
  ["dates", "XMP:xmp:ModifyDate", "XMP Modify Date", "2026-07-02T09:30:00+10:00"],
  ["device", "XMP:tiff:Make", "XMP Camera Make", "Apple"],
  ["device", "XMP:tiff:Model", "XMP Camera Model", "iPhone 15 Pro"],
  ["gps", "XMP:exif:GPSLatitude", "XMP GPS Latitude", "37,48.816S"],
  ["gps", "XMP:exif:GPSLongitude", "XMP GPS Longitude", "144,57.786E"],
  ["dates", "XMP:exif:DateTimeOriginal", "XMP Date Time Original", "2026-07-01T12:00:00+10:00"],
  ["device", "XMP:aux:SerialNumber", "XMP Serial Number", "SN-4821-TEST"],
  ["device", "XMP:exifEX:LensModel", "XMP Lens Model", "iPhone 15 Pro back camera"],
  ["gps", "XMP:photoshop:City", "XMP City", "Melbourne"],
  ["gps", "XMP:photoshop:State", "XMP State", "Victoria"],
  ["gps", "XMP:photoshop:Country", "XMP Country", "Australia"],
  ["copyright", "XMP:photoshop:Credit", "XMP Credit", "Jane Doe Photography"],
  ["custom", "XMP:xmpMM:DocumentID", "XMP Document ID", "xmp.did:0001"],
  ["custom", "XMP:xmpMM:InstanceID", "XMP Instance ID", "xmp.iid:0002"],
  ["custom", "XMP:xmpMM:OriginalDocumentID", "XMP Original Document ID", "xmp.did:0001"],
  ["author", "XMP:dc:creator", "XMP Creator", "Jane Doe"],
  ["copyright", "XMP:dc:rights", "XMP Rights", "(c) Jane Doe"],
  ["custom", "XMP:dc:title", "XMP Title", "Flinders Street"],
  ["custom", "XMP:dc:description", "XMP Description", "Evening light"],
  ["custom", "XMP:dc:subject", "XMP Keywords", "city, night"],
  ["author", "XMP:Iptc4xmpCore:CreatorContactInfo", "XMP Creator Contact Info", "jane@example.com, +61 400 000 000"],
  ["gps", "XMP:Iptc4xmpCore:Location", "XMP Location", "Flinders Street Station"],
  ["software", "XMP:xmpMM:History", "XMP Edit History", "2 steps, last by Adobe Photoshop 25.0 (Macintosh)"],
  ["custom", "XMP:xmpMM:DerivedFrom", "XMP Derived From", "xmp.iid:0000, xmp.did:0000"],
  ["custom", "XMP:photoshop:DocumentAncestors", "XMP Document Ancestors", "2 document IDs"],
  ...Array.from({ length: 12 }, (_, i) => ["custom", `XMP:crs:Setting${i + 1}`, `XMP Setting ${i + 1}`, String(i * 5)]),
  ["custom", "XMP:more", "More XMP properties", "8 not shown"],
];

const AI_FIELDS = [
  ["ai", "XMP:xmp:CreatorTool", "XMP Creator Tool", "Adobe Firefly"],
  ["ai", "XMP:dcterms:provenance", "C2PA manifest stored online", "https://cai-manifests.adobe.com/manifests/test-0001"],
  [
    "ai",
    "XMP:Iptc4xmpExt:DigitalSourceType",
    "AI-generated (IPTC digital source type)",
    "http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia",
  ],
];

const asRows = (fields: MetadataField[]) => fields.map((f) => [f.category, f.key, f.label, f.value]);

describe.each(CONTAINERS)("%s XMP", (_, fmt) => {
  it("lists every property of a Lightroom packet", async () => {
    // JPEG, PNG and WebP listed one Custom field; HEIC sniffed a few coarse
    // ones; GIF and PDF missed every attribute-form property it didn't know.
    const { result } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type);
    expect(asRows(result.report.fieldsFound)).toEqual(LIGHTROOM_FIELDS);
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
  });

  it("files an AI generator's markers under AI, one by one", async () => {
    const { result } = await strip(fmt.make, AI_TOOL_XMP, fmt.name, fmt.type);
    expect(asRows(result.report.fieldsFound)).toEqual(AI_FIELDS);
  });

  it("lists a packet with nothing readable as one field", async () => {
    const { result } = await strip(fmt.make, EMPTY_XMP, fmt.name, fmt.type);
    expect(asRows(result.report.fieldsFound)).toEqual([["custom", "XMP", "XMP packet", "(nothing readable)"]]);
  });

  it("puts the XMP GPS fix on the map", async () => {
    const { result } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type);
    const at = extractGpsCoordinates(result.report.fieldsFound);
    expect(at?.lat).toBeCloseTo(-37.8136, 4);
    expect(at?.lng).toBeCloseTo(144.9631, 4);
  });

  it("removes the packet when only GPS goes", async () => {
    // It used to stay in every container but HEIC, fix and all.
    const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, only("gps"));
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
    expect(out).not.toContain("37,48.816S");
  });

  it("removes the packet when only AI goes", async () => {
    // GIF and PDF used to keep it: nothing in it was filed under AI.
    const { out } = await strip(fmt.make, AI_TOOL_XMP, fmt.name, fmt.type, only("ai"));
    expect(out).not.toContain("trainedAlgorithmicMedia");
  });

  it("removes the packet, and reports its Custom fields removed, when Custom is kept", async () => {
    // JPEG, PNG and WebP used to keep it all: GPS, serial number and email.
    const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, { ...ALL_ON, custom: false });
    expect(result.report.fieldsKept).toEqual([]);
    expect(out).not.toContain("SN-4821-TEST");
    expect(out).not.toContain("jane@example.com");
  });

  it("keeps the packet when nothing in it is being removed", async () => {
    const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, only("comments"));
    expect(result.report.fieldsRemoved).toEqual([]);
    expect(out).toContain("37,48.816S");
  });

  it("removes a packet with nothing readable whenever any XMP category goes", async () => {
    const gone = await strip(fmt.make, EMPTY_XMP, fmt.name, fmt.type, only("dates"));
    expect(summary(gone.result.report.fieldsRemoved)).toEqual(["custom:XMP"]);
    const kept = await strip(fmt.make, EMPTY_XMP, fmt.name, fmt.type, only("comments"));
    expect(summary(kept.result.report.fieldsKept)).toEqual(["custom:XMP"]);
  });
});

describe("JPEG Extended XMP", () => {
  const extended = new Uint8Array(3000).fill(0x41);
  const make = (x: string) => jpegWithXmp(x, { extended });

  it("is one Custom field beside the main packet", async () => {
    const { result } = await strip(make, AI_TOOL_XMP, "photo.jpg", "image/jpeg", NONE);
    expect(asRows(result.report.fieldsFound).at(-1)).toEqual(["custom", "XMP:extended", "Extended XMP", "(3.0 KB)"]);
  });

  it("goes with the main packet, and takes it along when only Custom goes", async () => {
    for (const options of [only("ai"), only("custom")]) {
      const { result, out } = await strip(make, AI_TOOL_XMP, "photo.jpg", "image/jpeg", options);
      expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
      expect(out).not.toContain("xmp/extension");
      expect(out).not.toContain("trainedAlgorithmicMedia");
    }
  });
});

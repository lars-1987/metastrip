/** The XMP reader through its one entry point, on packets as text. The
 *  container tests (xmp-containers.test.ts) cover how each format finds the
 *  packet and drops it. */

import { describe, expect, it } from "vitest";
import type { MetadataCategory, MetadataField, StripOptions } from "./types";
import { ALL_ON } from "./contract-checks.fixture";
import { stripXmp } from "./xmp";
import { extractGpsCoordinates, parseXmpCoordinate } from "../gps";
import { LIGHTROOM_XMP } from "./xmp.fixture";

const NONE = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;
const only = (c: MetadataCategory): StripOptions => ({ ...NONE, [c]: true });
const rows = (packet: string) => stripXmp(packet, ALL_ON).fieldsFound.map((f) => [f.category, f.key, f.value]);

/** A packet around one rdf:Description's attributes and body. */
const packet = (attrs: string, body = "", ns = 'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmp="http://ns.adobe.com/xap/1.0/"') =>
  `<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">` +
  `<rdf:Description rdf:about="" ${ns} ${attrs}>${body}</rdf:Description></rdf:RDF></x:xmpmeta>`;

describe("reading", () => {
  it("names a property by its namespace, whatever prefix the packet uses", () => {
    // Older Adobe apps write the xmp namespace as "xap:".
    const old = packet('xap:CreatorTool="Photoshop 7.0"', "", 'xmlns:xap="http://ns.adobe.com/xap/1.0/"');
    expect(rows(old)).toEqual([["software", "XMP:xmp:CreatorTool", "Photoshop 7.0"]]);
  });

  it("reads structs written every way RDF allows", () => {
    const ns = 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#"';
    const body =
      // parseType="Resource" with child elements
      '<Iptc4xmpCore:CreatorContactInfo rdf:parseType="Resource"><Iptc4xmpCore:CiEmailWork>jane@example.com</Iptc4xmpCore:CiEmailWork></Iptc4xmpCore:CreatorContactInfo>' +
      // a nested rdf:Description
      '<xmpMM:DerivedFrom><rdf:Description stRef:documentID="xmp.did:0000"/></xmpMM:DerivedFrom>';
    expect(rows(packet("", body, ns))).toEqual([
      ["author", "XMP:Iptc4xmpCore:CreatorContactInfo", "jane@example.com"],
      ["custom", "XMP:xmpMM:DerivedFrom", "xmp.did:0000"],
    ]);
  });

  it("reads rdf:resource values, entities and CDATA", () => {
    const ns = 'xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:xmpRights="http://ns.adobe.com/xap/1.0/rights/"';
    const body =
      '<xmpRights:WebStatement rdf:resource="https://example.com/licence"/>' +
      "<dc:creator><rdf:Seq><rdf:li>Smith &amp; Jones</rdf:li></rdf:Seq></dc:creator>" +
      "<dc:title><rdf:Alt><rdf:li><![CDATA[<Untitled>]]></rdf:li></rdf:Alt></dc:title>";
    expect(rows(packet("", body, ns))).toEqual([
      ["copyright", "XMP:xmpRights:WebStatement", "https://example.com/licence"],
      ["author", "XMP:dc:creator", "Smith & Jones"],
      ["custom", "XMP:dc:title", "<Untitled>"],
    ]);
  });

  it("ignores what comes after the packet, such as GIF's binary trailer", () => {
    const trailer = String.fromCharCode(1, ...Array.from({ length: 256 }, (_, i) => 255 - i), 0);
    expect(rows(packet('xmp:CreatorTool="GIMP"') + trailer)).toEqual([["software", "XMP:xmp:CreatorTool", "GIMP"]]);
  });

  it("still reads a packet whose closing tags are missing", () => {
    const cut = packet('xmp:CreatorTool="GIMP"', "<dc:creator><rdf:Seq><rdf:li>Jane</rdf:li>").replace(/<\/rdf:Description>.*$/, "");
    expect(rows(cut)).toEqual([
      ["software", "XMP:xmp:CreatorTool", "GIMP"],
      ["author", "XMP:dc:creator", "Jane"],
    ]);
  });

  it("reads every top-level rdf:Description, listing a property once", () => {
    const two = packet('xmp:CreatorTool="GIMP"').replace(
      "</rdf:RDF>",
      '<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmp:CreatorTool="GIMP" xmp:CreateDate="2026-07-01"/></rdf:RDF>'
    );
    expect(rows(two)).toEqual([
      ["software", "XMP:xmp:CreatorTool", "GIMP"],
      ["dates", "XMP:xmp:CreateDate", "2026-07-01"],
    ]);
  });

  it("cuts a long value at 200 characters", () => {
    const [field] = stripXmp(packet(`dc:description="${"a".repeat(300)}"`), ALL_ON).fieldsFound;
    expect(field.value).toBe(`${"a".repeat(200)}…`);
  });

  it("finds the same fields whatever the options", () => {
    const all = stripXmp(LIGHTROOM_XMP, ALL_ON).fieldsFound;
    for (const options of [NONE, only("gps"), only("custom"), { ...ALL_ON, author: false }]) {
      expect(stripXmp(LIGHTROOM_XMP, options).fieldsFound).toEqual(all);
    }
  });
});

describe("categories", () => {
  const ns = 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:aux="http://ns.adobe.com/exif/1.0/aux/"';
  const one = (attrs: string): MetadataField => stripXmp(packet(attrs, "", ns), ALL_ON).fieldsFound[0];

  it("files only an AI source type under AI", () => {
    const camera = one('Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/digitalCapture"');
    expect([camera.category, camera.label]).toEqual(["custom", "XMP Digital Source Type"]);
    const edited = one('Iptc4xmpExt:DigitalSourceType="http://cv.iptc.org/newscodes/digitalsourcetype/compositeWithTrainedAlgorithmicMedia"');
    expect([edited.category, edited.label]).toEqual(["ai", "Edited with AI (IPTC digital source type)"]);
  });

  it("files a generation record in a description under AI", () => {
    expect(one('dc:description="a cat --ar 16:9 Job ID: 0f1e2d3c-aaaa-bbbb-cccc-123456789abc"').category).toBe("ai");
  });

  it("files every exif:GPS property under GPS, and EXIF mirrors by EXIF's table", () => {
    expect(one('exif:GPSMapDatum="WGS-84"').category).toBe("gps");
    expect(one('aux:OwnerName="Jane Doe"').category).toBe("device"); // EXIF's CameraOwnerName
    expect(one('exif:FNumber="18/10"').category).toBe("custom");
  });
});

describe("the long tail", () => {
  const settings = (n: number) =>
    packet(Array.from({ length: n }, (_, i) => `crs:S${i}="${i}"`).join(" "), "", 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"');

  it("lists twelve unknown properties, then counts the rest", () => {
    expect(stripXmp(settings(12), ALL_ON).fieldsFound).toHaveLength(12);
    const many = stripXmp(settings(40), ALL_ON).fieldsFound;
    expect(many).toHaveLength(13);
    expect(many.at(-1)).toMatchObject({ category: "custom", key: "XMP:more", value: "28 not shown" });
  });
});

describe("going", () => {
  it("goes when any listed category is removed, and takes every field with it", () => {
    const r = stripXmp(LIGHTROOM_XMP, only("gps"));
    expect(r.goes).toBe(true);
    expect(r.fieldsRemoved).toEqual(r.fieldsFound);
    expect(stripXmp(LIGHTROOM_XMP, only("comments")).goes).toBe(false);
  });

  it.each([
    ["no RDF at all", "<x:xmpmeta/>"],
    ["something that isn't XML", "\u0001\u0002 binary"],
    ["an empty description", packet("")],
  ])("is one field that goes with any XMP category for %s", (_, text) => {
    const r = stripXmp(text, only("dates"));
    expect(r.fieldsFound.map((f) => [f.category, f.key, f.value])).toEqual([["custom", "XMP", "(nothing readable)"]]);
    expect(r.goes).toBe(true);
    expect(stripXmp(text, only("comments")).goes).toBe(false);
  });

  it("is nothing at all when the packet is only zeroes", () => {
    expect(stripXmp("\0".repeat(64), ALL_ON)).toEqual({ fieldsFound: [], fieldsRemoved: [], goes: false });
  });
});

describe("XMP GPS on the map", () => {
  it.each([
    ["37,48.816S", -37.8136],
    ["144,57.786E", 144.9631],
    ["37,48,48.96S", -37.8136],
    ["0,30.0N", 0.5],
  ])("reads %s", (text, degrees) => {
    expect(parseXmpCoordinate(text)).toBeCloseTo(degrees, 4);
  });

  it.each(["37.8136", "37,48.816", "S37,48.816", ""])("refuses %j", (text) => {
    expect(parseXmpCoordinate(text)).toBeNull();
  });

  it("prefers EXIF's fix when a file has both", () => {
    const field = (key: string, value: string) => ({ category: "gps", key, label: key, value, removable: true }) as MetadataField;
    const both = [
      field("GPSLatitude", "1/1, 0/1, 0/1"),
      field("GPSLatitudeRef", "N"),
      field("GPSLongitude", "2/1, 0/1, 0/1"),
      field("GPSLongitudeRef", "E"),
      field("XMP:exif:GPSLatitude", "37,48.816S"),
      field("XMP:exif:GPSLongitude", "144,57.786E"),
    ];
    expect(extractGpsCoordinates(both)).toEqual({ lat: 1, lng: 2 });
  });
});

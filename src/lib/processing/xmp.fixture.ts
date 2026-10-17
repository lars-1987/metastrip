/** XMP packets for the tests, in the shapes real writers produce. Shared by
 *  the image and document fixtures, since XMP travels in both. */

/** 20 Camera Raw develop settings, which Lightroom writes as attributes on
 *  rdf:Description, so a packet has far more properties than anyone reads. */
const CRS_SETTINGS = Array.from({ length: 20 }, (_, i) => ` crs:Setting${i + 1}="${i * 5}"`).join("");

/** A photo after Lightroom and Photoshop: properties as attributes and as
 *  elements, rdf:Seq / Bag / Alt containers, location names, contact details,
 *  an edit history, linked documents, a GPS fix in XMP's own notation
 *  ("37,48.816S"), and a pile of develop settings. */
export const LIGHTROOM_XMP = [
  '<?xpacket begin="﻿" id="W5M0MpCehiHzreSzNTczkc9d"?>',
  '<x:xmpmeta xmlns:x="adobe:ns:meta/" x:xmptk="Adobe XMP Core 9.1-c002">',
  '<rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '<rdf:Description rdf:about=""',
  ' xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:tiff="http://ns.adobe.com/tiff/1.0/"',
  ' xmlns:exif="http://ns.adobe.com/exif/1.0/" xmlns:aux="http://ns.adobe.com/exif/1.0/aux/"',
  ' xmlns:exifEX="http://cipa.jp/exif/1.0/" xmlns:photoshop="http://ns.adobe.com/photoshop/1.0/"',
  ' xmlns:xmpMM="http://ns.adobe.com/xap/1.0/mm/" xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#"',
  ' xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" xmlns:dc="http://purl.org/dc/elements/1.1/"',
  ' xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/"',
  ' xmp:CreatorTool="Adobe Photoshop Lightroom Classic 13.0 (Macintosh)"',
  ' xmp:CreateDate="2026-07-01T12:00:00+10:00" xmp:ModifyDate="2026-07-02T09:30:00+10:00"',
  ' tiff:Make="Apple" tiff:Model="iPhone 15 Pro"',
  ' exif:GPSLatitude="37,48.816S" exif:GPSLongitude="144,57.786E" exif:DateTimeOriginal="2026-07-01T12:00:00+10:00"',
  ' aux:SerialNumber="SN-4821-TEST" exifEX:LensModel="iPhone 15 Pro back camera"',
  ' photoshop:City="Melbourne" photoshop:State="Victoria" photoshop:Country="Australia" photoshop:Credit="Jane Doe Photography"',
  ' xmpMM:DocumentID="xmp.did:0001" xmpMM:InstanceID="xmp.iid:0002" xmpMM:OriginalDocumentID="xmp.did:0001"',
  CRS_SETTINGS,
  ">",
  "<dc:creator><rdf:Seq><rdf:li>Jane Doe</rdf:li></rdf:Seq></dc:creator>",
  '<dc:rights><rdf:Alt><rdf:li xml:lang="x-default">(c) Jane Doe</rdf:li></rdf:Alt></dc:rights>',
  '<dc:title><rdf:Alt><rdf:li xml:lang="x-default">Flinders Street</rdf:li></rdf:Alt></dc:title>',
  '<dc:description><rdf:Alt><rdf:li xml:lang="x-default">Evening light</rdf:li></rdf:Alt></dc:description>',
  "<dc:subject><rdf:Bag><rdf:li>city</rdf:li><rdf:li>night</rdf:li></rdf:Bag></dc:subject>",
  '<Iptc4xmpCore:CreatorContactInfo Iptc4xmpCore:CiEmailWork="jane@example.com" Iptc4xmpCore:CiTelWork="+61 400 000 000"/>',
  "<Iptc4xmpCore:Location>Flinders Street Station</Iptc4xmpCore:Location>",
  "<xmpMM:History><rdf:Seq>",
  '<rdf:li stEvt:action="derived" stEvt:parameters="converted from image/x-apple-heic to image/jpeg"/>',
  '<rdf:li stEvt:action="saved" stEvt:instanceID="xmp.iid:0002" stEvt:when="2026-07-02T09:30:00+10:00" stEvt:softwareAgent="Adobe Photoshop 25.0 (Macintosh)" stEvt:changed="/"/>',
  "</rdf:Seq></xmpMM:History>",
  '<xmpMM:DerivedFrom stRef:instanceID="xmp.iid:0000" stRef:documentID="xmp.did:0000"/>',
  "<photoshop:DocumentAncestors><rdf:Bag><rdf:li>xmp.did:aaaa</rdf:li><rdf:li>xmp.did:bbbb</rdf:li></rdf:Bag></photoshop:DocumentAncestors>",
  "</rdf:Description></rdf:RDF></x:xmpmeta>",
  '<?xpacket end="w"?>',
].join("");

/** An AI generator's packet: IPTC's digital source type, the online C2PA
 *  manifest link, and the generator named as the creator tool. */
export const AI_TOOL_XMP = [
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#">',
  '<rdf:Description rdf:about="" xmlns:xmp="http://ns.adobe.com/xap/1.0/" xmlns:dcterms="http://purl.org/dc/terms/"',
  ' xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/"',
  ' xmp:CreatorTool="Adobe Firefly" dcterms:provenance="https://cai-manifests.adobe.com/manifests/test-0001">',
  "<Iptc4xmpExt:DigitalSourceType>http://cv.iptc.org/newscodes/digitalsourcetype/trainedAlgorithmicMedia</Iptc4xmpExt:DigitalSourceType>",
  "</rdf:Description></rdf:RDF></x:xmpmeta>",
].join("");

/** A packet with no properties: what an editor leaves after clearing them. */
export const EMPTY_XMP =
  '<x:xmpmeta xmlns:x="adobe:ns:meta/"><rdf:RDF xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"><rdf:Description rdf:about=""/></rdf:RDF></x:xmpmeta>';

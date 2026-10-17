/** How each container reads XMP today, pinned before one shared XMP reader
 *  replaces the five ways it's done now: one opaque field (JPEG, PNG, WebP),
 *  coarse sniffing (HEIC), and document/xmp.ts (GIF, PDF). "To change" notes
 *  the agreed new behaviour; "BUG" marks metadata a strip leaves in the file
 *  although its category was asked to go. */

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

async function strip(make: (xmp: string) => Uint8Array | Promise<Uint8Array>, xmp: string, name: string, type: string, options: StripOptions = ALL_ON) {
  const result = await processFile(new File([new Uint8Array(await make(xmp))], name, { type }), options);
  expect(result.error).toBeUndefined();
  const out = new TextDecoder("latin1").decode(new Uint8Array(await result.cleanedBlob.arrayBuffer()));
  return { result, out };
}

/** document/xmp.ts's reading of the Lightroom packet, in GIF and PDF. Only
 *  element-form properties it doesn't know reach the list, so the GPS fix,
 *  serial number and city (attributes, as Lightroom writes them) are missing,
 *  as are the history and linked documents. */
const XMP_TS_LIGHTROOM = [
  "author:XMP:dc:creator",
  "author:XMP:dc:description",
  "author:XMP:dc:title",
  "copyright:XMP:dc:rights",
  "copyright:XMP:photoshop:Credit",
  "custom:XMP:Iptc4xmpCore:Location",
  "custom:XMP:dc:subject",
  "custom:XMP:xmpMM:DocumentID",
  "custom:XMP:xmpMM:InstanceID",
  "custom:XMP:xmpMM:OriginalDocumentID",
  "dates:XMP:xmp:CreateDate",
  "dates:XMP:xmp:ModifyDate",
  "device:XMP:tiff:Make",
  "device:XMP:tiff:Model",
  "software:XMP:xmp:CreatorTool",
];

const CONTAINERS = [
  {
    label: "JPEG", name: "photo.jpg", type: "image/jpeg", make: jpegWithXmp,
    // One field for the whole packet: GPS, serial and contact details inside.
    lightroom: ["custom:XMP"], ai: ["ai:XMP"], empty: ["custom:XMP"],
  },
  {
    label: "PNG", name: "shot.png", type: "image/png", make: pngWithXmp,
    lightroom: ["custom:XML:com.adobe.xmp"], ai: ["ai:XML:com.adobe.xmp"], empty: ["custom:XML:com.adobe.xmp"],
  },
  {
    label: "WebP", name: "pic.webp", type: "image/webp", make: webpWithXmp,
    // Its patterns only match element form, so nothing beyond the packet.
    lightroom: ["custom:XMP"], ai: ["ai:XMP"], empty: ["custom:XMP"],
  },
  {
    label: "GIF", name: "anim.gif", type: "image/gif", make: gifWithXmp,
    // No AI detection: the source type is Custom and Firefly is Software.
    lightroom: XMP_TS_LIGHTROOM, ai: ["custom:XMP:Iptc4xmpExt:DigitalSourceType", "software:XMP:xmp:CreatorTool"], empty: ["custom:XMP"],
  },
  {
    label: "HEIC", name: "IMG_0001.HEIC", type: "image/heic", make: heicWithXmp,
    // Coarse sniffing: one "present" field per category it spots.
    lightroom: [
        "author:xmp:creator",
        "copyright:xmp:rights",
        "dates:xmp:dates",
        "device:xmp:device",
        "gps:xmp:gps",
      ],
    ai: ["ai:xmp:ai"], empty: ["custom:xmp"],
  },
  {
    label: "PDF", name: "doc.pdf", type: "application/pdf", make: pdfWithXmp,
    lightroom: XMP_TS_LIGHTROOM, ai: ["custom:XMP:Iptc4xmpExt:DigitalSourceType", "software:XMP:xmp:CreatorTool"], empty: ["custom:XMP"],
  },
] as const;

describe.each(CONTAINERS.map((c) => [c.label, c] as const))("%s XMP", (_, fmt) => {
  it("lists a Lightroom packet", async () => {
    // To change: every property, by the shared category table.
    const { result } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type);
    expect(summary(result.report.fieldsFound)).toEqual([...fmt.lightroom]);
  });

  it("lists an AI generator's packet", async () => {
    const { result } = await strip(fmt.make, AI_TOOL_XMP, fmt.name, fmt.type);
    expect(summary(result.report.fieldsFound)).toEqual([...fmt.ai]);
  });

  it("lists an empty packet as one field", async () => {
    const { result } = await strip(fmt.make, EMPTY_XMP, fmt.name, fmt.type);
    expect(summary(result.report.fieldsFound)).toEqual([...fmt.empty]);
  });

  it("never puts the XMP GPS fix on the map", async () => {
    // To change: XMP's "37,48.816S" notation reaches the map.
    const { result } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type);
    expect(extractGpsCoordinates(result.report.fieldsFound)).toBeNull();
  });

  it("removes the packet whole when everything goes", async () => {
    const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type);
    expect(summary(result.report.fieldsRemoved)).toEqual(summary(result.report.fieldsFound));
    expect(out).not.toContain("37,48.816S");
  });
});

describe("removing only GPS", () => {
  it.each(CONTAINERS.filter((c) => c.label !== "HEIC").map((c) => [c.label, c] as const))(
    "%s: leaves the XMP GPS fix in the file",
    async (_, fmt) => {
      // BUG: no listed field is GPS, so the packet stays, fix and all.
      const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, only("gps"));
      expect(result.report.fieldsRemoved).toEqual([]);
      expect(out).toContain("37,48.816S");
    }
  );

  it("HEIC: removes it, having sniffed a GPS field", async () => {
    const fmt = CONTAINERS.find((c) => c.label === "HEIC")!;
    const { out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, only("gps"));
    expect(out).not.toContain("37,48.816S");
  });
});

describe("removing only AI", () => {
  it.each(CONTAINERS.filter((c) => c.label === "GIF" || c.label === "PDF").map((c) => [c.label, c] as const))(
    "%s: leaves the AI marker in the file",
    async (_, fmt) => {
      // BUG: nothing in the packet is filed under AI.
      const { out } = await strip(fmt.make, AI_TOOL_XMP, fmt.name, fmt.type, only("ai"));
      expect(out).toContain("trainedAlgorithmicMedia");
    }
  );

  it.each(CONTAINERS.filter((c) => c.label !== "GIF" && c.label !== "PDF").map((c) => [c.label, c] as const))(
    "%s: removes it",
    async (_, fmt) => {
      const { out } = await strip(fmt.make, AI_TOOL_XMP, fmt.name, fmt.type, only("ai"));
      expect(out).not.toContain("trainedAlgorithmicMedia");
    }
  );
});

describe("keeping Custom", () => {
  it.each(CONTAINERS.filter((c) => ["JPEG", "PNG", "WebP"].includes(c.label)).map((c) => [c.label, c] as const))(
    "%s: keeps the whole Lightroom packet, GPS, serial and contact details included",
    async (_, fmt) => {
      // BUG: the packet is one Custom field, so keeping Custom keeps it all
      // while GPS, Device and Author are being removed.
      const { result, out } = await strip(fmt.make, LIGHTROOM_XMP, fmt.name, fmt.type, { ...ALL_ON, custom: false });
      expect(summary(result.report.fieldsKept)).toEqual([...fmt.lightroom]);
      expect(out).toContain("37,48.816S");
      expect(out).toContain("SN-4821-TEST");
      expect(out).toContain("jane@example.com");
    }
  );
});

/** The EXIF reader through its one entry point, on raw TIFF blocks. The
 *  container tests (exif-containers.test.ts) cover how each format finds the
 *  block and puts it back. */

import { describe, expect, it } from "vitest";
import type { MetadataCategory, MetadataField, StripOptions } from "../types";
import { ALL_ON } from "../contract-checks.fixture";
import { stripExif } from "./exif";
import {
  ASCII, BYTE, LONG, MAKER_NOTE_SERIAL, RATIONAL, SHORT, SRATIONAL, THUMBNAIL_JPEG, UNDEFINED,
  phoneExif, tiff, ucs2, type TiffEntry, type TiffSpec,
} from "./exif.fixture";

const NONE = Object.fromEntries(Object.keys(ALL_ON).map((c) => [c, false])) as unknown as StripOptions;
const only = (...cats: MetadataCategory[]): StripOptions => ({ ...NONE, ...Object.fromEntries(cats.map((c) => [c, true])) });
const keys = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`);
const latin1 = (b: Uint8Array) => new TextDecoder("latin1").decode(b);
const found = (block: Uint8Array) => stripExif(block, ALL_ON).fieldsFound;

const MAKE: TiffEntry = { tag: 0x010f, type: ASCII, value: "Apple" };
const ARTIST: TiffEntry = { tag: 0x013b, type: ASCII, value: "Jane Doe" };
const ORIENTATION_6: TiffEntry = { tag: 0x0112, type: SHORT, value: [6] };

describe("reading", () => {
  it("reads big- and little-endian blocks the same", () => {
    const spec: TiffSpec = { ifd0: [MAKE, ARTIST], exif: [{ tag: 0x829d, type: RATIONAL, value: [178, 100] }] };
    const big = found(tiff(spec));
    expect(found(tiff({ ...spec, littleEndian: true }))).toEqual(big);
    expect(big.map((f) => f.value)).toEqual(["Apple", "Jane Doe", "178/100"]);
  });

  it("shows each value type the way a person reads it", () => {
    const block = tiff({
      littleEndian: true,
      ifd0: [
        { tag: 0x013b, type: ASCII, value: "Zoë" }, // Artist, written as UTF-8 by phones
        { tag: 0x9c9c, type: BYTE, value: ucs2("Nice light") }, // XPComment
      ],
      exif: [
        { tag: 0x9204, type: SRATIONAL, value: [-1, 3] }, // ExposureBiasValue
        { tag: 0x8827, type: SHORT, value: [100, 200] }, // ISOSpeedRatings, two values
      ],
    });
    // "Zoë" goes in as UTF-8 bytes through the fixture's Latin-1 writer.
    const utf8 = tiff({ littleEndian: true, ifd0: [{ tag: 0x013b, type: ASCII, value: latin1(new TextEncoder().encode("Zoë")) }] });
    expect(found(utf8)[0].value).toBe("Zoë");
    expect(found(block).map((f) => [f.key, f.value])).toEqual([
      ["Artist", "Zoë"],
      ["XPComment", "Nice light"],
      ["ISOSpeedRatings", "100, 200"],
      ["ExposureBiasValue", "-1/3"],
    ]);
  });

  it("lists a tag the specifications don't name, under Custom", () => {
    // piexif dropped these silently: never listed, yet kept by a partial strip.
    const block = tiff({ ifd0: [MAKE, { tag: 0xbeef, type: UNDEFINED, value: "vendor" }] });
    expect(found(block).map((f) => [f.category, f.key, f.label])).toEqual([
      ["device", "Make", "Make"],
      ["custom", "Unknown_0th_48879", "Unknown tag 0xbeef"],
    ]);
  });

  it("knows the tags EXIF added after piexif's table, the time zone among them", () => {
    // Every iPhone writes OffsetTime; unknown, it would have been Custom and
    // stayed while Dates was removed.
    const block = tiff({ ifd0: [], exif: [{ tag: 0x9011, type: ASCII, value: "+10:00" }] });
    expect(found(block).map((f) => [f.category, f.key, f.value])).toEqual([["dates", "OffsetTimeOriginal", "+10:00"]]);
  });

  it("shows a maker note by its size, since its bytes read as noise", () => {
    const block = tiff({ ifd0: [], exif: [{ tag: 0x927c, type: UNDEFINED, value: new Uint8Array(1229) }] });
    expect(found(block).map((f) => [f.category, f.value])).toEqual([["device", "1.2 KB of vendor data"]]);
  });

  it("names an Exif tag a camera put in IFD0", () => {
    const block = tiff({ ifd0: [{ tag: 0xa403, type: SHORT, value: [0] }] }); // WhiteBalance
    expect(keys(found(block))).toEqual(["custom:WhiteBalance"]);
  });

  it("files a generation record in UserComment under AI, decoded", () => {
    // AUTOMATIC1111's way: the "UNICODE" character code, then UTF-16BE.
    const text = "a cat\nSteps: 20, Sampler: Euler a, CFG scale: 7, Seed: 1";
    const value = [..."UNICODE\0"].map((c) => c.charCodeAt(0)).concat([...text].flatMap((c) => [0, c.charCodeAt(0)]));
    const [field] = found(tiff({ ifd0: [], exif: [{ tag: 0x9286, type: UNDEFINED, value }] }));
    expect(field.category).toBe("ai");
    expect(field.value).toBe(text);
  });

  it("finds the same fields whatever the options", () => {
    const all = found(phoneExif());
    for (const options of [NONE, only("gps"), only("custom"), { ...ALL_ON, device: false }]) {
      expect(stripExif(phoneExif(), options).fieldsFound).toEqual(all);
    }
  });
});

describe("stripping in place", () => {
  it("hands back the input itself when nothing goes", () => {
    const block = phoneExif();
    expect(stripExif(block, NONE).cleaned).toBe(block);
    expect(stripExif(block, only("comments")).cleaned).toBe(block);
  });

  it("keeps the block's size and leaves only what was kept", () => {
    const block = phoneExif();
    const { cleaned, fieldsRemoved } = stripExif(block, only("gps", "device"));
    expect(cleaned!.length).toBe(block.length);
    expect(keys(fieldsRemoved)).toEqual([
      "device:Make", "device:Model", "device:MakerNote", "device:LensModel",
      "gps:GPSVersionID", "gps:GPSLatitudeRef", "gps:GPSLatitude", "gps:GPSLongitudeRef",
      "gps:GPSLongitude", "gps:GPSAltitudeRef", "gps:GPSAltitude",
    ]);
    const again = found(cleaned!);
    expect(keys(again)).toEqual(keys(found(block)).filter((k) => !k.startsWith("gps:") && !k.startsWith("device:")));
    // Removed values are zeroed, not just unlinked.
    expect(latin1(cleaned!)).not.toContain("iPhone");
    expect(latin1(cleaned!)).not.toContain(MAKER_NOTE_SERIAL);
  });

  it("leaves a kept maker note byte for byte where it was", () => {
    const block = phoneExif();
    const at = latin1(block).indexOf("Apple iOS");
    const { cleaned } = stripExif(block, only("gps", "dates"));
    expect(latin1(cleaned!.subarray(at, at + 22))).toBe(`Apple iOS\0${MAKER_NOTE_SERIAL}`);
  });

  it("removes an emptied IFD with its pointer", () => {
    // GPS is the only thing in its IFD; once it goes, nothing points at it.
    const { cleaned } = stripExif(phoneExif(), only("gps"));
    const view = new DataView(cleaned!.buffer);
    const ifd0 = view.getUint32(4, true);
    const tags = Array.from({ length: view.getUint16(ifd0, true) }, (_, i) => view.getUint16(ifd0 + 2 + 12 * i, true));
    expect(tags).not.toContain(0x8825);
    expect(tags).toContain(0x8769); // the Exif IFD still has fields
  });

  it("removes the thumbnail and IFD1 with Custom", () => {
    const { cleaned } = stripExif(phoneExif(), only("custom"));
    const view = new DataView(cleaned!.buffer);
    const ifd0 = view.getUint32(4, true);
    expect(view.getUint32(ifd0 + 2 + 12 * view.getUint16(ifd0, true), true)).toBe(0); // no IFD1
    expect(latin1(cleaned!)).not.toContain(latin1(THUMBNAIL_JPEG));
    expect(keys(found(cleaned!))).not.toContain("custom:Thumbnail");
  });

  it("keeps the thumbnail when Custom is kept", () => {
    const { cleaned } = stripExif(phoneExif(), { ...ALL_ON, custom: false });
    expect(latin1(cleaned!)).toContain(latin1(THUMBNAIL_JPEG));
  });

  it("keeps a value a removed tag shared with a kept one", () => {
    // Two tags pointing at the same bytes: removing one must not zero the other.
    const block = tiff({ ifd0: [MAKE, { tag: 0x013b, type: ASCII, value: "Jane Doe Photography" }, { tag: 0x8298, type: ASCII, value: "Jane Doe Photography" }] });
    const view = new DataView(block.buffer);
    const artistValue = view.getUint32(8 + 2 + 12 * 1 + 8); // Artist's value offset
    view.setUint32(8 + 2 + 12 * 2 + 8, artistValue); // Copyright points there too
    const { cleaned } = stripExif(block, only("author"));
    expect(found(cleaned!).map((f) => [f.key, f.value])).toEqual([
      ["Make", "Apple"],
      ["Copyright", "Jane Doe Photography"],
    ]);
  });
});

describe("Orientation", () => {
  it("is never a field, and stays through a partial strip", () => {
    const block = tiff({ littleEndian: true, ifd0: [MAKE, ORIENTATION_6, ARTIST] });
    expect(keys(found(block))).toEqual(["device:Make", "author:Artist"]);
    const { cleaned } = stripExif(block, only("device"));
    const view = new DataView(cleaned!.buffer);
    // Make's entry gone; Orientation and Artist move up.
    expect(view.getUint16(8, true)).toBe(2);
    expect(view.getUint16(8 + 2, true)).toBe(0x0112);
    expect(view.getUint16(8 + 2 + 12, true)).toBe(0x013b);
  });

  it("is all that's left after a full strip of a rotated photo", () => {
    for (const littleEndian of [true, false]) {
      const { cleaned } = stripExif(tiff({ littleEndian, ifd0: [MAKE, ORIENTATION_6] }), ALL_ON);
      expect(cleaned!.length).toBe(26);
      expect(found(cleaned!)).toEqual([]);
      const view = new DataView(cleaned!.buffer);
      expect(view.getUint16(18, littleEndian)).toBe(6);
    }
  });

  it("leaves nothing after a full strip of an upright photo", () => {
    expect(stripExif(tiff({ ifd0: [MAKE, { tag: 0x0112, type: SHORT, value: [1] }] }), ALL_ON).cleaned).toBeNull();
    expect(stripExif(tiff({ ifd0: [MAKE] }), ALL_ON).cleaned).toBeNull();
  });

  it("leaves a block holding only orientation untouched", () => {
    const block = tiff({ ifd0: [ORIENTATION_6] });
    expect(stripExif(block, ALL_ON)).toEqual({ fieldsFound: [], fieldsRemoved: [], cleaned: block });
  });
});

describe("a block that can't be walked", () => {
  const field = (n: number) => ({ category: "custom", key: "EXIF", label: "EXIF data that couldn't be read", value: `(${n} bytes)`, removable: true });

  it.each([
    ["a bad byte-order mark", () => { const b = tiff({ ifd0: [MAKE] }); b[0] = 0x58; return b; }],
    ["a first IFD past the end", () => { const b = tiff({ ifd0: [MAKE] }); b.set([0, 0, 0xff, 0xff], 4); return b; }],
    ["a value past the end", () => { const b = tiff({ ifd0: [ARTIST] }); b.set([0, 0, 0xff, 0x00], 8 + 2 + 8); return b; }],
    ["a type TIFF doesn't define", () => { const b = tiff({ ifd0: [MAKE] }); b.set([0, 99], 8 + 2 + 2); return b; }],
    ["an IFD that points back at itself", () => {
      // The Exif IFD pointer (tag 0x8769) is IFD0's second entry: aim it at IFD0.
      const b = tiff({ ifd0: [MAKE], exif: [{ tag: 0x9003, type: ASCII, value: "2026:07:01 12:00:00" }] });
      b.set([0, 0, 0, 8], 8 + 2 + 12 + 8);
      return b;
    }],
    ["a truncated block", () => tiff({ ifd0: [MAKE, ARTIST] }).slice(0, 20)],
  ])("is one field when it has %s", (_, make) => {
    const block = make();
    expect(stripExif(block, ALL_ON)).toEqual({ fieldsFound: [field(block.length)], fieldsRemoved: [field(block.length)], cleaned: null });
  });

  it("goes when any category EXIF can hold is removed, Custom kept or not", () => {
    const block = tiff({ ifd0: [MAKE] }).slice(0, 12);
    for (const c of ["gps", "device", "dates", "author", "software", "copyright", "custom", "ai"] as MetadataCategory[]) {
      expect(stripExif(block, only(c)).cleaned, c).toBeNull();
    }
  });

  it("stays when only comments are removed", () => {
    const block = tiff({ ifd0: [MAKE] }).slice(0, 12);
    expect(stripExif(block, only("comments"))).toEqual({ fieldsFound: [field(12)], fieldsRemoved: [], cleaned: block });
  });
});

it("reads values stored inline and out of line", () => {
  // ImageWidth fits in its entry; BitsPerSample's three SHORTs (6 bytes) don't.
  const block = tiff({ ifd0: [{ tag: 0x0100, type: LONG, value: [4032] }, { tag: 0x0102, type: SHORT, value: [8, 8, 8] }] });
  expect(found(block).map((f) => [f.key, f.value])).toEqual([
    ["ImageWidth", "4032"],
    ["BitsPerSample", "8, 8, 8"],
  ]);
});

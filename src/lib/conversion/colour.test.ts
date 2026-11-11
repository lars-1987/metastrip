/** Picking the JPG's colour space from the source, and converting P3 pixels
 *  to sRGB where the browser can't hold P3. */

import { deflateSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { box, concat, u16be, u32be, webpFromChunks } from "../processing/image/image-files.fixture";
import { iccIsWide, sourceColour } from "./colour";
import { p3ToSrgb } from "./p3";
import { jpgName } from "./convert";

/* ── Sources ───────────────────────────────────────────────────────── */

/** An RGB ICC profile with one tag, its red primary. Real profiles put
 *  sRGB's red at X 0.436 and Display P3's at 0.515. */
function icc(redX: number): Uint8Array {
  const header = new Uint8Array(128);
  header.set([..."RGB "].map((c) => c.charCodeAt(0)), 16);
  const s15 = (v: number) => u32be(Math.round(v * 65536) >>> 0);
  return concat(header, u32be(1), "rXYZ", u32be(144), u32be(20), "XYZ ", u32be(0), s15(redX), s15(0.24), s15(0));
}
const P3 = icc(0.5151);
const SRGB = icc(0.4361);

const heicWithColr = (...colr: Uint8Array[]) =>
  concat(
    box("ftyp", "heic", u32be(0), "mif1"),
    box("meta", [0, 0, 0, 0], box("iprp", box("ipco", ...colr.map((c) => box("colr", c)))))
  );
const nclx = (primaries: number) => concat("nclx", u16be(primaries), u16be(13), u16be(6), [0x80]);

const jpegWithIcc = (profile: Uint8Array) => {
  const payload = concat("ICC_PROFILE\0", [1, 1], profile);
  return concat([0xff, 0xd8], [0xff, 0xe2], u16be(payload.length + 2), payload, [0xff, 0xda, 0, 2], [0xff, 0xd9]);
};

const pngChunk = (type: string, data: Uint8Array) => concat(u32be(data.length), type, data, u32be(0));
const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const pngWith = (...chunks: Uint8Array[]) => concat(PNG, ...chunks, pngChunk("IDAT", new Uint8Array(2)), pngChunk("IEND", new Uint8Array(0)));
const iCCP = (profile: Uint8Array) => pngChunk("iCCP", concat("Display P3\0", [0], deflateSync(profile)));
const cICP = (primaries: number) => pngChunk("cICP", Uint8Array.of(primaries, 13, 0, 1));

const webpWithIcc = (profile: Uint8Array) => {
  const le = (n: number) => [n & 0xff, (n >>> 8) & 0xff, (n >>> 16) & 0xff, (n >>> 24) & 0xff];
  return webpFromChunks(concat("ICCP", le(profile.length), profile, profile.length % 2 ? [0] : []));
};

describe("iccIsWide", () => {
  it("tells Display P3 from sRGB by the red primary", () => {
    expect(iccIsWide(P3)).toBe(true);
    expect(iccIsWide(SRGB)).toBe(false);
  });

  it("counts profiles it can't read as sRGB", () => {
    expect(iccIsWide(new Uint8Array(20))).toBe(false);
    const grey = P3.slice();
    grey.set([..."GRAY"].map((c) => c.charCodeAt(0)), 16);
    expect(iccIsWide(grey)).toBe(false);
  });
});

describe("sourceColour", () => {
  it.each([
    ["an HEIC with a Display P3 profile", heicWithColr(concat("prof", P3)), "heic", "display-p3"],
    ["an HEIC with P3 CICP numbers", heicWithColr(nclx(12)), "heic", "display-p3"],
    ["an HEIC with sRGB CICP numbers", heicWithColr(nclx(1)), "heic", "srgb"],
    ["an HEIC whose grid is P3 after an sRGB tile", heicWithColr(nclx(1), concat("prof", P3)), "heic", "display-p3"],
    ["an HEIC with no colour box", heicWithColr(), "heic", "srgb"],
    ["a JPG with a P3 profile", jpegWithIcc(P3), "jpeg", "display-p3"],
    ["a JPG with an sRGB profile", jpegWithIcc(SRGB), "jpeg", "srgb"],
    ["a WebP with a P3 profile", webpWithIcc(P3), "webp", "display-p3"],
    ["a PNG with a compressed P3 profile", pngWith(iCCP(P3)), "png", "display-p3"],
    ["a PNG with an sRGB profile", pngWith(iCCP(SRGB)), "png", "srgb"],
    ["a PNG whose CICP numbers say P3", pngWith(cICP(12)), "png", "display-p3"],
    ["a PNG whose CICP numbers overrule its profile", pngWith(iCCP(P3), cICP(1)), "png", "srgb"],
    ["an untagged PNG", pngWith(), "png", "srgb"],
    ["a GIF", concat("GIF89a"), "gif", "srgb"],
  ] as const)("%s", async (_, bytes, format, expected) => {
    expect(await sourceColour(bytes, format)).toBe(expected);
  });

  it("never throws: a broken profile is sRGB", async () => {
    const broken = pngWith(pngChunk("iCCP", concat("x\0", [0], [1, 2, 3])));
    expect(await sourceColour(broken, "png")).toBe("srgb");
    expect(await sourceColour(new Uint8Array(3), "heic")).toBe("srgb");
  });
});

/* ── P3 to sRGB ────────────────────────────────────────────────────── */

const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** sRGB to Display P3 the other way round, from the published sRGB-to-P3
 *  matrix: an independent check on the converter's. */
function srgbToP3([r, g, b]: number[]): number[] {
  const [R, G, B] = [r, g, b].map((v) => toLinear(v / 255));
  return [
    0.8224621 * R + 0.177538 * G,
    0.0331941 * R + 0.9668058 * G,
    0.0170827 * R + 0.0723974 * G + 0.9105199 * B,
  ].map((v) => Math.round(fromLinear(v) * 255));
}

describe("p3ToSrgb", () => {
  // Within one step, except a channel that should be 0: there an 8-bit P3
  // value can only get within 3, because sRGB's curve is steepest near black
  // (pure green comes back as 3, 255, 0; a difference no one can see).
  it("brings sRGB colours stored as P3 back to within a step of themselves", () => {
    const colours = [[255, 0, 0], [0, 255, 0], [0, 0, 255], [200, 120, 40], [12, 90, 180], [255, 255, 255], [0, 0, 0], [128, 128, 128]];
    const pixels = new Uint8ClampedArray(colours.flatMap((c) => [...srgbToP3(c), 77]));
    p3ToSrgb(pixels);
    colours.forEach((c, i) => {
      for (let k = 0; k < 3; k++) expect(Math.abs(pixels[i * 4 + k] - c[k])).toBeLessThanOrEqual(c[k] === 0 ? 3 : 1);
      expect(pixels[i * 4 + 3]).toBe(77); // alpha untouched
    });
  });

  it("clips P3 colours sRGB can't show to its edge", () => {
    const pixels = new Uint8ClampedArray([255, 0, 0, 255]);
    p3ToSrgb(pixels);
    expect([...pixels]).toEqual([255, 0, 0, 255]);
  });
});

describe("jpgName", () => {
  it.each([
    ["IMG_0001.HEIC", "IMG_0001.jpg"],
    ["holiday.photo.png", "holiday.photo.jpg"],
    ["noext", "noext.jpg"],
    [".hidden", ".hidden.jpg"],
  ])("%s → %s", (name, expected) => expect(jpgName(name)).toBe(expected));
});

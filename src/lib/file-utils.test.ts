import { describe, expect, it } from "vitest";
import {
  detectFileType,
  getFileCategory,
  getFileTypeLabel,
  isAcceptedForUpload,
  sniffFormat,
} from "./file-utils";
import { ACCEPTED_TYPES } from "./constants";
import { HEADER_CASES } from "./processing/format-headers.fixture";

/* Characterisation tests: they pin how format identification behaves today,
   quirks included, so the format registry that replaces these functions can
   show exactly which rows it keeps and which it changes on purpose. */

const fileOf = (c: { name: string; mime: string; head: Uint8Array }) =>
  new File([c.head as BlobPart], c.name, { type: c.mime });

describe("sniffFormat", () => {
  it.each(HEADER_CASES)("$label", (c) => {
    expect(sniffFormat(c.head)).toBe(c.today.sniff);
  });
});

describe("detectFileType", () => {
  it.each(HEADER_CASES)("$label", (c) => {
    expect(detectFileType(fileOf(c))).toBe(c.today.detect);
  });
});

describe("isAcceptedForUpload", () => {
  const accepted = (name: string, mime: string) =>
    isAcceptedForUpload(new File([], name, { type: mime }), ACCEPTED_TYPES);

  it("accepts a listed MIME type", () => {
    expect(accepted("photo.jpg", "image/jpeg")).toBe(true);
  });

  it("accepts HEIC and AVIF by extension when the MIME type is empty", () => {
    expect(accepted("IMG_0001.HEIC", "")).toBe(true);
    expect(accepted("pic.avif", "")).toBe(true);
  });

  // The rows below are the drop-time quirks the registry is meant to change.
  it("turns TIFF away before its 'not supported yet' message can show", () => {
    expect(accepted("scan.tif", "image/tiff")).toBe(false);
  });

  it("turns away a DOCX with no MIME type", () => {
    expect(accepted("letter.docx", "")).toBe(false);
  });
});

describe("getFileCategory", () => {
  it.each([
    ["jpeg", "image"],
    ["tiff", "image"],
    ["pdf", "document"],
    ["docx", "document"],
    ["mov", "video"],
    ["m4a", "audio"],
    ["wav", "audio"],
  ] as const)("%s is %s", (type, category) => {
    expect(getFileCategory(type)).toBe(category);
  });
});

describe("getFileTypeLabel", () => {
  it.each([
    ["image/jpeg", "JPEG"],
    ["video/x-m4v", "M4V"],
    ["audio/aac", "AAC"],
    // Unlisted types fall back to the MIME subtype.
    ["image/tiff", "TIFF"],
    // A HEIC with no MIME type reads as "FILE".
    ["", "FILE"],
  ])("%j reads as %s", (mime, label) => {
    expect(getFileTypeLabel(mime)).toBe(label);
  });
});

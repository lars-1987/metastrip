import { describe, expect, it } from "vitest";
import {
  ACCEPT_ATTRIBUTE,
  SUPPORTED_FORMATS,
  categoryOf,
  identify,
  labelOf,
  notSupportedYet,
  type Format,
} from "./formats";
import { HEADER_CASES } from "./format-headers.fixture";
import { detectFileType, getFileCategory } from "../file-utils";
import { ACCEPTED_TYPES } from "../constants";

const fileOf = (c: { name: string; mime: string; head: Uint8Array }) =>
  new File([c.head as BlobPart], c.name, { type: c.mime });

const formatOf = async (file: File) => {
  const id = await identify(file);
  return id.status === "unknown" ? "unknown" : id.format;
};

describe("identify", () => {
  it.each(HEADER_CASES)("$label", async (c) => {
    expect(await formatOf(fileOf(c))).toBe(c.identify);
  });

  it("changes today's answer only where we decided it should", async () => {
    // Today the coordinator trusts the bytes and falls back to MIME, then
    // extension (HEIC and AVIF only).
    const changed = [];
    for (const c of HEADER_CASES) {
      const today = c.today.sniff ?? c.today.detect ?? "unknown";
      if ((await formatOf(fileOf(c))) !== today) changed.push(c.label);
    }
    expect(changed).toEqual([
      "M4A", // the M4A brand is audio, not an MP4 video
      "DOCX with no MIME type", // every registered extension is a fallback
    ]);
  });

  it("agrees with today's MIME table when the bytes say nothing", async () => {
    for (const mime of [...ACCEPTED_TYPES, "image/tiff"]) {
      const file = new File([], "file", { type: mime });
      expect(await formatOf(file), mime).toBe(detectFileType(file));
    }
  });

  it("falls back to MIME type and extension when the bytes can't be read", async () => {
    const file = new File([], "IMG_0001.HEIC", { type: "" });
    file.slice = () =>
      ({ arrayBuffer: () => Promise.reject(new DOMException("gone", "NotReadableError")) }) as unknown as Blob;
    expect(await identify(file)).toEqual({ status: "supported", format: "heic" });
  });

  it("marks supported, recognised and unknown files", async () => {
    const jpeg = HEADER_CASES.find((c) => c.label === "JPEG")!;
    const tiff = HEADER_CASES.find((c) => c.label === "TIFF, little-endian")!;
    const text = HEADER_CASES.find((c) => c.label === "Plain text")!;
    expect(await identify(fileOf(jpeg))).toEqual({ status: "supported", format: "jpeg" });
    expect(await identify(fileOf(tiff))).toEqual({ status: "recognised", format: "tiff" });
    expect(await identify(fileOf(text))).toEqual({ status: "unknown" });
  });
});

describe("notSupportedYet", () => {
  it("names recognised formats", () => {
    expect(notSupportedYet([
      { status: "recognised", format: "tiff" },
      { status: "recognised", format: "tiff" },
    ])).toBe("TIFF files aren't supported yet.");
    expect(notSupportedYet([
      { status: "recognised", format: "tiff" },
      { status: "recognised", format: "bmp" },
    ])).toBe("TIFF and BMP files aren't supported yet.");
  });

  it("stays general when any file is unknown", () => {
    expect(notSupportedYet([{ status: "recognised", format: "tiff" }, { status: "unknown" }]))
      .toBe("Those file types aren't supported yet.");
  });
});

describe("labelOf", () => {
  it.each([
    ["jpeg", "JPEG"],
    ["webp", "WebP"],
    ["heic", "HEIC"],
    ["mp4", "MP4"], // was "M4V" for a video/x-m4v file
    ["m4a", "M4A"], // was "AAC" for an audio/aac file
    ["tiff", "TIFF"],
  ] as const)("%s reads as %s", (format, label) => {
    expect(labelOf(format)).toBe(label);
  });

  it("names a HEIC that arrives with no MIME type", async () => {
    const c = HEADER_CASES.find((c) => c.label === "HEIC with no MIME type")!;
    expect(labelOf((await formatOf(fileOf(c))) as Format)).toBe("HEIC"); // was "FILE"
  });
});

describe("categoryOf", () => {
  it("agrees with today's categories", () => {
    for (const format of [...SUPPORTED_FORMATS, "tiff"] as const) {
      expect(categoryOf(format), format).toBe(getFileCategory(format));
    }
  });
});

describe("SUPPORTED_FORMATS", () => {
  it("lists formats in the order the dropzone shows them", () => {
    expect(SUPPORTED_FORMATS).toEqual([
      "jpeg", "png", "webp", "gif", "heic", "avif",
      "pdf", "docx", "xlsx", "pptx",
      "mp4", "mov",
      "mp3", "m4a", "flac", "wav",
    ]);
  });
});

describe("ACCEPT_ATTRIBUTE", () => {
  const accepted = ACCEPT_ATTRIBUTE.split(",");

  it("covers everything the dropzone accepts today", () => {
    for (const entry of [...ACCEPTED_TYPES, ".heic", ".heif", ".avif"]) {
      expect(accepted, entry).toContain(entry);
    }
  });

  it("lets recognised formats through the picker so they get a clear message", () => {
    expect(accepted).toContain("image/tiff");
    expect(accepted).toContain(".tif");
  });
});

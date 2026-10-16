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

  it.each([
    ["image/heif-sequence", "heic"],
    ["video/x-m4v", "mp4"],
    ["audio/aac", "m4a"],
    ["audio/x-wav", "wav"],
    ["application/vnd.openxmlformats-officedocument.presentationml.presentation", "pptx"],
    ["image/tiff", "tiff"],
  ])("identifies %s by MIME type when the bytes say nothing", async (mime, format) => {
    expect(await formatOf(new File([], "file", { type: mime }))).toBe(format);
  });

  it.each([
    ["IMG_0001.HEIC", "heic"],
    ["scan.TIF", "tiff"],
    ["film.m4v", "mp4"],
  ])("identifies %s by extension when the bytes and MIME type say nothing", async (name, format) => {
    expect(await formatOf(new File([], name, { type: "" }))).toBe(format);
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
  it.each([
    ["jpeg", "image"],
    ["tiff", "image"],
    ["pdf", "document"],
    ["pptx", "document"],
    ["mov", "video"],
    ["m4a", "audio"],
    ["wav", "audio"],
  ] as const)("%s is %s", (format, category) => {
    expect(categoryOf(format)).toBe(category);
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

  it("lists every supported format by MIME type and extension", () => {
    for (const entry of ["image/jpeg", ".jpg", "image/heic", ".heic", ".heif", ".avif", "audio/mp4", ".m4a", ".docx"]) {
      expect(accepted, entry).toContain(entry);
    }
  });

  it("lets recognised formats through the picker so they get a clear message", () => {
    expect(accepted).toContain("image/tiff");
    expect(accepted).toContain(".tif");
  });
});

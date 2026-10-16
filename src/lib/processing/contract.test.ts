import { describe, expect, it } from "vitest";
import { failureReason, processFile } from "./coordinator";
import { ALL_ON } from "./contract-checks.fixture";
import { bytes } from "./format-headers.fixture";
import { jpegWithMetadata, pngChunks, concat } from "./image/image-files.fixture";

/* The rules processFile applies to every format on the contract, tested
   through it with real image processors. Format-specific behaviour lives in
   each family's own tests. */

const PNG_SIGNATURE = [137, 80, 78, 71, 13, 10, 26, 10];
const chunkType = (chunk: Uint8Array) => String.fromCharCode(...chunk.subarray(4, 8));

/** A PNG with only its image chunks: nothing to remove. */
const plainPng = () =>
  concat(PNG_SIGNATURE, ...pngChunks().filter((c) => ["IHDR", "IDAT", "IEND"].includes(chunkType(c))));

const bytesOf = async (blob: Blob) => new Uint8Array(await blob.arrayBuffer());

describe("a successful strip", () => {
  it("hands back the original bytes when nothing was removed", async () => {
    const input = plainPng();
    const file = new File([input], "plain.png", { type: "image/png" });
    const result = await processFile(file, ALL_ON);
    expect(result.error).toBeUndefined();
    expect(result.report.fieldsRemoved).toEqual([]);
    expect(await bytesOf(result.cleanedBlob)).toEqual(input);
    expect(result.report.cleanedFileSize).toBe(file.size);
  });

  it("types the cleaned file by the format the bytes proved, not the name", async () => {
    const file = new File([jpegWithMetadata()], "photo.png", { type: "image/png" });
    const result = await processFile(file, ALL_ON);
    expect(result.report.fileType).toBe("jpeg");
    expect(result.cleanedBlob.type).toBe("image/jpeg");
  });

  it("reports kept fields as found minus removed", async () => {
    const file = new File([jpegWithMetadata()], "photo.jpg", { type: "image/jpeg" });
    const { report } = await processFile(file, { ...ALL_ON, author: false });
    expect(report.fieldsKept.length).toBeGreaterThan(0);
    expect(report.fieldsKept.every((f) => !report.fieldsRemoved.includes(f))).toBe(true);
    expect(report.fieldsKept.length + report.fieldsRemoved.length).toBe(report.fieldsFound.length);
  });
});

describe("a failure", () => {
  it("names nothing when the format is unknown", async () => {
    const file = new File([bytes("hello, this is a text file") as BlobPart], "notes.txt", { type: "text/plain" });
    const result = await processFile(file, ALL_ON);
    expect(result.error).toBe("Those file types aren't supported yet.");
    expect(result.reason).toBe("unsupported_type");
    expect(result.cleanedBlob).toBe(file);
    expect(result.report.fileType).toBe("unknown");
  });

  it("names a recognised format it can't strip yet", async () => {
    const file = new File([bytes("II*", [0, 8, 0, 0, 0]) as BlobPart], "scan.tif", { type: "image/tiff" });
    const result = await processFile(file, ALL_ON);
    expect(result.error).toBe("TIFF files aren't supported yet.");
    expect(result.reason).toBe("recognised: tiff");
    expect(result.cleanedBlob).toBe(file);
  });

  it("explains a file the browser couldn't read", async () => {
    // Identification reads only the first bytes, so it still works; the full
    // read is what fails, as it does for a cloud placeholder or a moved file.
    const file = new File([jpegWithMetadata()], "photo.jpg", { type: "image/jpeg" });
    file.arrayBuffer = () => Promise.reject(new DOMException("gone", "NotReadableError"));
    const result = await processFile(file, ALL_ON);
    expect(result.error).toMatch(/^Your browser couldn't open it\./);
    expect(result.reason).toBe("crash: NotReadableError");
    expect(result.cleanedBlob).toBe(file);
    expect(result.report.cleanedFileSize).toBe(file.size);
  });

  it("gives telemetry the reason code, never the message", async () => {
    const file = new File([bytes("II*", [0, 8, 0, 0, 0]) as BlobPart], "scan.tif", { type: "image/tiff" });
    expect(failureReason(await processFile(file, ALL_ON))).toBe("recognised: tiff");
  });
});

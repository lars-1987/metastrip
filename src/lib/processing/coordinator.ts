import { detectFileType, sniffFormat, NAMEABLE_UNSUPPORTED } from "../file-utils";
import { processJpeg } from "./image/jpeg";
import { processPng } from "./image/png";
import { processWebp } from "./image/webp";
import { processHeic } from "./image/heic";
import { processPdf } from "./document/pdf";
import { processDocx } from "./document/docx";
import { processXlsx } from "./document/xlsx";
import { processPptx } from "./document/pptx";
import { processMp4, processMov } from "./video/mp4";
import { processMp3 } from "./audio/mp3";
import { processFlac } from "./audio/flac";
import { processWav } from "./audio/wav";
import type {
  SupportedFileType,
  StripOptions,
  ProcessingResult,
} from "./types";
import { DEFAULT_STRIP_OPTIONS } from "./types";

type Processor = (
  file: File,
  options: StripOptions
) => Promise<ProcessingResult>;

const processors: Partial<Record<SupportedFileType, Processor>> = {
  jpeg: processJpeg,
  png: processPng,
  webp: processWebp,
  heic: processHeic,
  pdf: processPdf,
  docx: processDocx,
  xlsx: processXlsx,
  pptx: processPptx,
  mp4: processMp4,
  mov: processMov,
  // M4A files are MP4 containers (audio-only) — same atom structure, same processor.
  m4a: processMp4,
  mp3: processMp3,
  flac: processFlac,
  wav: processWav,
};

/** An empty result carrying an error, so the three failure paths below read as
 *  one line each instead of three near-identical object literals. */
function failed(file: File, fileType: SupportedFileType, error: string): ProcessingResult {
  return {
    originalFile: file,
    // The original bytes, untouched. An empty Blob here would hand the user a
    // 0-byte "cleaned" file if anything downloaded it.
    cleanedBlob: file,
    report: {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      cleanedFileSize: 0,
      fieldsFound: [],
      fieldsRemoved: [],
      fieldsKept: [],
      processedAt: new Date(),
    },
    error,
  };
}

export async function processFile(
  file: File,
  options: StripOptions = DEFAULT_STRIP_OPTIONS
): Promise<ProcessingResult> {
  // Trust the bytes over the file name. `File.type` is the OS guessing from the
  // extension, so a JPEG saved as photo.png arrived tagged image/png, reached
  // processPng and failed its signature check. That was the most common error
  // in `file_failed`: 14 of them from 4 people, all reported as "Invalid PNG".
  const head = new Uint8Array(await file.slice(0, 32).arrayBuffer());
  const sniffed = sniffFormat(head);

  // A format we can name but not yet handle. Saying so beats a parser error for
  // whatever the extension claimed, and it puts real demand in the telemetry.
  if (sniffed && NAMEABLE_UNSUPPORTED[sniffed]) {
    return failed(file, detectFileType(file) ?? "jpeg",
      `${NAMEABLE_UNSUPPORTED[sniffed]} files aren't supported yet.`);
  }

  const sniffedType =
    sniffed && Object.prototype.hasOwnProperty.call(processors, sniffed)
      ? (sniffed as SupportedFileType)
      : null;
  const fileType = sniffedType ?? detectFileType(file);

  if (!fileType) {
    return failed(file, "jpeg", `Unsupported file type: ${file.type}`);
  }

  const processor = processors[fileType];
  if (!processor) {
    return failed(file, fileType, `${fileType.toUpperCase()} support coming soon`);
  }

  return processor(file, options);
}

export async function processBatch(
  files: File[],
  options: StripOptions = DEFAULT_STRIP_OPTIONS,
  onProgress?: (completed: number, total: number) => void
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];

  for (let i = 0; i < files.length; i++) {
    const result = await processFile(files[i], options);
    results.push(result);
    onProgress?.(i + 1, files.length);
  }

  return results;
}

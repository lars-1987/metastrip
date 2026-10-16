import { identify, notSupportedYet, type Format, type SupportedFormat } from "./formats";
import { processJpeg } from "./image/jpeg";
import { processPng } from "./image/png";
import { processWebp } from "./image/webp";
import { processGif } from "./image/gif";
import { processHeic, processAvif } from "./image/heic";
import { processPdf } from "./document/pdf";
import { processDocx } from "./document/docx";
import { processXlsx } from "./document/xlsx";
import { processPptx } from "./document/pptx";
import { processMp4, processMov } from "./video/mp4";
import { processMp3 } from "./audio/mp3";
import { processFlac } from "./audio/flac";
import { processWav } from "./audio/wav";
import type { StripOptions, ProcessingResult } from "./types";
import { DEFAULT_STRIP_OPTIONS } from "./types";

type Processor = (
  file: File,
  options: StripOptions
) => Promise<ProcessingResult>;

// Every supported format in the registry needs an entry here, or the build fails.
const processors = {
  jpeg: processJpeg,
  png: processPng,
  webp: processWebp,
  gif: processGif,
  heic: processHeic,
  avif: processAvif,
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
} satisfies Record<SupportedFormat, Processor>;

/** An empty result carrying an error, so the three failure paths below read as
 *  one line each instead of three near-identical object literals. */
function failed(file: File, fileType: Format | "unknown", error: string): ProcessingResult {
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
  // Trust the bytes over the file name (the registry's one rule). `File.type`
  // is the OS guessing from the extension, so a JPEG saved as photo.png used to
  // reach processPng and fail its signature check: the most common error in
  // `file_failed`, 14 of them from 4 people, all reported as "Invalid PNG".
  const identity = await identify(file);

  if (identity.status === "unknown") {
    return failed(file, "unknown", `Unsupported file type: ${file.type}`);
  }
  // A format we can name but not yet handle. Saying so beats a parser error for
  // whatever the extension claimed, and it puts real demand in the telemetry.
  if (identity.status === "recognised") {
    return failed(file, identity.format, notSupportedYet([identity]));
  }

  // Parsers are meant to return an error rather than throw, but not all of them
  // wrap their reads (PNG, WebP and GIF have no try at all). A single throw used
  // to reject the whole scan, leaving the tool on "reading files" for good with
  // nothing logged, so the guard lives here once instead of in every parser.
  try {
    return await processors[identity.format](file, options);
  } catch (err) {
    const name = err instanceof Error ? err.name : "unknown";
    return {
      ...failed(file, identity.format, crashMessage(name)),
      crashed: name,
    };
  }
}

/**
 * What to tell someone when a read failed. NotFoundError and NotReadableError
 * come from the browser, not a parser: the file moved, was still being
 * written, or is a cloud placeholder that was never synced locally, and the
 * browser reports it as 0 bytes. A real case on 15 Sep: a cleaned download
 * dropped straight back in threw NotFoundError, and the review blamed the
 * file ("may be damaged"), which sent them looking in the wrong place.
 */
function crashMessage(name: string): string {
  if (name === "NotFoundError" || name === "NotReadableError") {
    return "Your browser couldn't open it. If you just downloaded it, make sure the download has finished, or save it to a folder on this device (not a cloud-only one) and try again.";
  }
  return "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.";
}

/** Telemetry reason for a result that failed. A crash is logged by its error
 *  class alone ("crash: RangeError"), never the message, which could quote
 *  content from the file. */
export function failureReason(r: ProcessingResult): string {
  return r.crashed ? `crash: ${r.crashed}` : r.error ?? "unknown";
}

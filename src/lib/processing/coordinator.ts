import { identify, mimeOf, notSupportedYet, type Format, type SupportedFormat } from "./formats";
import { Unreadable, type Processor, type Stripped } from "./contract";
import { formatBytes } from "../file-utils";
import { stripJpeg } from "./image/jpeg";
import { stripPng } from "./image/png";
import { stripWebp } from "./image/webp";
import { stripGif } from "./image/gif";
import { stripHeic, stripAvif } from "./image/heic";
import { stripPdf } from "./document/pdf";
import { stripDocx, stripXlsx, stripPptx } from "./document/office";
import { stripMp4 } from "./video/mp4";
import { stripMp3 } from "./audio/mp3";
import { stripFlac } from "./audio/flac";
import { stripWav } from "./audio/wav";
import type { StripOptions, ProcessingResult } from "./types";
import { DEFAULT_STRIP_OPTIONS } from "./types";

/* The contract module. processFile identifies the file, runs its format's
   processor and builds the whole result, so the rules every format shares
   live here once:

   - A failure hands back the original file, never an empty one, with a plain
     message for the person and a stable reason code for telemetry.
   - If nothing was removed, the original bytes come back untouched.
   - A non-empty file that comes out empty is a failure, whatever the
     processor said.
   - Kept fields are found minus removed; the cleaned file's type comes from
     the format, which the bytes decided. */

type Entry = { strip: Processor; maxBytes?: number };

/** Video is read whole into memory, so a file past this would crash the tab
 *  rather than fail politely. */
const VIDEO_MAX_BYTES = 1.5 * 1024 ** 3;

// Every supported format in the registry needs an entry here, or the build fails.
const processors = {
  jpeg: { strip: stripJpeg },
  png: { strip: stripPng },
  webp: { strip: stripWebp },
  gif: { strip: stripGif },
  heic: { strip: stripHeic },
  avif: { strip: stripAvif },
  pdf: { strip: stripPdf },
  docx: { strip: stripDocx },
  xlsx: { strip: stripXlsx },
  pptx: { strip: stripPptx },
  mp4: { strip: stripMp4, maxBytes: VIDEO_MAX_BYTES },
  mov: { strip: stripMp4, maxBytes: VIDEO_MAX_BYTES },
  // M4A files are MP4 containers (audio-only): same atom structure, same processor.
  m4a: { strip: stripMp4, maxBytes: VIDEO_MAX_BYTES },
  mp3: { strip: stripMp3 },
  flac: { strip: stripFlac },
  wav: { strip: stripWav },
} satisfies Record<SupportedFormat, Entry>;

const DAMAGED = "It may be damaged, or use a variant of the format MetaStrip doesn't handle yet.";

/** A failed result: the original file, untouched, with a message and a reason. */
function failed(file: File, fileType: Format | "unknown", error: string, reason: string): ProcessingResult {
  return {
    originalFile: file,
    cleanedBlob: file,
    report: {
      fileName: file.name,
      fileType,
      fileSize: file.size,
      cleanedFileSize: file.size,
      fieldsFound: [],
      fieldsRemoved: [],
      fieldsKept: [],
      processedAt: new Date(),
    },
    error,
    reason,
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
    return failed(file, "unknown", notSupportedYet([identity]), "unsupported_type");
  }
  // A format we can name but not yet handle. Saying so beats a parser error for
  // whatever the extension claimed, and it puts real demand in the telemetry.
  if (identity.status === "recognised") {
    return failed(file, identity.format, notSupportedYet([identity]), `recognised: ${identity.format}`);
  }

  const format = identity.format;
  const entry: Entry = processors[format];

  // Checked before reading: a 70 GB video must never be loaded into memory.
  if (entry.maxBytes !== undefined && file.size > entry.maxBytes) {
    return failed(
      file, format,
      `Too large (${formatBytes(file.size)}). The maximum is ${formatBytes(entry.maxBytes)}; trim or compress it first.`,
      "too_large"
    );
  }

  // Parsers are meant to throw Unreadable for a file that isn't valid, but any
  // other throw (a bug, or the browser failing the read) used to reject the
  // whole scan, leaving the tool on "reading files" for good. So the guard
  // lives here once instead of in every parser.
  try {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const stripped = await entry.strip(bytes, options);
    return assemble(file, format, bytes, stripped);
  } catch (err) {
    if (err instanceof Unreadable) return failed(file, format, DAMAGED, `unreadable: ${format}`);
    const name = err instanceof Error ? err.name : "unknown";
    return failed(file, format, crashMessage(name), `crash: ${name}`);
  }
}

function assemble(file: File, format: SupportedFormat, original: Uint8Array, s: Stripped): ProcessingResult {
  if (s.fieldsRemoved.some((f) => !s.fieldsFound.includes(f))) {
    throw new Error("A processor reported removing a field it never found");
  }
  // A non-empty file that comes out empty lost its content, not its metadata.
  if (original.length > 0 && s.cleaned.length === 0) {
    return failed(file, format, DAMAGED, `empty_output: ${format}`);
  }
  const type = mimeOf(format);
  // Nothing to remove: hand back the original bytes rather than a rewrite.
  const cleanedBlob = s.fieldsRemoved.length === 0
    ? file.slice(0, file.size, type)
    : new Blob([s.cleaned as BlobPart], { type });
  return {
    originalFile: file,
    cleanedBlob,
    report: {
      fileName: file.name,
      fileType: format,
      fileSize: file.size,
      cleanedFileSize: cleanedBlob.size,
      fieldsFound: s.fieldsFound,
      fieldsRemoved: s.fieldsRemoved,
      fieldsKept: s.fieldsFound.filter((f) => !s.fieldsRemoved.includes(f)),
      processedAt: new Date(),
    },
  };
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
  return DAMAGED;
}

/** Telemetry reason for a result that failed. Never the message, which could
 *  quote content from the file. */
export function failureReason(r: ProcessingResult): string {
  return r.reason ?? "unknown";
}

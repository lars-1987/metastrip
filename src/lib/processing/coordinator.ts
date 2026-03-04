import { detectFileType } from "../file-utils";
import { processJpeg } from "./image/jpeg";
import { processPng } from "./image/png";
import { processWebp } from "./image/webp";
import { processPdf } from "./document/pdf";
import { processDocx } from "./document/docx";
import { processXlsx } from "./document/xlsx";
import { processPptx } from "./document/pptx";
import type {
  SupportedFileType,
  StripOptions,
  ProcessingResult,
  MetadataReport,
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
  pdf: processPdf,
  docx: processDocx,
  xlsx: processXlsx,
  pptx: processPptx,
};

export async function processFile(
  file: File,
  options: StripOptions = DEFAULT_STRIP_OPTIONS
): Promise<ProcessingResult> {
  const fileType = detectFileType(file);

  if (!fileType) {
    return {
      originalFile: file,
      cleanedBlob: new Blob(),
      report: {
        fileName: file.name,
        fileType: "jpeg",
        fileSize: file.size,
        cleanedFileSize: 0,
        fieldsFound: [],
        fieldsRemoved: [],
        fieldsKept: [],
        processedAt: new Date(),
      } as MetadataReport,
      error: `Unsupported file type: ${file.type}`,
    };
  }

  const processor = processors[fileType];
  if (!processor) {
    return {
      originalFile: file,
      cleanedBlob: new Blob(),
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
      error: `${fileType.toUpperCase()} support coming soon`,
    };
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

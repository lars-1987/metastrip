import type { Format, SupportedFormat } from "./formats";

export type MetadataCategory =
  | "gps"
  | "device"
  | "dates"
  | "author"
  | "software"
  | "copyright"
  | "ai"
  | "comments"
  | "custom";

export interface MetadataField {
  category: MetadataCategory;
  key: string;
  label: string;
  value: string | number | Date | null;
  removable: boolean;
}

export interface MetadataReport {
  fileName: string;
  /** "unknown" only when processFile was handed a file nobody could identify. */
  fileType: Format | "unknown";
  fileSize: number;
  cleanedFileSize: number;
  fieldsFound: MetadataField[];
  fieldsRemoved: MetadataField[];
  fieldsKept: MetadataField[];
  processedAt: Date;
}

export interface StripOptions {
  gps: boolean;
  device: boolean;
  dates: boolean;
  author: boolean;
  software: boolean;
  copyright: boolean;
  ai: boolean;
  comments: boolean;
  custom: boolean;
}

export const DEFAULT_STRIP_OPTIONS: StripOptions = {
  gps: true,
  device: true,
  dates: true,
  author: true,
  software: true,
  copyright: false,
  ai: true,
  comments: true,
  custom: true,
};

export interface ProcessingResult {
  originalFile: File;
  cleanedBlob: Blob;
  report: MetadataReport;
  /** What to tell the person, when the file could not be cleaned. */
  error?: string;
  /** Why it failed, as a short stable code for telemetry ("unreadable: png",
   *  "too_large", "crash: RangeError"). Never carries text read from the file. */
  reason?: string;
}

export type FileCategory = "image" | "document" | "video" | "audio";

export interface FileEntry {
  file: File;
  format: SupportedFormat;
  id: string;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessingResult;
}

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
  fileType: SupportedFileType;
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
  error?: string;
  /** Set when a parser threw instead of returning an error. Holds the error's
   *  class name only (e.g. "RangeError"), never its message, so telemetry can
   *  tell crashes apart without carrying anything read from the file. */
  crashed?: string;
}

export type SupportedFileType =
  | "jpeg"
  | "png"
  | "webp"
  | "heic"
  | "tiff"
  | "gif"
  | "pdf"
  | "docx"
  | "xlsx"
  | "pptx"
  | "mp4"
  | "mov"
  | "m4a"
  | "mp3"
  | "flac"
  | "wav";

export type FileCategory = "image" | "document" | "video" | "audio";

export interface FileEntry {
  file: File;
  id: string;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessingResult;
}

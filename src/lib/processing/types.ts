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
  | "pptx";

export type FileCategory = "image" | "document";

export interface FileEntry {
  file: File;
  id: string;
  status: "pending" | "processing" | "done" | "error";
  result?: ProcessingResult;
}

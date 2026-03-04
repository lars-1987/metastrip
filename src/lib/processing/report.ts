import type { ProcessingResult } from "./types";

export interface AuditReport {
  generatedAt: string;
  totalFiles: number;
  totalFieldsFound: number;
  totalFieldsRemoved: number;
  totalFieldsKept: number;
  files: Array<{
    fileName: string;
    fileType: string;
    originalSize: number;
    cleanedSize: number;
    fieldsFound: number;
    fieldsRemoved: number;
    fieldsKept: number;
    details: {
      removed: Array<{
        category: string;
        key: string;
        label: string;
        value: string;
      }>;
      kept: Array<{
        category: string;
        key: string;
        label: string;
        value: string;
      }>;
    };
  }>;
}

export function generateAuditReport(
  results: ProcessingResult[]
): AuditReport {
  const files = results.map((r) => ({
    fileName: r.report.fileName,
    fileType: r.report.fileType,
    originalSize: r.report.fileSize,
    cleanedSize: r.report.cleanedFileSize,
    fieldsFound: r.report.fieldsFound.length,
    fieldsRemoved: r.report.fieldsRemoved.length,
    fieldsKept: r.report.fieldsKept.length,
    details: {
      removed: r.report.fieldsRemoved.map((f) => ({
        category: f.category,
        key: f.key,
        label: f.label,
        value: String(f.value ?? ""),
      })),
      kept: r.report.fieldsKept.map((f) => ({
        category: f.category,
        key: f.key,
        label: f.label,
        value: String(f.value ?? ""),
      })),
    },
  }));

  return {
    generatedAt: new Date().toISOString(),
    totalFiles: files.length,
    totalFieldsFound: files.reduce((s, f) => s + f.fieldsFound, 0),
    totalFieldsRemoved: files.reduce((s, f) => s + f.fieldsRemoved, 0),
    totalFieldsKept: files.reduce((s, f) => s + f.fieldsKept, 0),
    files,
  };
}

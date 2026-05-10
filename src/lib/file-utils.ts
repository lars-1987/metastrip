import type { SupportedFileType, FileCategory } from "./processing/types";

const MIME_TO_TYPE: Record<string, SupportedFileType> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/tiff": "tiff",
  "image/gif": "gif",
  "application/pdf": "pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "pptx",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/x-m4v": "mp4",
};

export function detectFileType(file: File): SupportedFileType | null {
  return MIME_TO_TYPE[file.type] ?? null;
}

const IMAGE_TYPES: SupportedFileType[] = ["jpeg", "png", "webp", "heic", "tiff", "gif"];
const VIDEO_TYPES: SupportedFileType[] = ["mp4", "mov"];

export function getFileCategory(type: SupportedFileType): FileCategory {
  if (IMAGE_TYPES.includes(type)) return "image";
  if (VIDEO_TYPES.includes(type)) return "video";
  return "document";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + " MB";
  return (bytes / 1073741824).toFixed(2) + " GB";
}

export function getFileIcon(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "\u{1F5BC}";
  if (mimeType.startsWith("video/")) return "\u{1F39E}️"; // 🎞️ film frames
  if (mimeType === "application/pdf") return "\u{1F4C4}";
  return "\u{1F4CE}";
}

const TYPE_LABELS: Record<string, string> = {
  "image/jpeg": "JPEG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "application/pdf": "PDF",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "video/mp4": "MP4",
  "video/quicktime": "MOV",
  "video/x-m4v": "M4V",
};

export function getFileTypeLabel(mimeType: string): string {
  return TYPE_LABELS[mimeType] || mimeType.split("/").pop()?.toUpperCase() || "FILE";
}

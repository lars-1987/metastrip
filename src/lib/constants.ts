import type { MetadataCategory } from "./processing/types";
import type { IconName } from "@/components/shared/Icon";

export const SUPPORTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/tiff",
  "image/gif",
];

export const SUPPORTED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const SUPPORTED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
];

export const SUPPORTED_AUDIO_TYPES = [
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
];

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
  ...SUPPORTED_VIDEO_TYPES,
  ...SUPPORTED_AUDIO_TYPES,
];

// Phase 2: All supported types
export const ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/mp4",
  "video/quicktime",
  "video/x-m4v",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
  "audio/mpeg",
  "audio/mp3",
  "audio/flac",
  "audio/x-flac",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
];

export const BATCH_LIMIT = 20;

/** Soft warning threshold — videos above this take longer + use more memory */
export const VIDEO_SIZE_WARN_BYTES = 250 * 1024 * 1024; // 250 MB
/** Hard cap to prevent browser tab crashes on very large files */
export const VIDEO_SIZE_HARD_CAP_BYTES = 1.5 * 1024 * 1024 * 1024; // 1.5 GB

export interface CategoryConfig {
  label: string;
  icon: IconName;
  color: string;
}

export const CATEGORY_CONFIG: Record<MetadataCategory, CategoryConfig> = {
  gps: { label: "GPS & Location", icon: "MapPin", color: "#ff4d6a" },
  device: { label: "Device & Camera", icon: "DeviceMobile", color: "#a78bfa" },
  dates: { label: "Dates & Timestamps", icon: "CalendarBlank", color: "#38bdf8" },
  author: { label: "Author & Identity", icon: "User", color: "#f472b6" },
  software: { label: "Software & App Info", icon: "Laptop", color: "#818cf8" },
  ai: { label: "AI Generation Tags", icon: "Robot", color: "#a78bfa" },
  copyright: { label: "Copyright & Rights", icon: "Copyright", color: "#fbbf24" },
  comments: { label: "Comments & Changes", icon: "ChatText", color: "#4ade80" },
  custom: { label: "Custom Properties", icon: "GearSix", color: "#94a3b8" },
};

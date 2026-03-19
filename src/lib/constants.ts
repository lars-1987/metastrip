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

export const ALL_SUPPORTED_TYPES = [
  ...SUPPORTED_IMAGE_TYPES,
  ...SUPPORTED_DOCUMENT_TYPES,
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
];

export const BATCH_LIMIT = 20;

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

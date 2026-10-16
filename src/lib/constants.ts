import type { MetadataCategory, FileCategory } from "./processing/types";
import type { IconName } from "@/components/shared/Icon";

/** Ko-fi tip page. Centralised because the handle has already changed once,
 *  from /metastrip to /larshdev, and the old URL only resolves while Ko-fi
 *  chooses to keep redirecting it. */
export const KOFI_URL = "https://ko-fi.com/larshdev";

/** Public repo. Used by the nav, footer, terminal and the results-card star CTA. */
export const GITHUB_REPO_URL = "https://github.com/lars-1987/metastrip";

/** Raised from 50 in Oct 2026: 14 of 15 refused batches in the four weeks
 *  before were 52 to 87 files, all under 240 MB. The byte caps below are the
 *  real memory guard. */
export const BATCH_LIMIT = 100;

/**
 * Total bytes across a batch. Count alone is a poor guard: 100 photos and 100
 * videos are wildly different loads. Profiled Aug 2026 on desktop Chrome, a
 * 75-file / 423 MB batch completed scan + strip + zip in ~12s with no trouble,
 * so the ceiling sits below what desktop can do to leave mobile headroom, which
 * has far less memory and was not profiled.
 */
export const BATCH_SIZE_WARN_BYTES = 300 * 1024 * 1024; // 300 MB, flagged but allowed
export const BATCH_SIZE_HARD_CAP_BYTES = 750 * 1024 * 1024; // 750 MB, refused

export interface CategoryConfig {
  label: string;
  icon: IconName;
  color: string;
}

/**
 * Which metadata categories are meaningfully present in each file category.
 * Used to hide irrelevant toggles from the UI — e.g. an MP3 has no GPS
 * data, a PDF has no AI generation tags. Each processor already ignores
 * irrelevant categories, so this is purely a UX layer.
 */
export const RELEVANT_CATEGORIES_BY_FILE_CATEGORY: Record<
  FileCategory,
  ReadonlySet<MetadataCategory>
> = {
  image: new Set([
    "gps", "device", "dates", "author", "software",
    "copyright", "ai", "comments", "custom",
  ]),
  // gps and device look wrong for a document until you remember XMP: a scanned
  // or phone-captured PDF carries tiff:Make/Model, and sometimes exif GPS, in
  // its metadata packet. Categories only surface when a field is actually
  // found, so widening this costs nothing on an ordinary Word export.
  document: new Set([
    "gps", "device", "dates", "author", "software", "copyright", "comments", "custom",
  ]),
  // author, comments and copyright surface once the MP4 processor reads inside
  // udta and meta: a video's ©ART or com.apple.quicktime.author was stripped
  // but, filtered out here, never shown.
  video: new Set([
    "gps", "device", "dates", "author", "software", "copyright", "comments", "custom",
  ]),
  audio: new Set([
    "dates", "author", "software", "copyright", "comments", "custom",
  ]),
};

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

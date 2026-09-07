import posthog from "posthog-js";
import type { MetadataCategory } from "./processing/types";

/* ------------------------------------------------------------------ */
/*  Typed PostHog event helpers                                        */
/*  Every custom event fires through here so tracking is auditable.    */
/* ------------------------------------------------------------------ */

export function trackFileAdded(props: {
  file_type: string;
  file_size: number;
  file_count: number;
}) {
  posthog.capture("file_added", props);
}

/**
 * A completed strip.
 *
 * `categories_*` carry category NAMES only ("gps", "ai", "device"), never a
 * field value, so nothing here can identify a file or a place. Sorted so the
 * arrays group cleanly in queries.
 *
 * Both are recorded because they answer different questions. `found` is what
 * people's files actually contain, which is the product-direction signal.
 * `removed` is what they chose to act on, which differs only when someone
 * deselects a category. Without these, "is anyone removing GPS?" can only be
 * inferred from field counts and file format, which is suggestive rather than
 * evidence.
 */
export function trackFileStripped(props: {
  file_type: string;
  file_size: number;
  fields_removed_count: number;
  categories_found: MetadataCategory[];
  categories_removed: MetadataCategory[];
}) {
  posthog.capture("file_stripped", props);
}

/** Unique category names from a field list, sorted for stable grouping. */
export function categoriesOf(fields: { category: MetadataCategory }[]): MetadataCategory[] {
  return [...new Set(fields.map((f) => f.category))].sort();
}

/** A support call-to-action on the results card. Carries no file data, just
 *  which ask was clicked and how big the batch was, so star and tip can be
 *  compared against each other rather than inferred from autocapture. */
export function trackCtaClicked(props: { cta: "github_star" | "tip_jar"; file_count: number }) {
  posthog.capture("cta_clicked", props);
}

export function trackFileDownloaded(props: { file_type: string }) {
  posthog.capture("file_downloaded", props);
}

/**
 * A file the user tried to clean but we didn't. Three stages:
 *   "add"   — rejected before processing (unsupported type, over batch limit).
 *             `file_type` here is a roadmap signal: it's what people actually
 *             bring us that we can't take yet.
 *   "scan"  — a processor errored while reading the file on drop.
 *   "strip" — a processor errored during removal.
 *
 * Deliberately carries no filename and no file content, only the same mime
 * type and byte size the other file events already send.
 */
export function trackFileFailed(props: {
  file_type: string;
  file_size?: number;
  stage: "add" | "scan" | "strip";
  reason: string;
}) {
  posthog.capture("file_failed", {
    ...props,
    reason: props.reason.slice(0, 120),
  });
}

export function trackBatchProcessed(props: {
  file_count: number;
  success_count: number;
}) {
  posthog.capture("batch_processed", props);
}


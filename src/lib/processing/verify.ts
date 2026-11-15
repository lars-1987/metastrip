import { processFile } from "./coordinator";
import { BATCH_SIZE_WARN_BYTES } from "../constants";
import type { MetadataCategory, MetadataField, StripOptions } from "./types";

/**
 * "Verify clean": after a strip, re-read each cleaned file with every category
 * on, the way a careful person checks by dropping the download back in. One
 * visitor did exactly that on 15 Sep and hit a confusing error doing it.
 *
 * Categories the person chose to keep are expected to remain. Anything else a
 * re-read still finds is a leftover, which means a processor missed something:
 * the report says so rather than hiding it.
 */
export type VerifyStatus =
  | "clean" //      nothing left at all
  | "kept" //       only what the person chose to keep
  | "leftovers" //  something they asked to remove is still there
  | "skipped" //    too large to read twice safely
  | "unchecked"; // the cleaned file could not be re-read

export interface VerifyResult {
  status: VerifyStatus;
  /** Fields the re-read found, kept or not. */
  remaining: number;
  /** Categories asked to be removed that the re-read still found. */
  leftoverCategories: MetadataCategory[];
  /** Which fields those were, as safe names for telemetry (see leftoverField). */
  leftoverFields: string[];
}

/** A leftover field as a name telemetry can carry: the field's category and
 *  key, never its value. Keys a file can name itself (a custom Info property,
 *  anything odd) collapse to a fixed word, and the PDF Leftovers field adds
 *  the kinds of object it found, in our own words. */
export function leftoverField(f: MetadataField): string {
  if (f.key === "Leftovers") return `${f.category}:Leftovers(${f.detail ?? "?"})`;
  if (/^custom (property|field)/i.test(f.label)) return `${f.category}:custom_property`;
  return `${f.category}:${/^[A-Za-z0-9:._-]{1,40}$/.test(f.key) ? f.key : "other"}`;
}

// Re-reading means a second full pass and a second copy in memory. Above the
// size where a batch already warns, skip it rather than risk the tab.
export const VERIFY_MAX_BYTES = BATCH_SIZE_WARN_BYTES;

const ALL_ON: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

export async function verifyCleaned(
  cleaned: Blob,
  name: string,
  type: string,
  options: StripOptions
): Promise<VerifyResult> {
  if (cleaned.size > VERIFY_MAX_BYTES) return { status: "skipped", remaining: 0, leftoverCategories: [], leftoverFields: [] };
  const r = await processFile(new File([cleaned], name, { type }), ALL_ON);
  if (r.error) return { status: "unchecked", remaining: 0, leftoverCategories: [], leftoverFields: [] };
  const found = r.report.fieldsFound;
  const leftovers = found.filter((f) => options[f.category]);
  const leftoverCategories = [...new Set(leftovers.map((f) => f.category))];
  const leftoverFields = [...new Set(leftovers.map(leftoverField))].slice(0, 10);
  if (leftoverCategories.length) return { status: "leftovers", remaining: found.length, leftoverCategories, leftoverFields };
  return { status: found.length ? "kept" : "clean", remaining: found.length, leftoverCategories: [], leftoverFields: [] };
}

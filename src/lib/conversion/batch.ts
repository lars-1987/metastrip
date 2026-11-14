import type { StripOptions } from "../processing/types";

/* The converter's batch rules, kept apart from React so they can be tested. */

/** What the person can choose to keep. Everything else always goes. */
export type Keepable = "gps" | "dates" | "device";

const STRIP_ALL: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

/** Strip options for a set of kept categories: kept means not stripped. */
export function stripOptions(keep: ReadonlySet<Keepable>): StripOptions {
  return { ...STRIP_ALL, gps: !keep.has("gps"), dates: !keep.has("dates"), device: !keep.has("device") };
}

/** "IMG_1.jpg" twice in one batch (from IMG_1.HEIC and IMG_1.PNG) would
 *  overwrite each other in a zip and in Downloads; later ones get " (2)",
 *  " (3)". Compared without case, as macOS and Windows file systems do. */
export function uniqueName(name: string, taken: Set<string>): string {
  const key = (n: string) => n.toLowerCase();
  if (!taken.has(key(name))) { taken.add(key(name)); return name; }
  const dot = name.lastIndexOf(".");
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : "";
  for (let i = 2; ; i++) {
    const next = `${stem} (${i})${ext}`;
    if (!taken.has(key(next))) { taken.add(key(next)); return next; }
  }
}

import { expect } from "vitest";
import { processFile } from "./coordinator";
import type { MetadataCategory, MetadataField, StripOptions } from "./types";

/** Checks every format's tests share, so each processor is held to the same
 *  contract rules. */

export const ALL_ON: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

const CATEGORIES = Object.keys(ALL_ON) as MetadataCategory[];

const summary = (fields: MetadataField[]) => fields.map((f) => `${f.category}:${f.key}`).sort();

/** What's found must never depend on the options: kept fields are found minus
 *  removed, so a processor that only looks for what it's removing leaves kept
 *  fields out of the report. Runs the file with everything on, with each
 *  category off in turn, and with everything off. */
export async function expectFoundIgnoresOptions(make: () => File): Promise<void> {
  const base = await processFile(make(), ALL_ON);
  expect(base.error).toBeUndefined();
  const found = summary(base.report.fieldsFound);
  expect(found.length).toBeGreaterThan(0);

  const variants: [string, StripOptions][] = CATEGORIES.map((c) => [`${c} off`, { ...ALL_ON, [c]: false }]);
  variants.push(["everything off", Object.fromEntries(CATEGORIES.map((c) => [c, false])) as unknown as StripOptions]);
  for (const [label, options] of variants) {
    const r = await processFile(make(), options);
    expect(summary(r.report.fieldsFound), label).toEqual(found);
  }
}

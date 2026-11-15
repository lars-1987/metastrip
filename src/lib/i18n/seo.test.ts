import { describe, expect, it } from "vitest";
import { getSEOConfig } from "../seo-configs";
import { TRANSLATED_TOOL_SLUGS } from "./index";
import { SEO_ES } from "./seo-es";
import { SEO_DE } from "./seo-de";

/** Keys, array lengths and the non-text fields that must not change. */
function skeleton(value: unknown, key = ""): unknown {
  if (Array.isArray(value)) return value.map((v) => skeleton(v));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, skeleton(v, k)]));
  return ["slug", "icon", "color", "category", "id", "ext"].includes(key) ? value : typeof value;
}

const strings = (v: unknown): string[] =>
  typeof v === "string" ? [v] : Array.isArray(v) ? v.flatMap(strings) : v && typeof v === "object" ? Object.values(v).flatMap(strings) : [];

describe.each([["es", SEO_ES], ["de", SEO_DE]] as const)("%s tool pages", (_, configs) => {
  it.each([...TRANSLATED_TOOL_SLUGS])("%s matches the English page's structure", (slug) => {
    expect(skeleton(configs[slug])).toEqual(skeleton(getSEOConfig(slug)));
  });

  it.each([...TRANSLATED_TOOL_SLUGS])("%s fits search result lengths and the copy rules", (slug) => {
    const c = configs[slug];
    expect(c.metaTitle.length).toBeLessThanOrEqual(60);
    expect(c.metaTitle.endsWith("| MetaStrip")).toBe(true);
    expect(c.metaDescription.length).toBeLessThanOrEqual(160);
    expect(strings(c).filter((s) => /[—–]/.test(s))).toEqual([]);
    expect(c.title).not.toBe(getSEOConfig(slug)!.title);
    expect(c.seoContent.paragraphs[0]).not.toBe(getSEOConfig(slug)!.seoContent.paragraphs[0]);
  });
});

import { describe, expect, it } from "vitest";
import { en } from "./en";
import { es } from "./es";
import { de } from "./de";
import { languageAlternates, localePath, splitLocale, switchTarget } from "./index";

/** Every string a dictionary can produce: plain strings, array items, and
 *  what its functions return for sample arguments. */
function strings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") {
    const fn = value as (...args: unknown[]) => unknown;
    const samples: unknown[][] = [[1, 2, false, true], [3, 3, true, false], [["a.tiff", "b.raw", "c.psd"]], ["photo.jpg"], ["12 MB", "4 MB", "1.5 GB"]];
    return samples.flatMap((args) => { try { return strings(fn(...args)); } catch { return []; } });
  }
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === "object") return Object.values(value).flatMap(strings);
  return [];
}

/** The same keys and array lengths all the way down. */
function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, shape(v)]));
  return typeof value;
}

describe.each([["es", es], ["de", de]] as const)("%s", (_, messages) => {
  it("has every string English has, in the same shape", () => {
    expect(shape(messages)).toEqual(shape(en));
  });

  it("has no empty strings", () => {
    expect(strings(messages).filter((s) => s.trim() === "")).toEqual([]);
  });

  it("uses no em or en dashes (the site's copy rule)", () => {
    expect(strings(messages).filter((s) => /[—–]/.test(s))).toEqual([]);
  });

  it("isn't left in English", () => {
    const english = new Set(strings(en));
    const same = strings(messages).filter((s) => english.has(s) && s.length > 12);
    expect(same).toEqual([]);
  });
});

describe("paths", () => {
  it("puts Spanish and German under their own folder", () => {
    expect(localePath("en", "/")).toBe("/");
    expect(localePath("es", "/")).toBe("/es");
    expect(localePath("de", "/strip-exif-data")).toBe("/de/strip-exif-data");
  });

  it("reads the language back from a path", () => {
    expect(splitLocale("/")).toEqual({ locale: "en", path: "/" });
    expect(splitLocale("/es")).toEqual({ locale: "es", path: "/" });
    expect(splitLocale("/de/")).toEqual({ locale: "de", path: "/" });
    expect(splitLocale("/blog/x")).toEqual({ locale: "en", path: "/blog/x" });
    expect(splitLocale("/espresso")).toEqual({ locale: "en", path: "/espresso" });
  });

  it("switches to the same page when it's translated, else that language's homepage", () => {
    expect(switchTarget("/", "es")).toBe("/es");
    expect(switchTarget("/de", "en")).toBe("/");
    expect(switchTarget("/blog/some-post", "de")).toBe("/de");
  });

  it("lists every language and an x-default for search engines", () => {
    expect(languageAlternates("/")).toEqual({
      en: "https://metastrip.app",
      es: "https://metastrip.app/es",
      de: "https://metastrip.app/de",
      "x-default": "https://metastrip.app",
    });
  });
});

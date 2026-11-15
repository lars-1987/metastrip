import { en, type Messages } from "./en";
import { es } from "./es";
import { de } from "./de";

/* The languages the site speaks (MS-6). English pages keep their paths;
   Spanish and German live under /es and /de. Only pages listed in
   TRANSLATED_PATHS exist in every language: the rest are English only. */

export type Locale = "en" | "es" | "de";
export type { Messages };

export const LOCALES: readonly Locale[] = ["en", "es", "de"];
export const LOCALE_NAMES: Record<Locale, string> = { en: "English", es: "Español", de: "Deutsch" };

const MESSAGES: Record<Locale, Messages> = { en, es, de };
export function messagesFor(locale: Locale): Messages {
  return MESSAGES[locale];
}

/** Tool pages (seo-configs slugs) that exist in Spanish and German. They
 *  keep their English slug: /es/strip-exif-data. */
export const TRANSLATED_TOOL_SLUGS = [
  "remove-metadata-from-photos",
  "remove-gps-location-from-photos",
  "strip-exif-data",
  "remove-c2pa-metadata",
  "remove-author-from-pdf",
  "strip-metadata-from-word-document",
] as const;
export type TranslatedToolSlug = (typeof TRANSLATED_TOOL_SLUGS)[number];

/** English paths that have a Spanish and a German version. */
export const TRANSLATED_PATHS: readonly string[] = ["/", ...TRANSLATED_TOOL_SLUGS.map((s) => `/${s}`)];

const ORIGIN = "https://metastrip.app";

/** "/" in Spanish is "/es"; "/strip-exif-data" is "/es/strip-exif-data". */
export function localePath(locale: Locale, path: string): string {
  if (locale === "en") return path;
  return path === "/" ? `/${locale}` : `/${locale}${path}`;
}

/** The locale of a path and the English path it stands for. */
export function splitLocale(pathname: string): { locale: Locale; path: string } {
  const m = pathname.match(/^\/(es|de)(\/.*)?$/);
  if (!m) return { locale: "en", path: pathname };
  return { locale: m[1] as Locale, path: m[2] && m[2] !== "/" ? m[2].replace(/\/$/, "") : "/" };
}

/** hreflang alternates for a translated page, for its metadata. */
export function languageAlternates(path: string): Record<string, string> {
  const url = (l: Locale) => `${ORIGIN}${localePath(l, path) === "/" ? "" : localePath(l, path)}`;
  return { en: url("en"), es: url("es"), de: url("de"), "x-default": url("en") };
}

/** Where the language switcher sends someone on `pathname`: the same page in
 *  that language when it exists, else that language's homepage. */
export function switchTarget(pathname: string, to: Locale): string {
  const { path } = splitLocale(pathname);
  return TRANSLATED_PATHS.includes(path) ? localePath(to, path) : localePath(to, "/");
}

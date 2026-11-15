import type { SEOPageConfig } from "../seo-configs";
import { TRANSLATED_TOOL_SLUGS, type Locale, type TranslatedToolSlug } from "./index";
import { SEO_ES } from "./seo-es";
import { SEO_DE } from "./seo-de";

/* The translated tool page configs (MS-6 part 2). Server-side only: the
   pages import this, client components never do, so the page text isn't
   bundled into the tool. */

const CONFIGS: Record<Exclude<Locale, "en">, Record<TranslatedToolSlug, SEOPageConfig>> = { es: SEO_ES, de: SEO_DE };

export function translatedToolConfig(locale: Exclude<Locale, "en">, slug: string): SEOPageConfig | null {
  return (TRANSLATED_TOOL_SLUGS as readonly string[]).includes(slug) ? CONFIGS[locale][slug as TranslatedToolSlug] : null;
}

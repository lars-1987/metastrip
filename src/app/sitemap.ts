import { MetadataRoute } from "next";
import { SEO_SLUGS, getSEOConfig } from "@/lib/seo-configs";
import { ARTICLES } from "@/lib/blog-data";
import { TRANSLATED_TOOL_SLUGS, languageAlternates } from "@/lib/i18n";
import { translatedToolConfig } from "@/lib/i18n/seo";

export const dynamic = "force-static";

/* lastmod is the date a page's content last really changed. Google only
   trusts it on sites where it's accurate, and every page used to say 10 May
   2026 whatever had changed since. So each date below is real: bump it when
   the page changes. Tool pages carry theirs in seo-configs (`updated`), blog
   posts in blog-data (`updated`, else `date`). */

/** Pages outside the configs, by the date their content last changed. */
const PAGE_UPDATED = {
  home: "2026-11-15", // MS-5 title test; Spanish and German alternates
  about: "2026-10-17",
  privacy: "2026-11-15", // libheif credit
  pricing: "2026-09-15",
  author: "2026-07-09",
  converter: "2026-11-15", // /heic-to-jpg, new
  localizedHome: "2026-11-15", // /es and /de, new
};

const day = (iso: string) => new Date(`${iso}T00:00:00Z`);

function parseArticleDate(dateStr: string): Date {
  // Article dates are like "May 5, 2026" or "Feb 22, 2026"
  const parsed = new Date(`${dateStr} UTC`);
  return isNaN(parsed.getTime()) ? day(PAGE_UPDATED.home) : parsed;
}

const articleUpdated = (a: (typeof ARTICLES)[number]) => parseArticleDate(a.updated ?? a.date);

const toolUpdated = (c: { datePublished: string; updated?: string }) => day(c.updated ?? c.datePublished);

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://metastrip.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: day(PAGE_UPDATED.home),
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: languageAlternates("/") },
    },
    // MS-6: the Spanish and German homepages, each pointing at the others.
    ...(["es", "de"] as const).map((l) => ({
      url: `${baseUrl}/${l}`,
      lastModified: day(PAGE_UPDATED.localizedHome),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: languageAlternates("/") },
    })),
    {
      url: `${baseUrl}/about`,
      lastModified: day(PAGE_UPDATED.about),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: day(PAGE_UPDATED.privacy),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      // The index changes whenever a post is published or revised.
      lastModified: new Date(Math.max(...ARTICLES.map((a) => articleUpdated(a).getTime()))),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: day(PAGE_UPDATED.pricing),
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/author/lars`,
      lastModified: day(PAGE_UPDATED.author),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/heic-to-jpg`,
      lastModified: day(PAGE_UPDATED.converter),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const translated = new Set<string>(TRANSLATED_TOOL_SLUGS);
  const seoPages: MetadataRoute.Sitemap = SEO_SLUGS.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: toolUpdated(getSEOConfig(slug)!),
    changeFrequency: "monthly" as const,
    priority: 0.9,
    ...(translated.has(slug) && { alternates: { languages: languageAlternates(`/${slug}`) } }),
  }));

  // MS-6: the Spanish and German tool pages, each listing the others.
  const localizedSeoPages: MetadataRoute.Sitemap = TRANSLATED_TOOL_SLUGS.flatMap((slug) =>
    (["es", "de"] as const).map((l) => ({
      url: `${baseUrl}/${l}/${slug}`,
      lastModified: toolUpdated(translatedToolConfig(l, slug)!),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: languageAlternates(`/${slug}`) },
    }))
  );

  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: articleUpdated(article),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...seoPages, ...localizedSeoPages, ...blogPages];
}

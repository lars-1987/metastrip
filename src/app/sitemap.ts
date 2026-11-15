import { MetadataRoute } from "next";
import { SEO_SLUGS } from "@/lib/seo-configs";
import { ARTICLES } from "@/lib/blog-data";
import { TRANSLATED_TOOL_SLUGS, languageAlternates } from "@/lib/i18n";

export const dynamic = "force-static";

/**
 * Build-time constant so every entry in a single build shares the same
 * lastModified rather than ticking forward during generation.
 * For blog posts we use the article's own date when available.
 */
const BUILD_DATE = new Date("2026-05-10");

function parseArticleDate(dateStr: string): Date {
  // Article dates are like "May 5, 2026" or "Feb 22, 2026"
  const parsed = new Date(dateStr);
  return isNaN(parsed.getTime()) ? BUILD_DATE : parsed;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://metastrip.app";

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 1.0,
      alternates: { languages: languageAlternates("/") },
    },
    // MS-6: the Spanish and German homepages, each pointing at the others.
    ...(["es", "de"] as const).map((l) => ({
      url: `${baseUrl}/${l}`,
      lastModified: new Date("2026-11-15"),
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: { languages: languageAlternates("/") },
    })),
    {
      url: `${baseUrl}/about`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: BUILD_DATE,
      changeFrequency: "yearly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/author/lars`,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/heic-to-jpg`,
      lastModified: new Date("2026-11-15"),
      changeFrequency: "monthly",
      priority: 0.9,
    },
  ];

  const translated = new Set<string>(TRANSLATED_TOOL_SLUGS);
  const seoPages: MetadataRoute.Sitemap = SEO_SLUGS.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
    ...(translated.has(slug) && { alternates: { languages: languageAlternates(`/${slug}`) } }),
  }));

  // MS-6: the Spanish and German tool pages, each listing the others.
  const localizedSeoPages: MetadataRoute.Sitemap = TRANSLATED_TOOL_SLUGS.flatMap((slug) =>
    (["es", "de"] as const).map((l) => ({
      url: `${baseUrl}/${l}/${slug}`,
      lastModified: new Date("2026-11-15"),
      changeFrequency: "monthly" as const,
      priority: 0.8,
      alternates: { languages: languageAlternates(`/${slug}`) },
    }))
  );

  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: parseArticleDate(article.date),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...seoPages, ...localizedSeoPages, ...blogPages];
}

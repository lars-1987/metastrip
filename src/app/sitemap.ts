import { MetadataRoute } from "next";
import { SEO_SLUGS } from "@/lib/seo-configs";
import { ARTICLES } from "@/lib/blog-data";

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
    },
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
  ];

  const seoPages: MetadataRoute.Sitemap = SEO_SLUGS.map((slug) => ({
    url: `${baseUrl}/${slug}`,
    lastModified: BUILD_DATE,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  }));

  const blogPages: MetadataRoute.Sitemap = ARTICLES.map((article) => ({
    url: `${baseUrl}/blog/${article.slug}`,
    lastModified: parseArticleDate(article.date),
    changeFrequency: "monthly" as const,
    priority: article.featured ? 0.8 : 0.7,
  }));

  return [...staticPages, ...seoPages, ...blogPages];
}

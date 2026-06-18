import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "@/components/blog/ArticlePage";
import { getArticleBySlug, BLOG_SLUGS } from "@/lib/blog-data";
import { OG_IMAGE } from "@/lib/og";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return BLOG_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) return {};

  return {
    title: `${article.title}, MetaStrip Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://metastrip.app/blog/${slug}`,
      siteName: "MetaStrip",
      type: "article",
      images: [OG_IMAGE],
    },
    alternates: { canonical: `https://metastrip.app/blog/${slug}` },
  };
}

/** Convert a human date like "Jun 2, 2026" to ISO 8601 ("2026-06-02") for
 *  schema.org. Falls back to the raw string if it can't be parsed. ISO dates
 *  let Google reliably surface the freshness date in the SERP, which matters
 *  for CTR on time-sensitive ("2026", "news") queries. */
function toIsoDate(date: string): string {
  const parsed = new Date(date);
  return isNaN(parsed.getTime()) ? date : parsed.toISOString().slice(0, 10);
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const url = `https://metastrip.app/blog/${slug}`;
  const iso = toIsoDate(article.date);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    name: article.title,
    description: article.excerpt,
    url,
    datePublished: iso,
    dateModified: iso,
    image: "https://metastrip.app/opengraph-image",
    author: {
      "@type": "Person",
      name: "Lars Holmstrom",
      url: "https://x.com/larsitodev",
    },
    publisher: {
      "@type": "Organization",
      name: "MetaStrip",
      logo: {
        "@type": "ImageObject",
        url: "https://metastrip.app/favicon-96x96.png",
      },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  // Breadcrumb trail — shows "metastrip.app › Blog › Title" in the SERP
  // instead of a bare URL, a low-risk appearance/CTR win.
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://metastrip.app" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://metastrip.app/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  // FAQPage — only for posts that genuinely answer discrete questions.
  // Primarily consumed by AI answer engines (Bing Copilot, AI Overviews).
  const faqLd =
    article.faq && article.faq.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: article.faq.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  const graph = [articleLd, breadcrumbLd, ...(faqLd ? [faqLd] : [])];

  return (
    <>
      {graph.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <ArticlePage article={article} />
    </>
  );
}

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ArticlePage from "@/components/blog/ArticlePage";
import { getArticleBySlug, BLOG_SLUGS } from "@/lib/blog-data";

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
    title: `${article.title} — MetaStrip Blog`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url: `https://metastrip.app/blog/${slug}`,
      siteName: "MetaStrip",
      type: "article",
    },
    alternates: { canonical: `https://metastrip.app/blog/${slug}` },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    name: article.title,
    description: article.excerpt,
    url: `https://metastrip.app/blog/${slug}`,
    datePublished: article.date,
    dateModified: article.date,
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
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://metastrip.app/blog/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticlePage article={article} />
    </>
  );
}

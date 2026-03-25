import { Metadata } from "next";
import { notFound } from "next/navigation";
import { SEOTerminalPage } from "@/components/seo/SEOTerminalPage";
import { getSEOConfig, SEO_SLUGS } from "@/lib/seo-configs";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getSEOConfig(slug);
  if (!config) return {};

  return {
    title: config.metaTitle,
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url: `https://metastrip.app/${config.slug}`,
      siteName: "MetaStrip",
      type: "website",
    },
    alternates: {
      canonical: `https://metastrip.app/${config.slug}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const config = getSEOConfig(slug);
  if (!config) notFound();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            name: "MetaStrip",
            url: `https://metastrip.app/${config.slug}`,
            description: config.metaDescription,
            applicationCategory: "UtilitiesApplication",
            operatingSystem: "Any",
            offers: {
              "@type": "Offer",
              price: "0",
              priceCurrency: "USD",
            },
            featureList: [
              "Client-side metadata removal",
              "No file upload required",
              "EXIF, IPTC, XMP removal",
              "GPS location stripping",
              "AI metadata removal",
            ],
          }),
        }}
      />
      <SEOTerminalPage config={config} />
    </>
  );
}

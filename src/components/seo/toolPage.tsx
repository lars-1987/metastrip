import type { Metadata } from "next";
import { SEOTerminalPage } from "./SEOTerminalPage";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import type { SEOPageConfig } from "@/lib/seo-configs";
import { OG_IMAGE } from "@/lib/og";
import { TRANSLATED_TOOL_SLUGS, languageAlternates, localePath, messagesFor, type Locale } from "@/lib/i18n";

/* A tool landing page in any language (MS-6): its metadata, schema and body.
   English renders at /<slug>; the translated six also at /es/<slug> and
   /de/<slug>, each listing the others as alternates. */

const OG_LOCALE: Record<Locale, string> = { en: "en_US", es: "es_ES", de: "de_DE" };

const isTranslated = (slug: string) => (TRANSLATED_TOOL_SLUGS as readonly string[]).includes(slug);

export function toolMetadata(config: SEOPageConfig, locale: Locale): Metadata {
  const url = `https://metastrip.app${localePath(locale, `/${config.slug}`)}`;
  return {
    title: config.metaTitle,
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      url,
      siteName: "MetaStrip",
      type: "website",
      images: [OG_IMAGE],
      ...(locale !== "en" && { locale: OG_LOCALE[locale] }),
    },
    alternates: {
      canonical: url,
      ...(isTranslated(config.slug) && { languages: languageAlternates(`/${config.slug}`) }),
    },
  };
}

export function ToolPageBody({ config, locale }: { config: SEOPageConfig; locale: Locale }) {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "MetaStrip",
    url: `https://metastrip.app${localePath(locale, `/${config.slug}`)}`,
    description: config.metaDescription,
    datePublished: config.datePublished,
    ...(locale !== "en" && { inLanguage: locale }),
    applicationCategory: "UtilitiesApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    featureList: messagesFor(locale).seoDoc.features,
  };
  return (
    <LocaleProvider locale={locale}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      {locale !== "en" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />}
      <SEOTerminalPage config={config} />
    </LocaleProvider>
  );
}

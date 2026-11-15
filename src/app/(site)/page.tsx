import type { Metadata } from "next";
import { HomeMain } from "@/components/home/HomeMain";
import { FAQS } from "@/components/shared/faq-data";
import { OG_IMAGE } from "@/lib/og";
import { languageAlternates } from "@/lib/i18n";

export const metadata: Metadata = {
  // MS-5: a test of whether a title that matches the search ("metadata remover")
  // brings generic searches, not just people who know the name. Started Nov 2026.
  title: "Free Metadata Remover for Photos, PDFs & Video | MetaStrip",
  description:
    "Remove hidden metadata from photos, videos, PDFs and Word files: GPS, camera, author, AI tags and C2PA. Free, and your files never leave your device.",
  // MS-6: the Spanish and German homepages, so Google offers the right one.
  alternates: { canonical: "https://metastrip.app", languages: languageAlternates("/") },
  openGraph: {
    title: "MetaStrip, strip hidden metadata from files",
    description:
      "Remove AI tags and C2PA Content Credentials, plus GPS, camera and author details, from your files. 100% client-side; files never leave your device.",
    url: "https://metastrip.app",
    images: [OG_IMAGE],
  },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MetaStrip",
  url: "https://metastrip.app",
  description:
    "Remove hidden metadata from photos, videos, PDFs, Word documents, and more. AI generation tags and C2PA Content Credentials, GPS coordinates, camera info, author names and timestamps, stripped entirely in your browser.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern web browser",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "EXIF metadata removal",
    "GPS coordinate stripping",
    "C2PA / AI content credential removal",
    "PDF metadata cleaning",
    "Word document metadata removal",
    "Batch processing",
    "100% client-side processing",
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: { "@type": "Answer", text: item.answer },
  })),
};

export default function HomePage() {
  return <HomeMain locale="en" jsonLd={[webAppLd, faqLd]} />;
}

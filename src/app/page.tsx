import type { Metadata } from "next";
import { TopNav } from "@/components/shared/TopNav";
import { Hero } from "@/components/shared/Hero";
import { HowItWorks } from "@/components/shared/HowItWorks";
import { FAQ } from "@/components/shared/FAQ";
import { FAQS } from "@/components/shared/faq-data";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MetaStrip — Strip Hidden Metadata from Files",
  description:
    "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from photos, PDFs, and documents. Free, client-side, and private — files never leave your device.",
  alternates: { canonical: "https://metastrip.app" },
  openGraph: {
    title: "MetaStrip — Strip Hidden Metadata from Files",
    description:
      "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from your files. 100% client-side — files never leave your device.",
    url: "https://metastrip.app",
  },
};

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MetaStrip",
  url: "https://metastrip.app",
  description:
    "Remove hidden metadata from photos, PDFs, Word documents, and more. GPS coordinates, camera info, author names, timestamps, and AI generation tags — stripped entirely in your browser.",
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires a modern web browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
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
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
      />
      <TopNav />
      {/* Wrapper has solid bg + z-10 so it covers the sticky footer below
          until the user scrolls past it (creating the soft-reveal effect). */}
      <main
        className="relative z-10"
        style={{ background: "var(--bg)" }}
      >
        <Hero />
        <HowItWorks />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { Hero } from "@/components/v3/sections/Hero";
import { HeroIntro } from "@/components/v3/sections/HeroIntro";
import { HowItWorks } from "@/components/v3/sections/HowItWorks";
import { Faq } from "@/components/v3/sections/Faq";
import { ScrollReveals } from "@/components/v3/ScrollReveals";
import { FAQS } from "@/components/shared/faq-data";
import { OG_IMAGE } from "@/lib/og";

export const metadata: Metadata = {
  title: "MetaStrip, strip hidden metadata from files",
  description:
    "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from photos, PDFs, and documents. Free, client-side, and private; files never leave your device.",
  alternates: { canonical: "https://metastrip.app" },
  openGraph: {
    title: "MetaStrip, strip hidden metadata from files",
    description:
      "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from your files. 100% client-side; files never leave your device.",
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
    "Remove hidden metadata from photos, PDFs, Word documents, and more. GPS coordinates, camera info, author names, timestamps, and AI generation tags, stripped entirely in your browser.",
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
  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <ScrollReveals />
      {/* Content lifts off the footer as you scroll; the shadow on its bottom
          edge casts onto the footer being revealed underneath. */}
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]">
        <TopNav />
        <Hero />
        <HeroIntro />
        <HowItWorks />
        <Faq />
      </div>
      <Footer />
    </main>
  );
}

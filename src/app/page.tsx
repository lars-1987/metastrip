import type { Metadata } from "next";
import { TerminalApp } from "@/components/terminal/TerminalApp";

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

const jsonLd = {
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

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TerminalApp />
    </>
  );
}

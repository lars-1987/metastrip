import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Pricing — Free Metadata Removal | MetaStrip",
  description:
    "MetaStrip is free. Remove metadata from photos, PDFs, and documents in your browser — no signup, no upload, no cost. Optional Ko-fi support if you'd like to help.",
  alternates: { canonical: "https://metastrip.app/pricing" },
  openGraph: {
    title: "MetaStrip Pricing — Free, Forever",
    description:
      "MetaStrip is free to use. All processing happens in your browser; nothing is uploaded. Optional Ko-fi tips welcome.",
    url: "https://metastrip.app/pricing",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: "MetaStrip",
  description:
    "Free, client-side metadata removal tool for photos, PDFs, and documents.",
  brand: { "@type": "Brand", name: "MetaStrip" },
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    url: "https://metastrip.app",
  },
};

export default function PricingPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <AnimatedBackground />
      <main className="relative z-[1] min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-2xl text-center">
          <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-[0.1em] bg-purple/15 text-purple-light font-[family-name:var(--font-outfit)] mb-6">
            Pricing
          </span>
          <h1 className="text-[44px] md:text-[56px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white/95 font-[family-name:var(--font-outfit)] mb-5">
            MetaStrip is{" "}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: "linear-gradient(135deg, #a78bfa 0%, #06b6d4 100%)" }}
            >
              free
            </span>
            .
          </h1>
          <p className="text-[18px] text-white/65 leading-[1.6] font-[family-name:var(--font-outfit)] mb-10">
            Every feature, every file type, every time. No signup, no account, no upload —
            because your files never leave your device. The whole tool runs in your browser.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 text-left">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <h2 className="text-[15px] font-semibold text-white/90 font-[family-name:var(--font-outfit)] mb-2">
                For everyone
              </h2>
              <div className="text-[32px] font-bold text-white/95 mb-1 font-[family-name:var(--font-outfit)]">
                $0
              </div>
              <p className="text-[13px] text-white/55 mb-4 font-[family-name:var(--font-outfit)]">
                No catch. No ads. No tracking.
              </p>
              <ul className="space-y-1.5 text-[13px] text-white/65 font-[family-name:var(--font-outfit)]">
                <li>EXIF, GPS, IPTC, XMP, C2PA removal</li>
                <li>Photos, PDFs, Word docs, spreadsheets</li>
                <li>Batch processing up to 20 files</li>
                <li>100% client-side — nothing uploaded</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
              <h2 className="text-[15px] font-semibold text-white/90 font-[family-name:var(--font-outfit)] mb-2">
                Like the tool?
              </h2>
              <div className="text-[32px] font-bold text-white/95 mb-1 font-[family-name:var(--font-outfit)]">
                ☕
              </div>
              <p className="text-[13px] text-white/55 mb-4 font-[family-name:var(--font-outfit)]">
                Buy me a coffee on Ko-fi. Optional, appreciated, never required.
              </p>
              <a
                href="https://ko-fi.com/metastrip"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block px-5 py-2 rounded-lg text-[13px] font-semibold text-white bg-purple/30 hover:bg-purple/40 transition-colors no-underline font-[family-name:var(--font-outfit)]"
              >
                Support on Ko-fi →
              </a>
            </div>
          </div>

          <Link
            href="/"
            className="inline-block px-8 py-3.5 rounded-xl text-white text-[15px] font-semibold no-underline transition-all duration-200 hover:-translate-y-px font-[family-name:var(--font-outfit)]"
            style={{ background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" }}
          >
            Open MetaStrip →
          </Link>

          <p className="mt-8 text-[12px] text-white/35 font-[family-name:var(--font-mono)]">
            Questions? <a href="mailto:hello@metastrip.app" className="text-white/55 hover:text-white/80 underline-offset-2">hello@metastrip.app</a>
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}

import type { Metadata } from "next";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { Button } from "@/components/v3/ui/Button";
import { EmailButton } from "@/components/v3/ui/EmailButton";
import { OG_IMAGE } from "@/lib/og";
import { BATCH_LIMIT } from "@/lib/constants";

const ArrowRight = (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const metadata: Metadata = {
  title: "Pricing, Free Metadata Removal | MetaStrip",
  description:
    "MetaStrip is free. Remove metadata from photos, PDFs, and documents in your browser: no signup, no upload, no cost. Optional Ko-fi support if you'd like to help.",
  alternates: { canonical: "https://metastrip.app/pricing" },
  openGraph: {
    title: "MetaStrip Pricing, Free, Forever",
    description:
      "MetaStrip is free to use. All processing happens in your browser; nothing is uploaded. Optional Ko-fi tips welcome.",
    url: "https://metastrip.app/pricing",
    images: [OG_IMAGE],
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
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <section className="px-6 lg:px-8 pt-20 lg:pt-28 pb-24">
          <div className="max-w-3xl mx-auto text-center">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              Pricing
            </div>
            <h1
              className="font-extrabold leading-[1.02] tracking-[-0.04em] mb-6"
              style={{
                color: "var(--text)",
                fontSize: "clamp(44px, 6.5vw, 72px)",
              }}
            >
              MetaStrip is free.
            </h1>
            <p
              className="mx-auto leading-[1.55] font-medium mb-14"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(18px, 1.7vw, 21px)",
                maxWidth: 600,
              }}
            >
              Every feature, every file type, every time. No signup, no account,
              no upload, because your files never leave your device.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-14 text-left">
              {/* Free tier */}
              <div
                className="rounded-3xl p-7 lg:p-8"
                style={{
                  background: "var(--card-inverse-bg)",
                  color: "var(--card-inverse-text)",
                  boxShadow:
                    "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
                }}
              >
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
                  style={{ color: "var(--accent-strong)" }}
                >
                  For everyone
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="font-extrabold tracking-[-0.04em]"
                    style={{ fontSize: 56 }}
                  >
                    $0
                  </span>
                </div>
                <p
                  className="text-[14px] mb-6"
                  style={{ color: "var(--card-inverse-muted)" }}
                >
                  No catch. No ads. No tracking.
                </p>
                <ul
                  className="space-y-2.5 list-none p-0 m-0 mb-7"
                  style={{ color: "var(--card-inverse-muted)" }}
                >
                  {[
                    "EXIF, GPS, IPTC, XMP, C2PA removal",
                    "Photos, PDFs, Word, Excel, PowerPoint",
                    `Batch processing up to ${BATCH_LIMIT} files`,
                    "100% client-side; nothing uploaded",
                    "Open source under MIT licence",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[14px] leading-[1.55]"
                    >
                      <span
                        className="shrink-0 mt-[7px]"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-strong)",
                        }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button href="/" variant="inverse" size="lg" hoverIcon={ArrowRight}>
                  Open MetaStrip
                </Button>
              </div>

              {/* Optional support */}
              <div
                className="rounded-3xl p-7 lg:p-8"
                style={{
                  background: "var(--surface)",
                  boxShadow:
                    "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
                }}
              >
                <div
                  className="text-[11px] font-bold uppercase tracking-[0.18em] mb-3"
                  style={{ color: "var(--accent-strong)" }}
                >
                  Optional support
                </div>
                <div className="flex items-baseline gap-2 mb-2">
                  <span
                    className="font-extrabold tracking-[-0.04em]"
                    style={{ color: "var(--text)", fontSize: 56 }}
                  >
                    ☕
                  </span>
                </div>
                <p
                  className="text-[14px] mb-6"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Buy me a coffee on Ko-fi. Optional, appreciated, never required.
                </p>
                <ul
                  className="space-y-2.5 list-none p-0 m-0 mb-7"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {[
                    "Same tool, no extra features",
                    "Helps fund infrastructure + new file types",
                    "Get a thank-you email",
                    "No login or account required",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-3 text-[14px] leading-[1.55]"
                    >
                      <span
                        className="shrink-0 mt-[7px]"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-2)",
                        }}
                      />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button href="https://ko-fi.com/metastrip" external variant="soft" size="lg" hoverIcon={ArrowRight}>
                  Support on Ko-fi
                </Button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Questions?</p>
              <EmailButton />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

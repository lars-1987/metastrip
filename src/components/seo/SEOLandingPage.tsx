"use client";

import { TopNav } from "@/components/shared/TopNav";
import { Footer } from "@/components/layout/Footer";
import InlineTool from "./InlineTool";
import ExplainerTabs from "./ExplainerTabs";
import HowItWorks from "./HowItWorks";
import SupportedFormats from "./SupportedFormats";
import SEOContent from "./SEOContent";
import BottomCTA from "./BottomCTA";
import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOLandingPageProps {
  config: SEOPageConfig;
}

export function SEOLandingPage({ config }: SEOLandingPageProps) {
  return (
    <>
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-[900px] mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-24">
          {/* Hero */}
          <div className="text-center mb-14">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              {config.heroLabel}
            </div>
            <h1
              className="font-extrabold leading-[1.05] tracking-[-0.04em] mb-5"
              style={{
                color: "var(--text)",
                fontSize: "clamp(40px, 5.5vw, 60px)",
              }}
            >
              {config.title}
            </h1>
            <p
              className="mx-auto leading-[1.6] font-medium"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(17px, 1.6vw, 19px)",
                maxWidth: 580,
              }}
            >
              {config.subtitle}
            </p>
          </div>

        {/* Inline Tool */}
        <InlineTool config={config} />

        {/* What's Hidden */}
        <section className="mt-20">
          <h2 className="font-extrabold text-center tracking-[-0.03em] leading-[1.1] mb-3 text-[color:var(--text)]" style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}>
            What&apos;s hidden in your files?
          </h2>
          <p className="text-sm text-[color:var(--text-muted)] text-center font-[family-name:var(--font-outfit)] mb-8">
            Tap each category to see real examples
          </p>
          <ExplainerTabs tabs={config.explainerTabs} />
        </section>

        {/* How It Works */}
        <section className="mt-20">
          <h2 className="font-extrabold text-center tracking-[-0.03em] leading-[1.1] mb-3 text-[color:var(--text)]" style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}>
            How it works
          </h2>
          <p className="text-sm text-[color:var(--text-muted)] text-center font-[family-name:var(--font-outfit)] mb-8">
            Three steps. No account. No upload. No cost.
          </p>
          <HowItWorks />
        </section>

        {/* Supported Formats */}
        <section className="mt-20">
          <h2 className="font-extrabold text-center tracking-[-0.03em] leading-[1.1] mb-3 text-[color:var(--text)]" style={{ fontSize: "clamp(28px, 3.5vw, 40px)" }}>
            Supported formats
          </h2>
          <p className="text-sm text-[color:var(--text-muted)] text-center font-[family-name:var(--font-outfit)] mb-8">
            Deep metadata scanning for every field
          </p>
          <SupportedFormats formats={config.supportedFormats} />
        </section>

        {/* SEO Content */}
        <section className="mt-20 max-w-[640px] mx-auto">
          <SEOContent seo={config.seoContent} />
        </section>

          {/* Bottom CTA */}
          <BottomCTA batchCta={config.batchCta} />
        </div>
      </main>
      <Footer />
    </>
  );
}

"use client";

import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
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
      <AnimatedBackground />
      <Nav />

      <div className="relative z-[1] max-w-[880px] mx-auto px-6 pt-[110px] pb-20">
        {/* Hero */}
        <div className="text-center mb-10 animate-hero-fade-in">
          <div className="inline-block mb-4 px-4 py-[5px] rounded-full bg-success/[0.06] border border-success/[0.12]">
            <span className="text-xs text-success font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              {config.heroLabel}
            </span>
          </div>
          <h1
            className="text-4xl sm:text-[46px] font-extrabold leading-[1.1] -tracking-[0.04em] font-[family-name:var(--font-outfit)] mb-4 animate-gradient-shift"
            style={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {config.title}
          </h1>
          <p className="text-[17px] text-white/40 max-w-[540px] mx-auto font-[family-name:var(--font-outfit)] leading-[1.7]">
            {config.subtitle}
          </p>
        </div>

        {/* Inline Tool */}
        <InlineTool config={config} />

        {/* What's Hidden */}
        <section className="mt-20">
          <h2 className="text-[28px] font-bold text-center text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            What&apos;s hidden in your files?
          </h2>
          <p className="text-sm text-white/35 text-center font-[family-name:var(--font-outfit)] mb-8">
            Tap each category to see real examples
          </p>
          <ExplainerTabs tabs={config.explainerTabs} />
        </section>

        {/* How It Works */}
        <section className="mt-20">
          <h2 className="text-[28px] font-bold text-center text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            How it works
          </h2>
          <p className="text-sm text-white/35 text-center font-[family-name:var(--font-outfit)] mb-8">
            Three steps. No account. No upload. No cost.
          </p>
          <HowItWorks />
        </section>

        {/* Supported Formats */}
        <section className="mt-20">
          <h2 className="text-[28px] font-bold text-center text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            Supported formats
          </h2>
          <p className="text-sm text-white/35 text-center font-[family-name:var(--font-outfit)] mb-8">
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

      <Footer />
    </>
  );
}

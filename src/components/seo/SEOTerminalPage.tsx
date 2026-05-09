"use client";

import { TopNav } from "@/components/shared/TopNav";
import { Footer } from "@/components/layout/Footer";
import { TerminalApp } from "@/components/terminal/TerminalApp";
import { SEOMarkdownDoc } from "./SEOMarkdownDoc";
import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOTerminalPageProps {
  config: SEOPageConfig;
}

export function SEOTerminalPage({ config }: SEOTerminalPageProps) {
  return (
    <>
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        {/* Hero — page-specific title + subtitle + the terminal */}
        <section className="px-6 lg:px-8 pt-20 lg:pt-28 pb-16">
          <div className="max-w-3xl mx-auto text-center mb-12 lg:mb-16">
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
                fontSize: "clamp(40px, 5.5vw, 64px)",
              }}
            >
              {config.title}
            </h1>
            <p
              className="mx-auto leading-[1.55] font-medium"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(17px, 1.6vw, 20px)",
                maxWidth: 580,
              }}
            >
              {config.subtitle}
            </p>
          </div>
          <TerminalApp />
        </section>

        {/* Documentation panel */}
        <section className="px-6 lg:px-8 pb-24">
          <div className="max-w-4xl mx-auto">
            <SEOMarkdownDoc config={config} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

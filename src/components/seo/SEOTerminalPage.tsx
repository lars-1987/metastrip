"use client";

import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { V3Tool } from "@/components/v3/tool/V3Tool";
import { SEOMarkdownDoc } from "./SEOMarkdownDoc";
import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOTerminalPageProps {
  config: SEOPageConfig;
}

export function SEOTerminalPage({ config }: SEOTerminalPageProps) {
  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      {/* Content lifts off the footer on scroll, matching the landing page. */}
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]">
        <TopNav />

        {/* Tool first, full-bleed and evenly framed, just like the home page. */}
        <section className="relative px-5 pt-5 md:px-[116px] md:pt-8 md:min-h-[calc(100svh-84px)]">
          <div className="w-full">
            <V3Tool />
          </div>
        </section>

        {/* Page heading + subtitle, below the tool. */}
        <section className="px-6 lg:px-8 pt-16 lg:pt-24 pb-4 text-center">
          <div className="mx-auto max-w-3xl">
            <div className="v3-mono mb-4 text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
              {config.heroLabel}
            </div>
            <h1
              className="mb-5 font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text)]"
              style={{ fontSize: "clamp(40px, 5.5vw, 64px)" }}
            >
              {config.title}
            </h1>
            <p
              className="mx-auto font-medium leading-[1.55] text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(17px, 1.6vw, 20px)", maxWidth: 580 }}
            >
              {config.subtitle}
            </p>
          </div>
        </section>

        {/* Documentation panel */}
        <section className="px-6 lg:px-8 pb-24 pt-10">
          <div className="mx-auto max-w-4xl">
            <SEOMarkdownDoc config={config} />
          </div>
        </section>
      </div>
      <Footer />
    </main>
  );
}

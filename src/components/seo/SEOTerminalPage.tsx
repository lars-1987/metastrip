"use client";

import { TerminalApp } from "@/components/terminal/TerminalApp";
import { SEOMarkdownDoc } from "./SEOMarkdownDoc";
import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOTerminalPageProps {
  config: SEOPageConfig;
}

export function SEOTerminalPage({ config }: SEOTerminalPageProps) {
  return (
    <>
      <TerminalApp />
      <div className="relative z-[2] max-w-4xl mx-auto px-4 md:px-6 -mt-4 md:mt-8 mb-20">
        <SEOMarkdownDoc config={config} />
      </div>
    </>
  );
}

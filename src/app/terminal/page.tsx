import type { Metadata } from "next";
import { TopNav } from "@/components/shared/TopNav";
import { Hero } from "@/components/shared/Hero";
import { HowItWorks } from "@/components/shared/HowItWorks";
import { FAQ } from "@/components/shared/FAQ";
import { FounderPill } from "@/components/shared/FounderPill";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "MetaStrip Terminal",
  description:
    "The original terminal interface for MetaStrip. Remove GPS, camera info, author names, and AI tags from your files, 100% client-side.",
  alternates: { canonical: "https://metastrip.app/terminal" },
};

export default function TerminalPage() {
  return (
    <>
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
        <section className="px-6 lg:px-8 pb-20 lg:pb-28">
          <FounderPill>
            My name is Lars, I&apos;m from Melbourne, Australia. I&apos;m a
            cyber security graduate from the University of Tasmania, now an
            indie dev who likes privacy; the tool you&apos;re using right
            now is the tool I built for myself first.
          </FounderPill>
        </section>
      </main>
      <Footer />
    </>
  );
}

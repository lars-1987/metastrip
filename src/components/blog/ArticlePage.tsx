"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import TableOfContents from "@/components/blog/TableOfContents";
import InlineCTA from "@/components/blog/InlineCTA";
import RelatedPosts from "@/components/blog/RelatedPosts";
import { getCategoryLabel } from "@/lib/blog-data";
import type { BlogArticle } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match **bold** and `code` inline markers
  const regex = /\*\*(.+?)\*\*|`([^`]+)`/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(<strong key={key++} className="text-white/70 font-semibold">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<code key={key++} className="text-[13px] px-1.5 py-0.5 rounded bg-white/[0.06] text-purple-light font-[family-name:var(--font-mono)]">{match[2]}</code>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

export default function ArticlePage({ article }: { article: BlogArticle }) {
  const [activeSection, setActiveSection] = useState(0);
  const content = article.content;

  useEffect(() => {
    if (!content) return;
    const handleScroll = () => {
      for (let i = content.sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${i}`);
        if (el && el.getBoundingClientRect().top < 150) {
          setActiveSection(i);
          break;
        }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [content]);

  // ── Mode 2: Coming Soon (no content) ──────────────────────
  if (!content) {
    return (
      <>
        <AnimatedBackground />
        <Nav />

        <div className="relative z-[1] max-w-[700px] mx-auto px-6 pt-[130px] pb-20 text-center">
          <span className="block mb-5"><Icon name={article.coverIcon} size={72} weight="duotone" className="text-white/90" /></span>
          <h1 className="text-[32px] font-bold text-white/95 font-[family-name:var(--font-outfit)] tracking-[-0.02em] mb-3">
            {article.title}
          </h1>
          <p className="text-[15px] text-white/50 font-[family-name:var(--font-outfit)] leading-[1.7] mb-8">
            {article.excerpt}
          </p>

          <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/[0.05]">
            <p className="text-sm text-white/40 font-[family-name:var(--font-outfit)]">
              This article is coming soon. We&apos;re working on it — check
              back shortly.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-block mt-6 px-6 py-2.5 rounded-[10px] border border-white/10 bg-transparent text-white/70 text-sm font-medium font-[family-name:var(--font-outfit)] hover:border-purple/20 hover:text-white/90 transition-all duration-200 no-underline"
          >
            &larr; Back to blog
          </Link>

          <RelatedPosts currentId={article.id} />
        </div>

        <Footer />
      </>
    );
  }

  // ── Mode 1: Full Article ───────────────────────────────────
  return (
    <>
      <AnimatedBackground />
      <Nav />
      <ReadingProgressBar />

      {/* Article Header */}
      <div className="relative z-[1] max-w-[700px] mx-auto px-6 pt-[120px] animate-hero-fade-in">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 mb-6 px-3.5 py-1.5 rounded-lg border border-white/[0.06] bg-transparent text-white/50 text-[13px] font-[family-name:var(--font-outfit)] hover:border-purple/20 hover:text-white/80 transition-all duration-200 no-underline"
        >
          &larr; Blog
        </Link>

        {/* Meta row */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[11px] px-2.5 py-[3px] rounded-md bg-purple/10 text-purple-light font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.05em]">
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            {article.date}
          </span>
          <span className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            &middot;
          </span>
          <span className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            {article.readTime}
          </span>
        </div>

        <h1 className="text-[38px] font-extrabold leading-[1.2] tracking-[-0.03em] font-[family-name:var(--font-outfit)] text-white/95 mb-5">
          {article.title}
        </h1>

        {/* Tags */}
        <div className="flex gap-1.5 mb-8">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-[3px] rounded-md bg-white/[0.03] border border-white/[0.06] text-white/45 font-[family-name:var(--font-mono)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Body with Sidebar TOC */}
      <div className="relative z-[1] max-w-[1000px] mx-auto px-6 pb-20 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
        {/* TOC — hidden on mobile */}
        <div className="hidden lg:block">
          <TableOfContents
            sections={content.sections}
            activeSection={activeSection}
          />
        </div>

        {/* Content column */}
        <div className="max-w-[680px]">
          {/* Intro */}
          <p className="text-lg text-white/65 italic border-l-[3px] border-purple/30 pl-5 leading-relaxed mb-9 font-[family-name:var(--font-outfit)]">
            {content.intro}
          </p>

          {/* Sections */}
          {content.sections.map((section, i) => (
            <div
              key={i}
              id={`section-${i}`}
              className="mb-10 scroll-mt-[100px]"
            >
              <h2 className="text-[22px] font-bold text-white/95 font-[family-name:var(--font-outfit)] tracking-[-0.02em] mb-4">
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p
                  key={j}
                  className="text-[15px] text-white/55 font-[family-name:var(--font-outfit)] leading-[1.85] mb-4"
                >
                  {renderInlineMarkdown(para)}
                </p>
              ))}
              {i === 1 && <InlineCTA />}
            </div>
          ))}

          {/* Bottom CTA */}
          <div className="p-8 px-7 rounded-[20px] mt-4 text-center bg-gradient-to-br from-purple/[0.06] to-cyan/[0.03] border border-purple/[0.1]">
            <h3 className="text-xl font-bold text-white/95 font-[family-name:var(--font-outfit)] mb-2">
              Strip metadata from your files now
            </h3>
            <p className="text-sm text-white/50 font-[family-name:var(--font-outfit)] mb-5">
              Free for single files. No account, no upload, no tracking.
            </p>
            <Link
              href="/"
              className="inline-block px-9 py-3.5 rounded-xl border-none text-white text-[15px] font-semibold font-[family-name:var(--font-outfit)] no-underline transition-all duration-200 hover:-translate-y-px"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow:
                  "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Open MetaStrip &rarr;
            </Link>
          </div>

          {/* Related Posts */}
          <RelatedPosts currentId={article.id} />
        </div>
      </div>

      <Footer />
    </>
  );
}

"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { TopNav } from "@/components/shared/TopNav";
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
  // Match **bold**, `code`, and [text](url) inline markers
  const regex = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(<strong key={key++} className="text-[color:var(--text-secondary)] font-semibold">{match[1]}</strong>);
    } else if (match[2] !== undefined) {
      parts.push(<code key={key++} className="text-[13px] px-1.5 py-0.5 rounded bg-[var(--surface-elevated)] text-[color:var(--accent-strong)] font-[family-name:var(--font-mono)]">{match[2]}</code>);
    } else if (match[3] !== undefined && match[4] !== undefined) {
      const isExternal = /^https?:/.test(match[4]);
      parts.push(
        <Link
          key={key++}
          href={match[4]}
          className="underline underline-offset-2 transition-colors"
          style={{ color: "var(--accent-strong)" }}
          {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {match[3]}
        </Link>
      );
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
        <TopNav />
        <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-[700px] mx-auto px-6 pt-20 lg:pt-24 pb-20 text-center">
          <span className="block mb-5"><Icon name={article.coverIcon} size={72} weight="duotone" className="text-white/90" /></span>
          <h1 className="text-[32px] font-bold text-[color:var(--text)] font-[family-name:var(--font-outfit)] tracking-[-0.02em] mb-3">
            {article.title}
          </h1>
          <p className="text-[15px] text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.7] mb-8">
            {article.excerpt}
          </p>

          <div className="p-8 rounded-2xl bg-[var(--surface)] border border-[var(--border)]">
            <p className="text-sm text-[color:var(--text-muted)] font-[family-name:var(--font-outfit)]">
              This article is coming soon. We&apos;re working on it — check
              back shortly.
            </p>
          </div>

          <Link
            href="/blog"
            className="inline-block mt-6 px-6 py-2.5 rounded-[10px] border border-[var(--border-strong)] bg-transparent text-[color:var(--text-secondary)] text-sm font-medium font-[family-name:var(--font-outfit)] hover:border-[color:color-mix(in_srgb,var(--accent-strong)_40%,transparent)] hover:text-[color:var(--text)] transition-all duration-200 no-underline"
          >
            &larr; Back to blog
          </Link>

          <RelatedPosts currentId={article.id} />
        </div>
        </main>
        <Footer />
      </>
    );
  }

  // ── Mode 1: Full Article ───────────────────────────────────
  return (
    <>
      <TopNav />
      <ReadingProgressBar />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>

      {/* Article Header */}
      <div className="max-w-[700px] mx-auto px-6 pt-16 lg:pt-20">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 mb-6 px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-transparent text-[color:var(--text-secondary)] text-[13px] font-[family-name:var(--font-outfit)] hover:border-[color:color-mix(in_srgb,var(--accent-strong)_40%,transparent)] hover:text-[color:var(--text-secondary)] transition-all duration-200 no-underline"
        >
          &larr; Blog
        </Link>

        {/* Meta row */}
        <div className="flex items-center gap-2.5 mb-4">
          <span className="text-[11px] px-2.5 py-[3px] rounded-md bg-[color:color-mix(in_srgb,var(--accent-strong)_18%,transparent)] text-[color:var(--accent-strong)] font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.05em]">
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-xs text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
            {article.date}
          </span>
          <span className="text-xs text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
            &middot;
          </span>
          <span className="text-xs text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
            {article.readTime}
          </span>
        </div>

        <h1 className="text-[38px] font-extrabold leading-[1.2] tracking-[-0.03em] font-[family-name:var(--font-outfit)] text-[color:var(--text)] mb-5">
          {article.title}
        </h1>

        {/* Tags */}
        <div className="flex gap-1.5 mb-8">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="text-[11px] px-2.5 py-[3px] rounded-md bg-[var(--surface)] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Body with Sidebar TOC */}
      <div className="max-w-[1000px] mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-12">
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
          <p className="text-lg text-[color:var(--text-secondary)] italic border-l-[3px] border-[color:var(--accent-strong)] pl-5 leading-relaxed mb-9 font-[family-name:var(--font-outfit)]">
            {content.intro}
          </p>

          {/* Sections */}
          {content.sections.map((section, i) => (
            <div
              key={i}
              id={`section-${i}`}
              className="mb-10 scroll-mt-[100px]"
            >
              <h2 className="text-[22px] font-bold text-[color:var(--text)] font-[family-name:var(--font-outfit)] tracking-[-0.02em] mb-4">
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p
                  key={j}
                  className="text-[15px] text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.85] mb-4"
                >
                  {renderInlineMarkdown(para)}
                </p>
              ))}
              {i === 1 && <InlineCTA />}
            </div>
          ))}

          {/* Bottom CTA — dark card */}
          <div
            className="p-8 lg:p-10 rounded-3xl mt-6 text-center"
            style={{
              background: "var(--card-inverse-bg)",
              color: "var(--card-inverse-text)",
              boxShadow:
                "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
            }}
          >
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-3"
              style={{ color: "var(--accent-strong)" }}
            >
              Try it now
            </div>
            <h3
              className="font-extrabold tracking-[-0.02em] mb-3"
              style={{ color: "var(--card-inverse-text)", fontSize: 24 }}
            >
              Strip metadata from your files.
            </h3>
            <p
              className="mb-6"
              style={{ color: "var(--card-inverse-muted)", fontSize: 14 }}
            >
              Free, no account, no upload, no tracking.
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-7 py-3 rounded-xl text-[14px] font-semibold no-underline transition-all hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              Open MetaStrip →
            </Link>
          </div>

          {/* Related Posts */}
          <RelatedPosts currentId={article.id} />
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

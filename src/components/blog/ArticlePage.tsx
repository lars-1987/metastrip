"use client";

import { useState, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import ReadingProgressBar from "@/components/blog/ReadingProgressBar";
import TableOfContents from "@/components/blog/TableOfContents";
import InlineCTA from "@/components/blog/InlineCTA";
import dynamic from "next/dynamic";

// The tool pulls in every format processor (pdf-lib, piexifjs and the rest), so
// it loads as its own chunk and only on the posts that ask for it. The article
// text renders and indexes without waiting for any of it.
const V3Tool = dynamic(() => import("@/components/v3/tool/V3Tool").then((m) => m.V3Tool), {
  ssr: false,
  loading: () => <div className="min-h-[460px]" aria-hidden />,
});
import RelatedPosts from "@/components/blog/RelatedPosts";
import { getCategoryLabel } from "@/lib/blog-data";
import type { BlogArticle } from "@/lib/blog-data";
import { AUTHOR } from "@/lib/author";
import { Icon } from "@/components/shared/Icon";

function renderInlineMarkdown(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  // Match **bold**, `code`, and [text](url) inline markers
  const regex = /\*\*(.+?)\*\*|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)|\*([^*\n]+)\*/g;
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
    } else if (match[5] !== undefined) {
      parts.push(<em key={key++} className="italic">{match[5]}</em>);
    }
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts;
}

/** Render one paragraph-or-table block from a section body. */
function renderBlock(block: string, key: number): ReactNode {
  const trimmed = block.trim();
  // Markdown table: starts with "|" and has a "|---|" separator on the 2nd line.
  if (trimmed.startsWith("|") && /\n\s*\|[\s:|-]+\|/.test(trimmed)) {
    const rows = trimmed.split("\n").map((r) => r.trim()).filter(Boolean);
    const toCells = (row: string) =>
      row.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    const head = toCells(rows[0]);
    const bodyRows = rows.slice(2).map(toCells);
    return (
      <div key={key} className="my-6 overflow-x-auto">
        <table className="w-full border-collapse text-[14px] font-[family-name:var(--font-outfit)]">
          <thead>
            <tr>
              {head.map((c, ci) => (
                <th key={ci} className="border-b border-[var(--border-strong)] px-3 py-2.5 text-left font-semibold text-[color:var(--text)]">
                  {renderInlineMarkdown(c)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((cells, ri) => (
              <tr key={ri}>
                {cells.map((c, ci) => (
                  <td key={ci} className="border-b border-[var(--border)] px-3 py-2.5 align-top text-[color:var(--text-secondary)]">
                    {renderInlineMarkdown(c)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <p key={key} className="text-[15px] text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.85] mb-4">
      {renderInlineMarkdown(block)}
    </p>
  );
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
              This article is coming soon. We&apos;re working on it; check
              back shortly.
            </p>
          </div>

          <Link
            href="/blog"
            className="group mt-6 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--card-elevated)] px-5 py-2 text-[14px] font-medium text-[var(--text)] no-underline transition-colors duration-200 hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
          >
            <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover:-translate-x-1">&larr;</span>
            Back to blog
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

      {/* Tool first, for posts that rank on tool-intent queries. Someone
          arriving from "c2pa remover" wants to strip a file, not read. Same
          order as the SEO landing pages: label, tool, then the heading. */}
      {article.toolFirst && (
        <section className="px-5 pt-6 md:px-[116px] md:pt-7">
          <p className="v3-mono mb-3 text-center text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            {article.toolFirst.label}
          </p>
          <V3Tool />
        </section>
      )}

      {/* Article Header */}
      <div
        className={`max-w-[700px] mx-auto px-6 ${
          article.toolFirst ? "pt-12 lg:pt-16" : "pt-16 lg:pt-20"
        }`}
      >
        <Link
          href="/blog"
          className="group mb-6 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--card-elevated)] px-5 py-2 text-[14px] font-medium text-[var(--text)] no-underline transition-colors duration-200 hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
        >
          <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover:-translate-x-1">&larr;</span>
          Blog
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
          <span className="text-xs text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
            &middot;
          </span>
          <Link
            href={AUTHOR.path}
            className="text-xs text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] no-underline transition-colors hover:text-[color:var(--accent-strong)]"
          >
            By {AUTHOR.firstName}
          </Link>
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
          {/* Intro — bordered lead block, supports multiple paragraphs + inline markdown */}
          <div className="border-l-[3px] border-[color:var(--accent-strong)] pl-5 mb-9">
            {content.intro.split("\n\n").map((para, j) => (
              <p
                key={j}
                className="text-lg text-[color:var(--text-secondary)] italic leading-relaxed mb-4 last:mb-0 font-[family-name:var(--font-outfit)]"
              >
                {renderInlineMarkdown(para)}
              </p>
            ))}
          </div>

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
              {section.body.split("\n\n").map((block, j) => renderBlock(block, j))}
              {i === 1 && <InlineCTA {...(article.cta ?? {})} />}
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

          {/* Author bio: E-E-A-T trust signal, links through to the author page */}
          <Link
            href={AUTHOR.path}
            className="group mt-10 flex items-start gap-4 rounded-2xl bg-[var(--surface)] p-5 no-underline"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AUTHOR.image}
              alt={AUTHOR.name}
              width={48}
              height={48}
              className="h-12 w-12 shrink-0 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 1px var(--border)" }}
            />
            <div className="min-w-0">
              <div className="text-[12px] uppercase tracking-[0.1em] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
                Written by
              </div>
              <div className="text-[15px] font-semibold text-[color:var(--text)]">{AUTHOR.name}</div>
              <p className="text-[13px] leading-relaxed text-[color:var(--text-muted)] mt-1">{AUTHOR.bio}</p>
              <span className="mt-1.5 inline-block text-[13px] font-medium text-[color:var(--accent-strong)] transition-transform group-hover:translate-x-0.5">
                More from {AUTHOR.firstName} &rarr;
              </span>
            </div>
          </Link>

          {/* Related Posts */}
          <RelatedPosts currentId={article.id} />
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}

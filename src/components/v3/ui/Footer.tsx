"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { ARTICLES } from "@/lib/blog-data";
import { MetaStripIcon } from "@/components/shared/Logo";

/** Recycled from V2 — brand + link columns + badges, with the blur fade-in. */

const TOOLS = [
  { label: "Remove metadata from photos", href: "/remove-metadata-from-photos" },
  { label: "Strip EXIF data", href: "/strip-exif-data" },
  { label: "Remove GPS from photos", href: "/remove-gps-location-from-photos" },
  { label: "Remove author from PDF", href: "/remove-author-from-pdf" },
  { label: "Strip Word document metadata", href: "/strip-metadata-from-word-document" },
  { label: "Remove AI metadata (C2PA)", href: "/remove-ai-metadata" },
  { label: "Remove metadata before sharing", href: "/remove-metadata-before-sharing" },
];

const SITE = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy & Terms", href: "/privacy" },
  { label: "Prefer the terminal?", href: "/terminal" },
];

export function Footer() {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setRevealed(true); observer.disconnect(); } },
      { rootMargin: "0px 0px -120px 0px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <footer ref={ref} className="relative z-0 w-full lg:sticky lg:bottom-0">
      <div className="relative px-6 lg:px-12 pt-20 lg:pt-24 pb-12 overflow-hidden" style={{ background: "var(--bg)" }}>
        <div className="relative z-10 max-w-6xl mx-auto flex flex-col gap-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
            {/* Brand block */}
            <FadeIn revealed={revealed} delay={0} className="sm:col-span-2 lg:col-span-4">
              <Link href="/" className="inline-flex items-center gap-2.5 no-underline mb-5">
                <MetaStripIcon size={32} />
                <span className="font-extrabold text-[20px] tracking-[-0.02em]" style={{ color: "var(--text)" }}>
                  MetaStrip
                </span>
              </Link>
              <p className="text-[14px] leading-[1.65] mb-6 max-w-xs" style={{ color: "var(--text-secondary)" }}>
                Hidden metadata in your files: GPS, EXIF, AI tags, author names, gone in seconds. 100% in your browser. Free, open source.
              </p>
              <div className="flex gap-2">
                <IconButton href="https://github.com/lars-1987/metastrip" label="GitHub"><GitHubIcon /></IconButton>
                <IconButton href="https://x.com/larsitodev" label="X / Twitter"><XIcon /></IconButton>
                {/* mailto assembled on click so the address never sits in the static HTML */}
                <IconButton label="Email" onClick={() => { window.location.href = `mailto:${["hello", "metastrip.app"].join("@")}`; }}><MailIcon /></IconButton>
              </div>
            </FadeIn>

            <FadeIn revealed={revealed} delay={0.1} className="lg:col-span-3">
              <LinkColumn label="Tools" links={TOOLS} />
            </FadeIn>
            <FadeIn revealed={revealed} delay={0.2} className="lg:col-span-3">
              <LinkColumn label="Articles" links={ARTICLES.slice(0, 6).map((a) => ({ label: a.title, href: `/blog/${a.slug}` }))} />
            </FadeIn>
            <FadeIn revealed={revealed} delay={0.3} className="lg:col-span-2">
              <LinkColumn label="Site" links={SITE} />
            </FadeIn>
          </div>

          <FadeIn
            revealed={revealed}
            delay={0.4}
            className="flex flex-col md:flex-row items-center justify-between gap-3 pt-6 text-[12px]"
            style={{ borderTop: "1px solid var(--border)" }}
          >
            <p style={{ color: "var(--text-muted)" }}>MetaStrip · your files never leave your device.</p>
            <p className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1" style={{ color: "var(--text-muted)" }}>
              <span className="inline-flex items-center gap-1.5">
                Built with <CoffeeIcon /> in Melbourne
              </span>
              <span aria-hidden="true">·</span>
              <span>
                by{" "}
                <a
                  href="https://larsh.dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium no-underline transition-colors hover:text-[var(--text)]"
                  style={{ color: "var(--text-secondary)" }}
                >
                  larsh.dev
                </a>
              </span>
              <span aria-hidden="true">·</span>
              <span>MIT licensed</span>
            </p>
          </FadeIn>
        </div>
      </div>
    </footer>
  );
}

function FadeIn({ children, revealed, delay = 0, className, style }: {
  children: ReactNode; revealed: boolean; delay?: number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        opacity: revealed ? 1 : 0,
        transform: revealed ? "translateY(0)" : "translateY(-8px)",
        filter: revealed ? "blur(0)" : "blur(4px)",
        transition: `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s, filter 0.8s cubic-bezier(0.16,1,0.3,1) ${delay}s`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function LinkColumn({ label, links }: { label: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-[0.14em] mb-5" style={{ color: "var(--accent-strong)" }}>{label}</h3>
      <ul className="space-y-2.5 list-none p-0 m-0">
        {links.map((link) => (
          <li key={link.href + link.label}>
            <Link
              href={link.href}
              className="group flex items-center gap-1 text-[13px] no-underline transition-colors hover:text-[var(--text)]"
              style={{ color: "var(--text-secondary)" }}
            >
              <span className="line-clamp-2 transition-transform duration-200 ease-out group-hover:translate-x-1">{link.label}</span>
              <svg
                width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true"
                className="shrink-0 -translate-x-1.5 opacity-0 transition-all duration-200 ease-out group-hover:translate-x-0 group-hover:opacity-100"
              >
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function IconButton({ href, label, children, onClick }: { href?: string; label: string; children: ReactNode; onClick?: () => void }) {
  const isExternal = href ? /^https?:/.test(href) : false;
  const cls =
    "group flex h-9 w-9 items-center justify-center rounded-lg transition-[transform,background-color,color] duration-200 ease-out hover:-translate-y-0.5 hover:bg-[var(--primary)] hover:text-[var(--on-primary)]";
  const style = { color: "var(--text-secondary)", background: "var(--card-elevated)" } as React.CSSProperties;
  const inner = <span className="transition-transform duration-200 ease-out group-hover:scale-110">{children}</span>;

  if (!href) {
    return (
      <button type="button" onClick={onClick} aria-label={label} className={cls} style={style}>
        {inner}
      </button>
    );
  }
  return (
    <a
      href={href}
      {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      aria-label={label}
      className={cls}
      style={style}
    >
      {inner}
    </a>
  );
}

function CoffeeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="inline-block">
      <path d="M17 8h1.5a2.5 2.5 0 010 5H17" />
      <path d="M4 8h13v6a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" />
      <path d="M7 2.5v2M11 2.5v2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3 7l9 6 9-6" />
    </svg>
  );
}

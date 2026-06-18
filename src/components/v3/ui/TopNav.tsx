"use client";

import { useEffect, useState } from "react";
import { ThemeToggle } from "./ThemeToggle";
import { MetaStripIcon } from "@/components/shared/Logo";

function LogoMark() {
  return <MetaStripIcon size={35} />;
}

const ArrowRight = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const ArrowUpRight = (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
    <path d="M5 11L11 5M11 5H5.5M11 5v5.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LINKS = [
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "https://github.com/lars-1987/metastrip", label: "GitHub", external: true },
];

function NavPill({ href, label, external }: { href: string; label: string; external?: boolean }) {
  return (
    <a
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className="group relative inline-flex items-center overflow-hidden rounded-[var(--radius-pill)] bg-[var(--card-elevated)] px-7 py-2.5 text-[16px] text-[var(--text)] no-underline transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
    >
      <span className="transition-transform duration-300 ease-out group-hover:-translate-x-2">{label}</span>
      <span aria-hidden="true" className="pointer-events-none absolute right-4 flex translate-x-3 items-center opacity-0 transition-all duration-300 ease-out group-hover:translate-x-0 group-hover:opacity-100">
        {external ? ArrowUpRight : ArrowRight}
      </span>
    </a>
  );
}

function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[60] flex flex-col bg-[var(--bg)] px-6 py-5 transition-[opacity,visibility] duration-300 sm:hidden ${
        open ? "opacity-100 visible" : "pointer-events-none invisible opacity-0"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2.5">
          <LogoMark />
          <span className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--text)]">MetaStrip</span>
        </span>
        <button onClick={onClose} aria-label="Close menu" className="grid h-11 w-11 place-items-center text-[var(--text)]">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path d="M5 5l14 14M19 5L5 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <nav className="mt-auto mb-6 flex flex-col gap-1">
        {LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            {...(l.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            onClick={onClose}
            className="group flex items-baseline gap-4 no-underline"
            style={{
              opacity: open ? 1 : 0,
              transform: open ? "translateY(0)" : "translateY(12px)",
              transition: `opacity 0.5s ease ${0.08 + i * 0.06}s, transform 0.5s cubic-bezier(0.16,1,0.3,1) ${0.08 + i * 0.06}s`,
            }}
          >
            <span className="v3-mono text-[13px] text-[var(--text-muted)]">0{i + 1}</span>
            <span className="text-[clamp(40px,12vw,56px)] font-extrabold uppercase leading-[1.05] tracking-[-0.02em] text-[var(--text)] transition-opacity group-active:opacity-60">
              {l.label}
            </span>
          </a>
        ))}
      </nav>

      <div className="flex items-center gap-2.5">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: "#5b8f6a" }} />
        <span className="v3-mono text-[13px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Nothing ever leaves your browser</span>
      </div>
    </div>
  );
}

export function TopNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav className="mx-auto flex max-w-6xl items-center justify-between rounded-[var(--radius-pill)] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] px-5 py-3 backdrop-blur-xl">
        <a href="/" className="flex items-center gap-3 no-underline">
          <LogoMark />
          <span className="text-[21px] font-semibold tracking-[-0.01em] text-[var(--text)]">MetaStrip</span>
        </a>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />

          {/* desktop pills */}
          <div className="hidden items-center gap-1.5 sm:flex">
            {LINKS.map((l) => (
              <NavPill key={l.href} href={l.href} label={l.label} external={l.external} />
            ))}
          </div>

          {/* mobile hamburger */}
          <button
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            className="grid h-10 w-10 place-items-center rounded-[var(--radius-pill)] bg-[var(--card-elevated)] text-[var(--text)] sm:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

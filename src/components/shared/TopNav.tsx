"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "./ThemeProvider";
import { MetaStripIcon } from "./Logo";
import { GITHUB_REPO_URL } from "@/lib/constants";

const NAV_LINKS = [
  { label: "Blog", href: "/blog" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
];

export function TopNav() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Threshold of 4px so we don't flicker on rubber-band scroll
    const handler = () => setScrolled(window.scrollY > 4);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <nav
      className="sticky top-0 z-50 w-full transition-shadow duration-200"
      style={{
        background: "color-mix(in srgb, var(--bg) 72%, transparent)",
        backdropFilter: "blur(18px) saturate(160%)",
        WebkitBackdropFilter: "blur(18px) saturate(160%)",
        boxShadow: scrolled
          ? "0 10px 28px -10px rgba(31,21,48,0.22), 0 3px 8px -2px rgba(31,21,48,0.09)"
          : "none",
      }}
    >
      <div className="px-6 lg:px-10 h-[84px] flex items-center justify-between">
        {/* Wordmark with Alcove-style icon — bigger, tight border that hugs the icon */}
        <Link
          href="/"
          className="flex items-center gap-3.5 no-underline group"
          aria-label="MetaStrip home"
        >
          <span
            className="flex items-center justify-center"
            style={{
              padding: 1,
              borderRadius: 12,
              // Tight 1px border that sits flush against the icon's rounded edge
              boxShadow: "inset 0 0 0 1px var(--border-strong)",
            }}
          >
            <MetaStripIcon size={42} />
          </span>
          <span
            className="text-[22px] font-extrabold tracking-[-0.02em]"
            style={{ color: "var(--text)" }}
          >
            MetaStrip
          </span>
        </Link>

        {/* Right cluster */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map((l) => (
            <NavLink key={l.href} href={l.href}>
              {l.label}
            </NavLink>
          ))}

          <NavLink href={GITHUB_REPO_URL} external>
            GitHub
          </NavLink>

          <button
            onClick={toggle}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            className="ml-2 rounded-xl flex items-center justify-center transition-all"
            style={{
              background: "transparent",
              color: "var(--text-secondary)",
              border: "none",
              width: 38,
              height: 38,
              transition: "background-color 0.15s ease, color 0.15s ease, box-shadow 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-soft)";
              e.currentTarget.style.color = "var(--accent-strong)";
              e.currentTarget.style.boxShadow =
                "0 4px 14px rgba(31, 25, 14, 0.15), 0 1px 3px rgba(31, 25, 14, 0.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {theme === "light" ? <MoonIcon /> : <SunIcon />}
          </button>
        </div>
      </div>
    </nav>
  );
}

/* ──────────────────────────────────────────────────────────────────
   NavLink — pill-style hover effect (Alcove vibe).
   Inline-styled because hover with CSS-vars across themes needs JS,
   not Tailwind's static hover: variants.
   ────────────────────────────────────────────────────────────────── */

function NavLink({
  href,
  children,
  external,
}: {
  href: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const baseStyle: React.CSSProperties = {
    color: hovered ? "var(--text)" : "var(--text-secondary)",
    background: hovered ? "var(--accent-soft)" : "transparent",
    boxShadow: hovered
      ? "0 4px 14px rgba(31, 25, 14, 0.15), 0 1px 3px rgba(31, 25, 14, 0.08)"
      : "none",
    border: "none",
    transition: "background-color 0.15s ease, color 0.15s ease, box-shadow 0.2s ease",
  };
  const className =
    "hidden sm:inline-flex items-center px-4 py-2.5 rounded-xl text-[15px] font-semibold no-underline";

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        style={baseStyle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={className}
      style={baseStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {children}
    </Link>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M13.5 9.5C12.7 9.85 11.85 10 11 10C7.7 10 5 7.3 5 4C5 3.15 5.15 2.3 5.5 1.5C3 2.5 1 5 1 8C1 11.85 4.15 15 8 15C11 15 13.5 13 14.5 10.5L13.5 9.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.2" fill="currentColor" />
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="8" y1="1.5" x2="8" y2="3" />
        <line x1="8" y1="13" x2="8" y2="14.5" />
        <line x1="1.5" y1="8" x2="3" y2="8" />
        <line x1="13" y1="8" x2="14.5" y2="8" />
        <line x1="3.2" y1="3.2" x2="4.3" y2="4.3" />
        <line x1="11.7" y1="11.7" x2="12.8" y2="12.8" />
        <line x1="3.2" y1="12.8" x2="4.3" y2="11.7" />
        <line x1="11.7" y1="4.3" x2="12.8" y2="3.2" />
      </g>
    </svg>
  );
}

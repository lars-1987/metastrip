"use client";

import { useState } from "react";
import Link from "next/link";
import { MetaStripIcon } from "@/components/shared/Logo";
import { GITHUB_REPO_URL } from "@/lib/constants";
import { AUTHOR } from "@/lib/author";

/* Inline SVG icons, so nothing on the desktop loads from the network. */

function TerminalAppSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dock-term-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a22" />
          <stop offset="100%" stopColor="#0b0b12" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="52" height="44" rx="9" fill="url(#dock-term-bg)" stroke="#7c3aed" strokeWidth="1.5" />
      <circle cx="16" cy="18" r="2" fill="#ff5f57" />
      <circle cx="23" cy="18" r="2" fill="#febc2e" />
      <circle cx="30" cy="18" r="2" fill="#28c840" />
      <path d="M16 30L22 36L16 42" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="28" y1="42" x2="42" y2="42" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function KofiSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dock-kofi-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5e5b" />
          <stop offset="100%" stopColor="#e63946" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#dock-kofi-bg)" />
      <path d="M18 22H42V38C42 42.4 38.4 46 34 46H26C21.6 46 18 42.4 18 38V22Z" fill="white" opacity="0.95" />
      <path d="M42 26H46C48.2 26 50 27.8 50 30V32C50 34.2 48.2 36 46 36H42" stroke="white" strokeWidth="2.5" opacity="0.95" />
      <path d="M24 16C24 14 26 14 26 12C26 10 24 10 24 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M30 16C30 14 32 14 32 12C32 10 30 10 30 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M36 16C36 14 38 14 38 12C38 10 36 10 36 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function MailSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dock-mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#dock-mail-bg)" />
      <rect x="12" y="20" width="40" height="26" rx="3" fill="white" opacity="0.95" />
      <path d="M12 22L32 36L52 22" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

function MusicSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dock-music-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#dock-music-bg)" />
      <path d="M34 18V42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M34 18C40 20 44 24 44 30C44 32 43 34 42 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      <ellipse cx="28" cy="42" rx="6.5" ry="5" fill="white" transform="rotate(-22 28 42)" />
    </svg>
  );
}

function GitHubSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <rect x="4" y="8" width="56" height="48" rx="10" fill="#24292f" />
      <path
        transform="translate(18 18) scale(1.75)"
        fill="white"
        d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
      />
    </svg>
  );
}

function XSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <rect x="4" y="8" width="56" height="48" rx="10" fill="#0a0a0a" stroke="rgba(255,255,255,0.12)" />
      <path
        d="M38.5 18H43.5L33.9 28.98L45.2 44H36.3L29.4 34.97L21.5 44H16.5L26.75 32.25L16 18H25.1L31.35 26.22L38.5 18ZM36.75 41.1H39.5L24.4 20.75H21.45L36.75 41.1Z"
        fill="white"
      />
    </svg>
  );
}

function TrashSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="dock-trash-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#dock-trash-bg)" />
      <rect x="18" y="18" width="28" height="4" rx="1" fill="white" opacity="0.85" />
      <rect x="27" y="15" width="10" height="3" rx="1" fill="white" opacity="0.85" />
      <path d="M20 24H44L42 46C41.8 48.2 40 50 37.8 50H26.2C24 50 22.2 48.2 22 46L20 24Z" fill="white" opacity="0.9" />
      <line x1="27" y1="28" x2="27" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="28" x2="32" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
      <line x1="37" y1="28" x2="37" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function NewSiteIcon() {
  return (
    <span className="grid h-[52px] w-[52px] place-items-center">
      <MetaStripIcon size={46} />
    </span>
  );
}

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** Internal route (Link), or an external/mailto href. */
  route?: string;
  href?: string;
  /** Otherwise opens a terminal tab or a desktop window by this id. */
  open?: string;
  /** Draws the running-app dot. */
  running?: boolean;
}

const ITEMS: (DockItem | "divider")[] = [
  { id: "site", label: "metastrip.app (the new one)", icon: <NewSiteIcon />, route: "/" },
  { id: "terminal", label: "metastrip", icon: <TerminalAppSVG />, open: "metastrip", running: true },
  { id: "kofi", label: "buy me a coffee", icon: <KofiSVG />, open: "kofi" },
  { id: "mail", label: "hello@metastrip.app", icon: <MailSVG />, href: "mailto:hello@metastrip.app" },
  { id: "music", label: "music", icon: <MusicSVG />, open: "music" },
  { id: "github", label: "source code", icon: <GitHubSVG />, href: GITHUB_REPO_URL },
  { id: "x", label: "@larsitodev", icon: <XSVG />, href: AUTHOR.sameAs[0] },
  "divider",
  { id: "trash", label: "trash", icon: <TrashSVG />, open: "trash" },
];

const BOUNCE = "cubic-bezier(0.175, 0.885, 0.32, 2.2)";

function DockIcon({ item, onOpen }: { item: DockItem; onOpen: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const common = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    onFocus: () => setHovered(true),
    onBlur: () => setHovered(false),
    "aria-label": item.label,
    className: "relative flex items-center justify-center p-1 rounded-xl cursor-pointer focus-visible:outline-2 focus-visible:outline-white/60",
    style: {
      transition: `transform 400ms ${BOUNCE}`,
      transform: hovered ? "translateY(-10px) scale(1.15)" : "translateY(0) scale(1)",
    } as React.CSSProperties,
  };
  const inner = (
    <>
      <span
        className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-[family-name:var(--font-mono)] text-white/95 bg-black/65 backdrop-blur-md border border-white/[0.1] shadow-lg transition-opacity duration-150 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {item.label}
      </span>
      <span className="block drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">{item.icon}</span>
      {item.running && <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/60" />}
    </>
  );

  if (item.route) return <Link href={item.route} {...common}>{inner}</Link>;
  if (item.href) {
    const external = /^https?:/.test(item.href);
    return (
      <a href={item.href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})} {...common}>
        {inner}
      </a>
    );
  }
  return (
    <button type="button" onClick={() => item.open && onOpen(item.open)} {...common}>
      {inner}
    </button>
  );
}

/** The dock: liquid-glass pill along the bottom. Hidden below lg. */
export function Dock({ onOpen }: { onOpen: (id: string) => void }) {
  return (
    <>
      {/* Glass distortion, dialled right down so it refracts rather than smears. */}
      <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
        <defs>
          <filter id="dock-glass" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="turbulence" />
            <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
            <feDisplacementMap in="SourceGraphic" in2="softMap" scale="15" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      </svg>
      <nav aria-label="Dock" className="fixed bottom-3 left-1/2 -translate-x-1/2 z-[150] hidden lg:block">
        <div
          className="relative rounded-[28px] px-3 py-2 border border-white/[0.12]"
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)" }}
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] overflow-hidden"
            style={{
              backdropFilter: "blur(18px) saturate(180%)",
              WebkitBackdropFilter: "blur(18px) saturate(180%)",
              filter: "url(#dock-glass)",
              isolation: "isolate",
            }}
          />
          <div aria-hidden="true" className="absolute inset-0 rounded-[28px]" style={{ background: "rgba(22, 18, 40, 0.35)" }} />
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{ boxShadow: "inset 1.5px 1.5px 1px 0 rgba(255,255,255,0.35), inset -1px -1px 1px 1px rgba(255,255,255,0.08)" }}
          />
          <div className="relative flex items-end gap-1.5">
            {ITEMS.map((item, i) =>
              item === "divider" ? (
                <span key={`d${i}`} aria-hidden="true" className="mx-1 mb-2 h-11 w-px self-center bg-white/20" />
              ) : (
                <DockIcon key={item.id} item={item} onOpen={onOpen} />
              )
            )}
          </div>
        </div>
      </nav>
    </>
  );
}

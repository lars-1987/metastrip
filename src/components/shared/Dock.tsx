"use client";

import { useState } from "react";

/* ═══════════════════════════════════════════════════════════════════
   ICONS — inline SVGs so nothing ships over the network
   ═══════════════════════════════════════════════════════════════════ */

function TerminalAppSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="term-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a1a22" />
          <stop offset="100%" stopColor="#0b0b12" />
        </linearGradient>
      </defs>
      <rect x="6" y="10" width="52" height="44" rx="9" fill="url(#term-bg)" stroke="#7c3aed" strokeWidth="1.5" />
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
        <linearGradient id="kofi-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ff5e5b" />
          <stop offset="100%" stopColor="#e63946" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#kofi-bg)" />
      {/* Cup body */}
      <path d="M18 22H42V38C42 42.4 38.4 46 34 46H26C21.6 46 18 42.4 18 38V22Z" fill="white" opacity="0.95" />
      {/* Handle */}
      <path d="M42 26H46C48.2 26 50 27.8 50 30V32C50 34.2 48.2 36 46 36H42" stroke="white" strokeWidth="2.5" fill="none" opacity="0.95" />
      {/* Steam */}
      <path d="M24 16C24 14 26 14 26 12C26 10 24 10 24 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M30 16C30 14 32 14 32 12C32 10 30 10 30 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M36 16C36 14 38 14 38 12C38 10 36 10 36 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      {/* Saucer */}
      <ellipse cx="30" cy="48" rx="14" ry="2" fill="white" opacity="0.3" />
    </svg>
  );
}

function TrashSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="trash-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4b5563" />
          <stop offset="100%" stopColor="#1f2937" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#trash-bg)" />
      {/* Lid */}
      <rect x="18" y="18" width="28" height="4" rx="1" fill="white" opacity="0.85" />
      <rect x="27" y="15" width="10" height="3" rx="1" fill="white" opacity="0.85" />
      {/* Bin body */}
      <path d="M20 24H44L42 46C41.8 48.2 40 50 37.8 50H26.2C24 50 22.2 48.2 22 46L20 24Z" fill="white" opacity="0.9" />
      {/* Ridges */}
      <line x1="27" y1="28" x2="27" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
      <line x1="32" y1="28" x2="32" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
      <line x1="37" y1="28" x2="37" y2="46" stroke="#1f2937" strokeWidth="1" opacity="0.4" />
    </svg>
  );
}

function XSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="x-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1f1f1f" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#x-bg)" />
      {/* X logo path (official X glyph proportions, scaled + centred) */}
      <path
        d="M38.5 18H43.5L33.9 28.98L45.2 44H36.3L29.4 34.97L21.5 44H16.5L26.75 32.25L16 18H25.1L31.35 26.22L38.5 18ZM36.75 41.1H39.5L24.4 20.75H21.45L36.75 41.1Z"
        fill="white"
      />
    </svg>
  );
}

function MusicSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="music-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#a855f7" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#music-bg)" />
      {/* Stem */}
      <path d="M34 18V42" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      {/* Flag */}
      <path d="M34 18C40 20 44 24 44 30C44 32 43 34 42 35" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Note head */}
      <ellipse cx="28" cy="42" rx="6.5" ry="5" fill="white" transform="rotate(-22 28 42)" />
    </svg>
  );
}

function MailSVG() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none">
      <defs>
        <linearGradient id="mail-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#60a5fa" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
      </defs>
      <rect x="4" y="8" width="56" height="48" rx="10" fill="url(#mail-bg)" />
      {/* Envelope body */}
      <rect x="12" y="20" width="40" height="26" rx="3" fill="white" opacity="0.95" />
      {/* Fold lines */}
      <path d="M12 22L32 36L52 22" stroke="#2563eb" strokeWidth="2" strokeLinejoin="round" fill="none" />
      <path d="M12 46L26 32" stroke="#2563eb" strokeWidth="1.5" opacity="0.4" fill="none" />
      <path d="M52 46L38 32" stroke="#2563eb" strokeWidth="1.5" opacity="0.4" fill="none" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   GLASS DISTORTION FILTER — dialed way down from the 21st.dev demo
   (scale=15 instead of 200, so it refracts subtly rather than smearing)
   ═══════════════════════════════════════════════════════════════════ */

function GlassFilter() {
  return (
    <svg aria-hidden="true" style={{ position: "absolute", width: 0, height: 0 }}>
      <defs>
        <filter id="dock-glass" x="0%" y="0%" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.012" numOctaves="2" seed="7" result="turbulence" />
          <feGaussianBlur in="turbulence" stdDeviation="2" result="softMap" />
          <feDisplacementMap in="SourceGraphic" in2="softMap" scale="15" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DOCK
   ═══════════════════════════════════════════════════════════════════ */

interface DockItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  /** If set, opens in a new tab; otherwise calls onOpen with tabType/tabLabel */
  href?: string;
  tabType?: string;
  tabLabel?: string;
}

const ITEMS: DockItem[] = [
  { id: "app", label: "metastrip.app", icon: <TerminalAppSVG />, tabType: "metastrip", tabLabel: "metastrip" },
  { id: "kofi", label: "buy me a coffee", icon: <KofiSVG />, tabType: "kofi", tabLabel: "buy me a coffee ☕" },
  { id: "mail", label: "hello@metastrip.app", icon: <MailSVG />, href: "mailto:hello@metastrip.app" },
  { id: "music", label: "music", icon: <MusicSVG />, tabType: "music", tabLabel: "music" },
  { id: "x", label: "@larsitodev", icon: <XSVG />, href: "https://x.com/larsitodev" },
  { id: "trash", label: "trash", icon: <TrashSVG />, tabType: "trash", tabLabel: "trash" },
];

const BOUNCE = "cubic-bezier(0.175, 0.885, 0.32, 2.2)";

function DockIcon({
  item,
  onOpen,
}: {
  item: DockItem;
  onOpen?: (type: string, label: string) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const sharedClass = "relative group flex items-center justify-center p-1 rounded-xl cursor-pointer";
  const sharedStyle: React.CSSProperties = {
    transition: `transform 400ms ${BOUNCE}`,
    transform: hovered ? "translateY(-10px) scale(1.15)" : "translateY(0) scale(1)",
  };

  const inner = (
    <>
      {/* Tooltip */}
      <span
        className={`pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap px-2.5 py-1 rounded-md text-[11px] font-[family-name:var(--font-mono)] text-white/95 bg-black/65 backdrop-blur-md border border-white/[0.1] shadow-lg transition-opacity duration-150 ${
          hovered ? "opacity-100" : "opacity-0"
        }`}
      >
        {item.label}
      </span>

      {/* Icon with drop-shadow */}
      <span className="block drop-shadow-[0_6px_10px_rgba(0,0,0,0.55)]">
        {item.icon}
      </span>

      {/* Running-app dot — only for in-app items */}
      {!item.href && (
        <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/50" />
      )}
    </>
  );

  if (item.href) {
    const isExternal = /^https?:/.test(item.href);
    return (
      <a
        href={item.href}
        {...(isExternal ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={sharedClass}
        style={sharedStyle}
        aria-label={item.label}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={() => item.tabType && onOpen?.(item.tabType, item.tabLabel ?? item.label)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={sharedClass}
      style={sharedStyle}
      aria-label={item.label}
    >
      {inner}
    </button>
  );
}

export function Dock({
  onOpenTab,
}: {
  onOpenTab?: (type: string, label: string) => void;
}) {
  return (
    <>
      <GlassFilter />
      <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 hidden lg:block">
        {/* Outer glass pill — layered for liquid-glass feel */}
        <div
          className="relative rounded-[28px] px-3 py-2 border border-white/[0.12]"
          style={{
            boxShadow:
              "0 10px 40px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.3)",
          }}
        >
          {/* Refraction layer — backdrop blur + displacement filter */}
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
          {/* Tint layer — subtle dark-mode wash so content underneath doesn't dominate */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px]"
            style={{ background: "rgba(22, 18, 40, 0.35)" }}
          />
          {/* Highlight layer — the "lens edge" shimmer */}
          <div
            aria-hidden="true"
            className="absolute inset-0 rounded-[28px] pointer-events-none"
            style={{
              boxShadow:
                "inset 1.5px 1.5px 1px 0 rgba(255,255,255,0.35), inset -1px -1px 1px 1px rgba(255,255,255,0.08)",
            }}
          />

          {/* Icons */}
          <div className="relative flex items-end gap-1.5">
            {ITEMS.map((item) => (
              <DockIcon key={item.id} item={item} onOpen={onOpenTab} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

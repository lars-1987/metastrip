"use client";

import { MetaStripIcon } from "./Logo";
import { useClock } from "@/hooks/useClock";

/* ── Small status icons (inline SVGs, no network) ── */

function WifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 5.5C3 3.5 5.3 2.5 8 2.5C10.7 2.5 13 3.5 15 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M3 8C4.5 6.5 6.2 5.75 8 5.75C9.8 5.75 11.5 6.5 13 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <path d="M5 10.5C6 9.5 7 9 8 9C9 9 10 9.5 11 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" fill="none" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.8" />
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" fill="none" />
      <line x1="11" y1="11" x2="14.5" y2="14.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ControlCentreIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="1" y="2" width="14" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <rect x="1" y="9" width="14" height="5" rx="2.5" stroke="currentColor" strokeWidth="1.2" fill="none" />
      <circle cx="4" cy="4.5" r="1" fill="currentColor" />
      <circle cx="12" cy="11.5" r="1" fill="currentColor" />
    </svg>
  );
}

/* ── Menubar ── */

const MENUS = ["File", "Edit", "View", "Window", "Help"];

export function MenuBar() {
  const now = useClock();
  const date = now
    ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    : "";
  const time = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "";

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 hidden lg:flex items-center h-7 px-3 text-[12px] text-white/90 font-[family-name:var(--font-outfit)] select-none"
      style={{
        background: "rgba(18, 14, 35, 0.55)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Left cluster */}
      <div className="flex items-center gap-4">
        <span className="flex items-center" aria-label="MetaStrip">
          <MetaStripIcon size={14} />
        </span>
        <span className="font-semibold text-white/95 tracking-tight">metastrip</span>
        {MENUS.map((m) => (
          <span
            key={m}
            className="text-white/80 hover:text-white cursor-default transition-colors"
          >
            {m}
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right cluster — system icons + date/time */}
      <div className="flex items-center gap-3.5 text-white/95">
        <span className="text-[11px] tracking-tight opacity-80" title="Privacy-first">🔒</span>
        <span aria-label="Battery"><BatteryIcon /></span>
        <span aria-label="WiFi"><WifiIcon /></span>
        <span aria-label="Spotlight Search"><SearchIcon /></span>
        <span aria-label="Control Centre"><ControlCentreIcon /></span>
        <span
          className="tabular-nums text-[11.5px] text-white/95 tracking-tight"
          suppressHydrationWarning
        >
          {date}{date && time ? "  " : ""}{time}
        </span>
      </div>
    </div>
  );
}

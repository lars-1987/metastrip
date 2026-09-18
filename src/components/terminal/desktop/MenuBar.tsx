"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MetaStripIcon } from "@/components/shared/Logo";
import { useClock } from "@/hooks/useClock";
import { GITHUB_REPO_URL } from "@/lib/constants";

type MenuItem =
  | "divider"
  | { label: string; onSelect?: () => void; href?: string; external?: boolean; disabled?: boolean; title?: string };

interface Menu {
  id: string;
  label: React.ReactNode;
  ariaLabel: string;
  bold?: boolean;
  items: MenuItem[];
}

interface MenuBarProps {
  onAbout: () => void;
  onShutDown: () => void;
  onNewTab: () => void;
  onOpenTab: (type: "metastrip" | "kofi" | "privacy" | "about" | "blog", label: string) => void;
  onOpenWindow: (id: string) => void;
}

function WifiIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M1 5.5C3 3.5 5.3 2.5 8 2.5C10.7 2.5 13 3.5 15 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M3 8C4.5 6.5 6.2 5.75 8 5.75C9.8 5.75 11.5 6.5 13 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5 10.5C6 9.5 7 9 8 9C9 9 10 9.5 11 10.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="8" cy="13" r="1" fill="currentColor" />
    </svg>
  );
}

function BatteryIcon() {
  return (
    <svg width="22" height="12" viewBox="0 0 24 12" fill="none" aria-hidden="true">
      <rect x="0.5" y="1" width="20" height="10" rx="2" stroke="currentColor" strokeWidth="1" opacity="0.8" />
      <rect x="2" y="2.5" width="14" height="7" rx="1" fill="currentColor" opacity="0.85" />
      <rect x="21" y="4" width="2" height="4" rx="0.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

/** A macOS-style menubar. The logo and app menus work; Edit is there to be
 *  tried. Hidden below lg, where the terminal has the screen to itself. */
export function MenuBar({ onAbout, onShutDown, onNewTab, onOpenTab, onOpenWindow }: MenuBarProps) {
  const now = useClock();
  const [openId, setOpenId] = useState<string | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!openId) return;
    const onPointer = (e: PointerEvent) => {
      if (!barRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenId(null);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [openId]);

  const menus: Menu[] = [
    {
      id: "logo",
      label: <MetaStripIcon size={15} />,
      ariaLabel: "MetaStrip menu",
      items: [
        { label: "About This MetaStrip", onSelect: onAbout },
        "divider",
        { label: "Back to metastrip.app", href: "/" },
        "divider",
        { label: "Shut Down…", onSelect: onShutDown },
      ],
    },
    {
      id: "app",
      label: "metastrip",
      ariaLabel: "metastrip",
      bold: true,
      items: [
        { label: "New Tab", onSelect: onNewTab },
        { label: "Privacy & Use", onSelect: () => onOpenTab("privacy", "privacy & use") },
        { label: "Buy Me a Coffee", onSelect: () => onOpenTab("kofi", "buy me a coffee ☕") },
      ],
    },
    {
      id: "file",
      label: "File",
      ariaLabel: "File",
      items: [
        { label: "New Tab", onSelect: onNewTab },
        { label: "Open photo.jpg", onSelect: () => onOpenWindow("photo") },
        { label: "Open uploads/", onSelect: () => onOpenWindow("uploads") },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      ariaLabel: "Edit",
      items: [
        { label: "Undo Metadata Removal", disabled: true, title: "Can't. It's gone." },
        { label: "Paste GPS Back In", disabled: true, title: "We didn't keep it." },
        "divider",
        { label: "Select All Metadata", onSelect: () => onOpenTab("metastrip", "metastrip") },
      ],
    },
    {
      id: "view",
      label: "View",
      ariaLabel: "View",
      items: [
        { label: "Show Hidden Files", onSelect: () => onOpenWindow("env") },
        { label: "Show node_modules", onSelect: () => onOpenWindow("nodemodules") },
      ],
    },
    {
      id: "help",
      label: "Help",
      ariaLabel: "Help",
      items: [
        { label: "MetaStrip Help", onSelect: () => onOpenTab("about", "about") },
        { label: "Report an Issue…", href: `${GITHUB_REPO_URL}/issues`, external: true },
      ],
    },
  ];

  const date = now ? now.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }) : "";
  const time = now ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }) : "";

  const itemClass =
    "flex w-full items-center rounded-[5px] px-2.5 py-[3px] text-left text-[13px] text-white/90 hover:bg-[#3b82f6] hover:text-white focus-visible:bg-[#3b82f6] focus-visible:outline-none";

  return (
    <div
      ref={barRef}
      className="fixed top-0 left-0 right-0 z-[200] hidden lg:flex items-center h-7 px-3 text-[13px] text-white/90 select-none"
      style={{
        background: "rgba(18, 14, 35, 0.55)",
        backdropFilter: "blur(16px) saturate(180%)",
        WebkitBackdropFilter: "blur(16px) saturate(180%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <nav className="flex items-center gap-0.5" aria-label="Desktop menu">
        {menus.map((m) => (
          <div key={m.id} className="relative">
            <button
              type="button"
              aria-haspopup="menu"
              aria-expanded={openId === m.id}
              aria-label={m.ariaLabel}
              onClick={() => setOpenId(openId === m.id ? null : m.id)}
              // macOS behaviour: once a menu is open, hovering another opens it.
              onMouseEnter={() => openId && openId !== m.id && setOpenId(m.id)}
              className={`flex h-[22px] items-center rounded-[5px] px-2.5 ${m.bold ? "font-semibold" : ""} ${
                openId === m.id ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              {m.label}
            </button>
            {openId === m.id && (
              <div
                role="menu"
                aria-label={m.ariaLabel}
                className="absolute left-0 top-[26px] min-w-[230px] rounded-lg border border-white/[0.12] p-[5px]"
                style={{
                  background: "rgba(34, 30, 52, 0.82)",
                  backdropFilter: "blur(24px) saturate(180%)",
                  WebkitBackdropFilter: "blur(24px) saturate(180%)",
                  boxShadow: "0 14px 40px rgba(0,0,0,0.5)",
                }}
              >
                {m.items.map((it, i) =>
                  it === "divider" ? (
                    <div key={i} className="my-[5px] h-px bg-white/10" role="separator" />
                  ) : it.disabled ? (
                    <div key={i} role="menuitem" aria-disabled="true" title={it.title} className="px-2.5 py-[3px] text-[13px] text-white/35 cursor-default">
                      {it.label}
                    </div>
                  ) : it.href && !it.external ? (
                    <Link key={i} role="menuitem" href={it.href} className={itemClass}>
                      {it.label}
                    </Link>
                  ) : it.href ? (
                    <a key={i} role="menuitem" href={it.href} target="_blank" rel="noopener noreferrer" className={itemClass} onClick={() => setOpenId(null)}>
                      {it.label}
                    </a>
                  ) : (
                    <button
                      key={i}
                      type="button"
                      role="menuitem"
                      className={itemClass}
                      onClick={() => {
                        setOpenId(null);
                        it.onSelect?.();
                      }}
                    >
                      {it.label}
                    </button>
                  )
                )}
              </div>
            )}
          </div>
        ))}
        <span className="px-2.5 text-white/80 cursor-default">Window</span>
      </nav>

      <div className="flex-1" />

      <div className="flex items-center gap-3.5 text-white/95">
        <span className="text-[11px] opacity-80" title="Privacy-first">🔒</span>
        <span aria-label="Battery"><BatteryIcon /></span>
        <span aria-label="Wi-Fi"><WifiIcon /></span>
        <span className="tabular-nums text-[12px] tracking-tight" suppressHydrationWarning>
          {date}{date && time ? "  " : ""}{time}
        </span>
      </div>
    </div>
  );
}

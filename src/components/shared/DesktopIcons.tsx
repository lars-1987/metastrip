"use client";

import { useState, useCallback, useRef, useEffect } from "react";

/* ── macOS-style folder icon ── */
function FolderSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
      {/* Back panel */}
      <path
        d="M8 16C8 13.7909 9.79086 12 12 12H24.6863C25.7472 12 26.7646 12.4214 27.5147 13.1716L30 15.6569H52C54.2091 15.6569 56 17.4477 56 19.6569V48C56 50.2091 54.2091 52 52 52H12C9.79086 52 8 50.2091 8 48V16Z"
        fill="#5B9BD5"
        opacity="0.85"
      />
      {/* Front panel */}
      <path
        d="M4 22C4 20.3431 5.34315 19 7 19H57C58.6569 19 60 20.3431 60 22V50C60 51.6569 58.6569 53 57 53H7C5.34315 53 4 51.6569 4 50V22Z"
        fill="#6CB4EE"
        opacity="0.9"
      />
      {/* Highlight */}
      <path
        d="M4 22C4 20.3431 5.34315 19 7 19H57C58.6569 19 60 20.3431 60 22V25H4V22Z"
        fill="white"
        opacity="0.15"
      />
    </svg>
  );
}

/* ── macOS-style file icon ── */
function FileSVG({ accent = "#a78bfa" }: { accent?: string }) {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
      {/* Paper body */}
      <path
        d="M16 8H40L52 20V56H16C13.7909 56 12 54.2091 12 52V12C12 9.79086 13.7909 8 16 8Z"
        fill="#2a2a32"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      {/* Dog ear */}
      <path d="M40 8V20H52" fill="#1e1e24" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Content lines */}
      <line x1="20" y1="30" x2="44" y2="30" stroke={accent} strokeWidth="1.5" opacity="0.4" />
      <line x1="20" y1="36" x2="38" y2="36" stroke={accent} strokeWidth="1.5" opacity="0.25" />
      <line x1="20" y1="42" x2="40" y2="42" stroke={accent} strokeWidth="1.5" opacity="0.25" />
    </svg>
  );
}

/* ── Image file icon ── */
function ImageSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
      <rect x="8" y="10" width="48" height="44" rx="4" fill="#2a2a32" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      {/* Mountain/landscape */}
      <path d="M8 44L22 28L34 40L42 32L56 44V50C56 52.2091 54.2091 54 52 54H12C9.79086 54 8 52.2091 8 50V44Z" fill="#4ade80" opacity="0.3" />
      {/* Sun */}
      <circle cx="44" cy="22" r="5" fill="#fbbf24" opacity="0.5" />
    </svg>
  );
}

/* ── Lock/shield file icon ── */
function LockFileSVG() {
  return (
    <svg width="56" height="56" viewBox="0 0 64 64" fill="none">
      <path
        d="M16 8H40L52 20V56H16C13.7909 56 12 54.2091 12 52V12C12 9.79086 13.7909 8 16 8Z"
        fill="#2a2a32"
        stroke="rgba(255,255,255,0.12)"
        strokeWidth="1"
      />
      <path d="M40 8V20H52" fill="#1e1e24" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      {/* Lock */}
      <rect x="24" y="34" width="16" height="12" rx="2" fill="#4ade80" opacity="0.4" stroke="#4ade80" strokeWidth="1" strokeOpacity="0.6" />
      <path d="M28 34V30C28 27.7909 29.7909 26 32 26C34.2091 26 36 27.7909 36 30V34" stroke="#4ade80" strokeWidth="1.5" opacity="0.5" />
      <circle cx="32" cy="40" r="1.5" fill="#4ade80" opacity="0.7" />
    </svg>
  );
}

/* ── Icon data ── */
interface DesktopIconData {
  id: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  defaultX: number; // percentage from left
  defaultY: number; // percentage from top
  /** Tab type to open on double-click */
  tabType?: string;
  tabLabel?: string;
}

const ICONS: DesktopIconData[] = [
  {
    id: "privacy",
    label: "privacy.txt",
    icon: <LockFileSVG />,
    defaultX: 2.5,
    defaultY: 8,
    tabType: "privacy",
    tabLabel: "privacy & use",
  },
  {
    id: "uploads",
    label: "uploads",
    icon: <FolderSVG />,
    defaultX: 92,
    defaultY: 6,
    tabType: "uploads",
    tabLabel: "uploads/",
  },
  {
    id: "readme",
    label: "README.md",
    icon: <FileSVG accent="#06b6d4" />,
    defaultX: 2,
    defaultY: 72,
    tabType: "about",
    tabLabel: "about",
  },
  {
    id: "env",
    label: ".env",
    icon: <FileSVG accent="#f472b6" />,
    defaultX: 2,
    defaultY: 40,
    tabType: "env",
    tabLabel: ".env",
  },
  {
    id: "nodemodules",
    label: "node_modules",
    sublabel: "47 GB",
    icon: <FolderSVG />,
    defaultX: 92,
    defaultY: 40,
    tabType: "nodemodules",
    tabLabel: "node_modules/",
  },
  {
    id: "photo",
    label: "photo.jpg",
    icon: <ImageSVG />,
    defaultX: 92.5,
    defaultY: 22,
    tabType: "photo",
    tabLabel: "photo.jpg",
  },
];

/* ── Draggable icon component ── */
function DraggableIcon({ data, onOpen, onDropOnTerminal, onDragStateChange }: { data: DesktopIconData; onOpen?: (type: string, label: string) => void; onDropOnTerminal?: (iconId: string) => void; onDragStateChange?: (dragging: boolean) => void }) {
  const [pos, setPos] = useState({ x: data.defaultX, y: data.defaultY });
  const [dragging, setDragging] = useState(false);
  const [selected, setSelected] = useState(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const didDrag = useRef(false);
  const iconRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(true);
    setSelected(true);
    didDrag.current = false;
    onDragStateChange?.(true);

    const rect = iconRef.current?.getBoundingClientRect();
    if (rect) {
      dragOffset.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }

    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging) return;
    didDrag.current = true;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const newX = ((e.clientX - dragOffset.current.x) / vw) * 100;
    const newY = ((e.clientY - dragOffset.current.y) / vh) * 100;
    setPos({
      x: Math.max(0, Math.min(95, newX)),
      y: Math.max(0, Math.min(92, newY)),
    });
  }, [dragging]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    setDragging(false);
    onDragStateChange?.(false);
    // Check if a droppable icon was dropped over the terminal
    if (didDrag.current && data.id === "photo" && onDropOnTerminal) {
      const terminalEl = document.querySelector("[data-terminal-window]");
      if (terminalEl) {
        const rect = terminalEl.getBoundingClientRect();
        if (
          e.clientX >= rect.left &&
          e.clientX <= rect.right &&
          e.clientY >= rect.top &&
          e.clientY <= rect.bottom
        ) {
          onDropOnTerminal(data.id);
          // Snap icon back to original position
          setPos({ x: data.defaultX, y: data.defaultY });
        }
      }
    }
  }, [data.id, data.defaultX, data.defaultY, onDropOnTerminal]);

  const handleDoubleClick = useCallback(() => {
    if (didDrag.current) return; // don't open if user was dragging
    if (data.tabType && onOpen) {
      onOpen(data.tabType, data.tabLabel ?? data.label);
    }
  }, [data.tabType, data.tabLabel, data.label, onOpen]);

  // Deselect when clicking elsewhere
  useEffect(() => {
    if (!selected) return;
    function handleClickOutside(e: MouseEvent) {
      if (iconRef.current && !iconRef.current.contains(e.target as Node)) {
        setSelected(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selected]);

  return (
    <div
      ref={iconRef}
      className={`absolute flex flex-col items-center gap-0.5 cursor-grab select-none transition-shadow duration-150 ${
        dragging ? "cursor-grabbing" : ""
      }`}
      style={{
        left: `${pos.x}%`,
        top: `${pos.y}%`,
        opacity: dragging ? 1 : 0.85,
        zIndex: dragging ? 9999 : 0,
        transition: dragging ? "none" : "opacity 0.3s ease",
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDoubleClick={handleDoubleClick}
    >
      {/* Icon */}
      <div
        className={`transition-transform duration-150 ${
          dragging ? "scale-110" : "hover:scale-105"
        }`}
      >
        {data.icon}
      </div>

      {/* Label */}
      <span
        className={`text-[11px] font-[family-name:var(--font-mono)] whitespace-nowrap px-1.5 py-0.5 rounded ${
          selected
            ? "bg-[#3b82f6]/30 text-white/95"
            : "text-white/60 hover:text-white/80"
        } transition-all duration-150`}
      >
        {data.label}
      </span>
      {data.sublabel && (
        <span className="text-[9px] font-[family-name:var(--font-mono)] text-white/35 -mt-0.5">
          {data.sublabel}
        </span>
      )}
    </div>
  );
}

/* ── Desktop container ── */
export function DesktopIcons({ onOpenTab, onDropOnTerminal }: { onOpenTab?: (type: string, label: string) => void; onDropOnTerminal?: (iconId: string) => void }) {
  const [anyDragging, setAnyDragging] = useState(false);

  return (
    <div
      className="fixed inset-0 hidden lg:block"
      style={{ zIndex: anyDragging ? 50 : 0, pointerEvents: anyDragging ? "auto" : undefined }}
    >
      {ICONS.map((icon) => (
        <DraggableIcon key={icon.id} data={icon} onOpen={onOpenTab} onDropOnTerminal={onDropOnTerminal} onDragStateChange={setAnyDragging} />
      ))}
    </div>
  );
}

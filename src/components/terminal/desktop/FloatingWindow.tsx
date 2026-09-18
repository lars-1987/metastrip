"use client";

import { useCallback, useRef, useState } from "react";

interface FloatingWindowProps {
  title: string;
  children: React.ReactNode;
  initialX: number;
  initialY: number;
  width?: number;
  /** Stacking order; the most recently focused window is highest. */
  z: number;
  onFocus: () => void;
  onClose: () => void;
}

/** A small draggable joke window on the desktop. */
export function FloatingWindow({ title, children, initialX, initialY, width = 360, z, onFocus, onClose }: FloatingWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      if ((e.target as HTMLElement).closest("button")) return;
      setDragging(true);
      dragStart.current = { mouseX: e.clientX, mouseY: e.clientY, posX: pos.x, posY: pos.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      // Keep the title bar on screen so a window can never be lost off an edge.
      const x = dragStart.current.posX + (e.clientX - dragStart.current.mouseX);
      const y = dragStart.current.posY + (e.clientY - dragStart.current.mouseY);
      setPos({
        x: Math.min(Math.max(x, 40 - width), window.innerWidth - 40),
        y: Math.min(Math.max(y, 28), window.innerHeight - 40),
      });
    },
    [dragging, width]
  );

  return (
    <div
      role="dialog"
      aria-label={title}
      className="fixed pointer-events-auto animate-card-slide-in"
      style={{ left: pos.x, top: pos.y, width, zIndex: z }}
      onPointerDown={onFocus}
    >
      <div
        className="rounded-xl overflow-hidden border border-white/[0.1] bg-[#1a1a1e] flex flex-col"
        style={{ boxShadow: "0 25px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)" }}
      >
        <div
          className="h-9 flex items-center px-3 bg-white/[0.04] border-b border-white/[0.06] select-none shrink-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={() => setDragging(false)}
        >
          <div className="flex items-center gap-1.5 mr-2">
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border-none p-0 cursor-pointer hover:brightness-110"
              style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }}
            />
            <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }} />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }} />
          </div>
          <span className="flex-1 text-center text-[10px] text-white/40 font-[family-name:var(--font-mono)] truncate">{title}</span>
          <div className="w-[42px]" />
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

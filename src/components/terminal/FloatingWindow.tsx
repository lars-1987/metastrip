"use client";

import { useState, useCallback, useRef } from "react";

interface FloatingWindowProps {
  title: string;
  children: React.ReactNode;
  initialX?: number;
  initialY?: number;
  width?: number;
  onClose: () => void;
}

export function FloatingWindow({
  title,
  children,
  initialX = 200,
  initialY = 150,
  width = 360,
  onClose,
}: FloatingWindowProps) {
  const [pos, setPos] = useState({ x: initialX, y: initialY });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      // Don't start drag if clicking close button
      if ((e.target as HTMLElement).closest("button")) return;

      setDragging(true);
      dragStart.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        posX: pos.x,
        posY: pos.y,
      };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [pos]
  );

  const handleDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging) return;
      setPos({
        x: dragStart.current.posX + (e.clientX - dragStart.current.mouseX),
        y: dragStart.current.posY + (e.clientY - dragStart.current.mouseY),
      });
    },
    [dragging]
  );

  const handleDragEnd = useCallback(() => {
    setDragging(false);
  }, []);

  return (
    <div
      className="fixed z-[50] pointer-events-auto animate-card-slide-in"
      style={{
        left: pos.x,
        top: pos.y,
        width,
      }}
    >
      <div
        className="rounded-xl overflow-hidden border border-white/[0.1] bg-[#1a1a1e] flex flex-col"
        style={{
          boxShadow:
            "0 25px 60px -12px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)",
        }}
      >
        {/* Title bar */}
        <div
          className="h-9 flex items-center px-3 bg-white/[0.04] border-b border-white/[0.06] select-none shrink-0 cursor-grab active:cursor-grabbing"
          onPointerDown={handleDragStart}
          onPointerMove={handleDragMove}
          onPointerUp={handleDragEnd}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5 mr-2">
            <button
              onClick={onClose}
              className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] border-none p-0 cursor-pointer hover:brightness-110 transition-all"
              style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full bg-[#febc2e]"
              style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }}
            />
            <div
              className="w-2.5 h-2.5 rounded-full bg-[#28c840]"
              style={{ boxShadow: "inset 0 -1px 1px rgba(0,0,0,0.2)" }}
            />
          </div>

          {/* Title */}
          <span className="flex-1 text-center text-[10px] text-white/40 font-[family-name:var(--font-mono)] truncate">
            {title}
          </span>

          {/* Spacer */}
          <div className="w-[42px]" />
        </div>

        {/* Content */}
        <div className="p-4 max-h-[400px] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

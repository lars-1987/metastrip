"use client";

interface TerminalTitleBarProps {
  onDragStart?: (e: React.PointerEvent) => void;
}

export function TerminalTitleBar({ onDragStart }: TerminalTitleBarProps) {
  return (
    <div
      className="h-11 flex items-center px-4 bg-white/[0.03] border-b border-white/[0.06] select-none shrink-0 cursor-grab active:cursor-grabbing"
      onPointerDown={onDragStart}
    >
      {/* Traffic lights */}
      <div className="flex items-center gap-2 mr-3">
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" style={{ boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2)" }} />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" style={{ boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2)" }} />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" style={{ boxShadow: "inset 0 -1px 2px rgba(0,0,0,0.2)" }} />
      </div>

      {/* Center title */}
      <div className="flex-1 text-center">
        <span className="text-[11px] text-white/30 font-[family-name:var(--font-mono)]">
          metastrip
        </span>
      </div>

      {/* Right spacer to balance traffic lights */}
      <div className="w-[68px]" />
    </div>
  );
}

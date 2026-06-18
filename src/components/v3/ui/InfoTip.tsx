"use client";

/** A small "?" that reveals a plain-English explanation on hover/focus.
 *  Solid fill, no stroke. */
export function InfoTip({ text, align = "right" }: { text: string; align?: "left" | "right" }) {
  return (
    <span className="group/tip relative inline-flex shrink-0">
      <button
        type="button"
        aria-label="What is this?"
        onClick={(e) => e.stopPropagation()}
        className="grid h-5 w-5 place-items-center rounded-full bg-[var(--card-elevated)] text-[11px] font-semibold text-[var(--text-muted)] transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
      >
        ?
      </button>
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-7 z-30 w-64 translate-y-1 rounded-[12px] bg-[var(--card-elevated)] p-3.5 text-[12.5px] leading-[1.55] text-[var(--text-body)] opacity-0 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)] transition-all duration-150 group-hover/tip:translate-y-0 group-hover/tip:opacity-100 group-focus-within/tip:translate-y-0 group-focus-within/tip:opacity-100 ${
          align === "right" ? "right-0" : "left-0"
        }`}
      >
        {text}
      </span>
    </span>
  );
}

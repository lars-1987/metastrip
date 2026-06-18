"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useV3Tool, type Phase } from "./useV3Tool";
import { CardDropzone } from "./CardDropzone";
import { FilesCard } from "./FilesCard";
import { CardReview } from "./CardReview";
import { CardReport } from "./CardReport";
import { loadGsap, prefersReducedMotion } from "../motion";

// Explicit slot widths (%) per phase: [files/drop, found-data, report].
const W: Record<Phase, [number, number, number]> = {
  drop: [100, 0, 0],
  review: [34, 66, 0],
  done: [34, 0, 66],
};
const ENTERING: Record<Phase, number> = { drop: -1, review: 1, done: 2 };
const SLOT_PAD = 16; // 8px each side from .v3-card-slot

export function V3Tool() {
  const t = useV3Tool();
  const slotRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const contentRefs = [useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null), useRef<HTMLDivElement>(null)];
  const prevPhase = useRef<Phase | null>(null);
  const skipAnim = useRef(false);

  useEffect(() => {
    const from = prevPhase.current;
    prevPhase.current = t.phase;
    if (skipAnim.current) { skipAnim.current = false; return; }
    if (!from || from === t.phase || prefersReducedMotion()) return;
    if (typeof window !== "undefined" && window.innerWidth < 768) return;

    const fromW = W[from], toW = W[t.phase], enter = ENTERING[t.phase];

    // Clear any stale inline styles left on the content wrappers by a previous
    // transition (e.g. opacity:0 from a start-over) — otherwise a re-opened
    // card can render invisible (blank).
    contentRefs.forEach((r) => {
      if (r.current) { r.current.style.opacity = ""; r.current.style.width = ""; r.current.style.transform = ""; }
    });

    // synchronous pre-set (avoids a flash before gsap loads async)
    slotRefs.forEach((r, i) => {
      if (r.current && fromW[i] !== toW[i]) r.current.style.setProperty("--w", `${fromW[i]}%`);
    });
    // hold the entering card's content at its FINAL width, so the opening slot
    // reveals it left-to-right from the seam (no reflow, no "appears from nowhere")
    if (enter >= 0 && slotRefs[enter].current && contentRefs[enter].current) {
      const row = slotRefs[enter].current!.parentElement!;
      const finalInner = Math.max(0, row.clientWidth * (toW[enter] / 100) - SLOT_PAD);
      contentRefs[enter].current!.style.width = `${finalInner}px`;
    }

    let killed = false;
    loadGsap().then(({ gsap }) => {
      if (killed) return;
      const tl = gsap.timeline();
      // existing cards narrow first
      slotRefs.forEach((r, i) => {
        if (i === enter || !r.current || fromW[i] === toW[i]) return;
        tl.to(r.current, { "--w": `${toW[i]}%`, duration: 0.5, ease: "power3.inOut" }, 0);
      });
      // then the new card unfurls rightward from the seam, revealing its content
      if (enter >= 0 && slotRefs[enter].current) {
        tl.to(slotRefs[enter].current, { "--w": `${toW[enter]}%`, duration: 0.62, ease: "power3.inOut" }, 0.28);
        tl.set(contentRefs[enter].current, { width: "" }, ">"); // restore responsive width
      }
    });
    return () => { killed = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.phase]);

  const handleReset = () => {
    if (prefersReducedMotion() || (typeof window !== "undefined" && window.innerWidth < 768)) { t.reset(); return; }
    loadGsap().then(({ gsap }) => {
      const tl = gsap.timeline({
        onComplete: () => {
          // restore the report wrapper's opacity so it isn't blank next time
          if (contentRefs[2].current) contentRefs[2].current.style.opacity = "";
          skipAnim.current = true;
          t.reset();
        },
      });
      if (contentRefs[2].current) tl.to(contentRefs[2].current, { opacity: 0, duration: 0.22 }, 0);
      if (slotRefs[2].current) tl.to(slotRefs[2].current, { "--w": "0%", duration: 0.5, ease: "power3.inOut" }, 0);
      if (slotRefs[0].current) tl.to(slotRefs[0].current, { "--w": "100%", duration: 0.6, ease: "power3.inOut" }, 0.3);
    });
  };

  const w = W[t.phase];
  const slotStyle = (i: number): CSSProperties => ({ ["--w" as string]: `${w[i]}%` } as CSSProperties);

  return (
    <div className="v3-card-row">
      {/* Slot 1 — dropzone → files */}
      <div ref={slotRefs[0]} className="v3-card-slot" style={slotStyle(0)} data-active="true">
        <div ref={contentRefs[0]} className="h-full min-h-0">
          {t.phase === "drop" ? (
            <CardDropzone onFiles={t.addFiles} busy={t.busy} error={t.addError} />
          ) : (
            <FilesCard
              entries={t.entries}
              selectedId={t.selectedId}
              onSelect={t.phase === "review" ? t.selectEntry : undefined}
              onRemoveEntry={t.phase === "review" ? t.removeEntry : undefined}
              running={t.running}
              tickedIds={t.tickedIds}
            />
          )}
        </div>
      </div>

      {/* Slot 2 — found data / review (stays mounted through `done`, collapsed) */}
      <div ref={slotRefs[1]} className="v3-card-slot" style={slotStyle(1)} data-active={t.phase === "review"}>
        <div ref={contentRefs[1]} className="h-full min-h-0">
          {t.activeEntry && (
            <CardReview
              key={t.activeEntry.id}
              entry={t.activeEntry}
              fileCount={t.entries.length}
              visibleCategories={t.visibleCategories}
              busy={t.busy}
              allFilesAllOn={t.allFilesAllOn}
              onToggle={t.setCategory}
              onToggleAll={t.setAll}
              onRun={t.runRemoval}
            />
          )}
        </div>
      </div>

      {/* Slot 3 — report */}
      <div ref={slotRefs[2]} className="v3-card-slot" style={slotStyle(2)} data-active={t.phase === "done"}>
        <div ref={contentRefs[2]} className="h-full min-h-0">
          {t.phase === "done" && (
            <CardReport entries={t.entries} onDownload={t.download} onReset={handleReset} />
          )}
        </div>
      </div>
    </div>
  );
}

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

/** Horizontal gutters on .v3-card-slot, measured rather than hardcoded: the
 *  CSS says 7px a side and the old constant assumed 8, so every entering card
 *  was pinned 2px narrow and snapped as it landed. Read it off slot 0, the one
 *  slot that is never collapsed and so always keeps its padding. */
function slotPad(el: HTMLElement | null): number {
  if (!el) return 14;
  const cs = getComputedStyle(el);
  return parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
}

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
    // Hold a card's content at a fixed pixel width for the whole transition, so
    // the slot acts purely as a clip window and the text never reflows.
    // Entering cards are held at their FINAL width (revealed left-to-right from
    // the seam). Cards collapsing to nothing are held at their STARTING width:
    // without this their content box reflows all the way down to 0px and the
    // text stacks one character per line for the entire ~0.5s collapse.
    const pad = slotPad(slotRefs[0].current);
    const pinned: number[] = [];
    const pin = (i: number, pct: number) => {
      const slot = slotRefs[i].current, content = contentRefs[i].current;
      if (!slot || !content) return;
      content.style.width = `${Math.max(0, slot.parentElement!.clientWidth * (pct / 100) - pad)}px`;
      pinned.push(i);
    };
    const unpin = () => pinned.forEach((i) => {
      if (contentRefs[i].current) contentRefs[i].current!.style.width = "";
    });
    if (enter >= 0) pin(enter, toW[enter]);
    slotRefs.forEach((_, i) => {
      if (i !== enter && toW[i] === 0 && fromW[i] > 0) pin(i, fromW[i]);
    });

    let killed = false;
    loadGsap().then(({ gsap }) => {
      if (killed) return;
      const tl = gsap.timeline({ onComplete: unpin });
      // existing cards narrow first
      slotRefs.forEach((r, i) => {
        if (i === enter || !r.current || fromW[i] === toW[i]) return;
        tl.to(r.current, { "--w": `${toW[i]}%`, duration: 0.5, ease: "power3.inOut" }, 0);
      });
      // then the new card unfurls rightward from the seam, revealing its content
      if (enter >= 0 && slotRefs[enter].current) {
        tl.to(slotRefs[enter].current, { "--w": `${toW[enter]}%`, duration: 0.62, ease: "power3.inOut" }, 0.28);
      }
    });
    // If we unmount or re-run mid-flight, drop the pins so nothing is left
    // frozen at a stale pixel width.
    return () => { killed = true; unpin(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t.phase]);

  const handleReset = () => {
    if (prefersReducedMotion() || (typeof window !== "undefined" && window.innerWidth < 768)) { t.reset(); return; }
    // Hold the report at its current width for the same reason: collapsing it
    // to 0 would reflow its text into a single-character column on the way out.
    const report = slotRefs[2].current;
    if (report && contentRefs[2].current) {
      const inner = Math.max(0, report.parentElement!.clientWidth * (W.done[2] / 100) - slotPad(slotRefs[0].current));
      contentRefs[2].current.style.width = `${inner}px`;
    }
    loadGsap().then(({ gsap }) => {
      const tl = gsap.timeline({
        onComplete: () => {
          // restore the report wrapper's opacity and width so it isn't blank
          // or frozen narrow next time
          if (contentRefs[2].current) {
            contentRefs[2].current.style.opacity = "";
            contentRefs[2].current.style.width = "";
          }
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
            <CardDropzone onFiles={t.addFiles} onRejected={t.rejectFiles} busy={t.busy} error={t.addError} />
          ) : (
            <FilesCard
              entries={t.entries}
              scanProgress={t.scanProgress}
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

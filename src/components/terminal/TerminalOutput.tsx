"use client";

import { useState, useEffect } from "react";
import type { ProcessingLogEntry, CategoryResult } from "@/hooks/useFileProcessor";
import type { StripOptions, MetadataCategory } from "@/lib/processing/types";
import { CATEGORY_CONFIG } from "@/lib/constants";

const CATEGORIES: MetadataCategory[] = [
  "gps", "device", "dates", "author", "software", "ai", "copyright", "comments", "custom",
];

const CATEGORY_DELAY = 150; // ms between each category line appearing
const PROGRESS_DURATION = 300; // ms for progress bar to fill

interface TerminalOutputProps {
  log: ProcessingLogEntry[];
  total: number;
  stripOptions: StripOptions;
  onOpenSupport?: () => void;
}

/* ── Per-category animated line ── */

function CategoryStripLine({
  category,
  fieldsRemoved,
  isLast,
  delay,
}: {
  category: MetadataCategory;
  fieldsRemoved: number;
  isLast: boolean;
  delay: number;
}) {
  const [visible, setVisible] = useState(false);
  const [filled, setFilled] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), delay);
    const t2 = setTimeout(() => setFilled(true), delay + 50);
    const t3 = setTimeout(() => setShowResult(true), delay + PROGRESS_DURATION + 50);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [delay]);

  if (!visible) return null;

  const label = CATEGORY_CONFIG[category].label.toLowerCase().split(" ")[0];
  const branch = isLast ? "└─" : "├─";

  return (
    <div className="flex items-center gap-1.5 h-5">
      <span className="text-white/30 w-5 shrink-0 text-right">{branch}</span>
      <span className="text-white/55 shrink-0">stripping {label}...</span>
      <div className="w-16 h-1.5 bg-white/[0.04] rounded-full overflow-hidden shrink-0 mx-1.5">
        <div
          className="h-full rounded-full transition-all ease-out"
          style={{
            width: filled ? "100%" : "0%",
            transitionDuration: `${PROGRESS_DURATION}ms`,
            background: fieldsRemoved > 0
              ? "linear-gradient(90deg, #7c3aed, #06b6d4)"
              : "rgba(255,255,255,0.1)",
          }}
        />
      </div>
      {showResult ? (
        fieldsRemoved > 0 ? (
          <span className="text-success">
            removed <span className="text-white/40">({fieldsRemoved} field{fieldsRemoved !== 1 ? "s" : ""})</span>
          </span>
        ) : (
          <span className="text-white/35">clean</span>
        )
      ) : (
        <span className="text-purple-light animate-pulse-dot">●</span>
      )}
    </div>
  );
}

/* ── Per-file animated block ── */

function FileProcessingBlock({
  entry,
  index,
  total,
  stripOptions,
  startDelay,
}: {
  entry: ProcessingLogEntry;
  index: number;
  total: number;
  stripOptions: StripOptions;
  startDelay: number;
}) {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [summaryVisible, setSummaryVisible] = useState(false);

  const selectedCategories = CATEGORIES.filter((c) => stripOptions[c]);

  // Build a map from categoryResults for quick lookup
  const catResultMap = new Map<MetadataCategory, number>();
  if (entry.categoryResults) {
    for (const cr of entry.categoryResults) {
      catResultMap.set(cr.category, cr.fieldsRemoved);
    }
  }

  const totalCatDelay = selectedCategories.length * CATEGORY_DELAY + PROGRESS_DURATION + 100;

  useEffect(() => {
    const t1 = setTimeout(() => setHeaderVisible(true), startDelay);
    return () => clearTimeout(t1);
  }, [startDelay]);

  useEffect(() => {
    if (entry.status === "done" || entry.status === "error") {
      const t = setTimeout(() => setSummaryVisible(true), startDelay + CATEGORY_DELAY + totalCatDelay);
      return () => clearTimeout(t);
    }
  }, [entry.status, startDelay, totalCatDelay]);

  if (!headerVisible) return null;

  return (
    <div className="mb-3 animate-card-slide-in">
      {/* File header */}
      <div className="flex items-center gap-1.5 mb-0.5">
        <span className="text-white/40">[{index + 1}/{total}]</span>
        <span className="text-cyan font-semibold">{entry.fileName}</span>
        {entry.status === "processing" && !entry.categoryResults && (
          <span className="text-purple-light animate-pulse-dot">●</span>
        )}
      </div>

      {/* Per-category animated lines — shown once we have results */}
      {(entry.status === "done" || entry.categoryResults) && (
        <div className="pl-4 space-y-0">
          {selectedCategories.map((cat, i) => (
            <CategoryStripLine
              key={cat}
              category={cat}
              fieldsRemoved={catResultMap.get(cat) ?? 0}
              isLast={i === selectedCategories.length - 1}
              delay={startDelay + CATEGORY_DELAY + i * CATEGORY_DELAY}
            />
          ))}
        </div>
      )}

      {/* Processing spinner when still working */}
      {entry.status === "processing" && !entry.categoryResults && (
        <div className="pl-4 flex items-center gap-2 text-white/45">
          <span className="w-3 h-3 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          <span>processing...</span>
        </div>
      )}

      {/* Error */}
      {entry.status === "error" && summaryVisible && (
        <div className="pl-4 mt-1">
          <span className="text-danger">✗ error</span>
          {entry.error && <span className="text-danger/60 ml-1">— {entry.error}</span>}
        </div>
      )}

      {/* Per-file summary */}
      {entry.status === "done" && summaryVisible && (
        <div className="pl-4 mt-1 animate-card-slide-in">
          <span className="text-success">✓ done</span>
          <span className="text-white/40"> — {entry.fieldsRemoved ?? 0} fields removed</span>
        </div>
      )}
    </div>
  );
}

/* ── Main output container ── */

export function TerminalOutput({ log, total, stripOptions, onOpenSupport }: TerminalOutputProps) {
  if (log.length === 0) return null;

  const doneCount = log.filter((l) => l.status === "done").length;
  const errorCount = log.filter((l) => l.status === "error").length;
  const allDone = log.every((l) => l.status !== "processing") && log.length === total;
  // Calculate cumulative start delay for each file block
  const selectedCount = CATEGORIES.filter((c) => stripOptions[c]).length;
  const perFileAnimDuration = CATEGORY_DELAY + selectedCount * CATEGORY_DELAY + PROGRESS_DURATION + 200;

  return (
    <div className="font-[family-name:var(--font-mono)] text-sm mt-3">
      {log.map((entry, i) => (
        <FileProcessingBlock
          key={entry.fileId}
          entry={entry}
          index={i}
          total={total}
          stripOptions={stripOptions}
          startDelay={i * Math.min(perFileAnimDuration, 800)}
        />
      ))}

      {allDone && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] space-y-1.5 animate-card-slide-in" style={{ animationDelay: `${log.length * Math.min(perFileAnimDuration, 800) + 200}ms` }}>
          <div>
            <span className="text-success font-semibold">✔ metadata stripped successfully</span>
            {errorCount > 0 && (
              <span className="text-danger ml-2">({errorCount} failed)</span>
            )}
          </div>
          <div className="text-white/55">
            download ready → <span className="text-cyan">{doneCount > 1 ? "cleaned_files.zip" : `cleaned_${log[0]?.fileName ?? "file"}`}</span>
          </div>
          <div className="text-white/40 mt-2">
            <span className="mr-1">☕</span> if this saved you time:{" "}
            <button
              onClick={onOpenSupport}
              className="text-purple-light hover:text-purple-300 underline underline-offset-2 decoration-purple-light/30 cursor-pointer bg-transparent border-none p-0 font-[family-name:var(--font-mono)] text-sm"
            >
              open support tab
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

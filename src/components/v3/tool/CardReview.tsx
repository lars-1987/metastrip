"use client";

import { useMemo } from "react";
import { Icon } from "@/components/shared/Icon";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { extractGpsCoordinates } from "@/lib/gps";
import type { MetadataCategory } from "@/lib/processing/types";
import { Button } from "../ui/Button";
import { Checkbox } from "../ui/Checkbox";
import { InfoTip } from "../ui/InfoTip";
import { V3LocationMap } from "./V3LocationMap";
import type { ToolEntry } from "./useV3Tool";

/** Plain-English explanations shown in the per-card "?" tooltip. */
const CATEGORY_INFO: Record<MetadataCategory, string> = {
  gps: "The exact spot the photo was taken, often accurate to a few metres. Enough to pinpoint your home, workplace, or wherever you were.",
  device: "The make, model, and serial of the device that made the file. Acts as a fingerprint that links all your files back to one device.",
  dates: "When the file was created and last edited, often down to the second and timezone, which can reveal your routine and rough location.",
  author: "Names, usernames, or creator credits embedded by your device or editing software.",
  software: "Which app and version processed the file. Fingerprints the tools and operating system you use.",
  ai: "Provenance markers (like C2PA) that flag the file as AI-generated and name the tool that produced it.",
  copyright: "Copyright notices and rights information stored inside the file.",
  comments: "Comments, tracked changes, and revision notes left behind in the document.",
  custom: "Other embedded fields: resolution, orientation, app-specific tags, and assorted technical leftovers.",
};

interface Props {
  entry: ToolEntry;                 // the active file
  fileCount: number;
  visibleCategories: MetadataCategory[];
  busy: boolean;
  allFilesAllOn: boolean;
  onToggle: (cat: MetadataCategory, on: boolean) => void;
  onToggleAll: (on: boolean) => void;
  onRun: () => void;
}

function valueToString(v: unknown): string {
  if (v == null) return "";
  const s = String(v);
  return s.length > 60 ? s.slice(0, 60) + "…" : s;
}

export function CardReview({
  entry, fileCount, visibleCategories, busy, allFilesAllOn,
  onToggle, onToggleAll, onRun,
}: Props) {
  const options = entry.options;
  const coords = useMemo(() => extractGpsCoordinates(entry.scan.fieldsFound), [entry]);

  const grouped = useMemo(() => {
    const map = new Map<MetadataCategory, { label: string; value: string }[]>();
    for (const f of entry.scan.fieldsFound) {
      if (!visibleCategories.includes(f.category)) continue;
      const arr = map.get(f.category) ?? [];
      arr.push({ label: f.label, value: valueToString(f.value) });
      map.set(f.category, arr);
    }
    return map;
  }, [entry, visibleCategories]);

  const allOn = visibleCategories.every((c) => options[c]);
  const selectedCount = visibleCategories.filter((c) => options[c]).length;
  const nothingFound = visibleCategories.length === 0;

  return (
    <div className="flex h-full flex-col rounded-[var(--radius)] bg-[var(--surface)] p-6 md:p-8">
      <div className="mb-5 flex items-end justify-between gap-4">
        <h3 className="v3-mono min-w-0 truncate text-[12px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
          Found in <span className="text-[var(--text-body)]">{entry.file.name}</span>
        </h3>
        {!nothingFound && <Checkbox checked={allOn} onChange={onToggleAll} label="Remove all" />}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pr-1 -mr-1">
        {nothingFound ? (
          <div className="rounded-[var(--radius-sm)] bg-[var(--card)] p-6 text-[15px] text-[var(--text-body)]">
            No removable metadata found; this file is already clean.
          </div>
        ) : (
          <div className="grid min-w-0 gap-3 lg:grid-cols-2 [grid-auto-flow:row_dense]">
            {coords && <V3LocationMap coords={coords} />}
            {visibleCategories.map((cat) => {
              const cfg = CATEGORY_CONFIG[cat];
              const fields = grouped.get(cat) ?? [];
              const on = options[cat];
              return (
                <div
                  key={cat}
                  className={`min-w-0 rounded-[var(--radius-sm)] p-4 transition-colors ${
                    on ? "bg-[var(--card)]" : "bg-[color-mix(in_srgb,var(--card)_45%,transparent)]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="grid place-items-center h-9 w-9 rounded-[10px] shrink-0 bg-[var(--card-elevated)]">
                        <Icon name={cfg.icon} size={18} weight="duotone" color="var(--text)" />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[15px] text-[var(--text)]">{cfg.label}</p>
                        <p className="v3-mono text-[12px] text-[var(--text-muted)]">
                          {fields.length} field{fields.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 shrink-0">
                      <InfoTip text={CATEGORY_INFO[cat]} />
                      <Checkbox checked={on} onChange={(v) => onToggle(cat, v)} label="" />
                    </div>
                  </div>

                  {fields.length > 0 && (
                    <ul className="v3-mono mt-4 space-y-1">
                      {fields.slice(0, 6).map((f, i) => (
                        <li key={i} className="flex min-w-0 gap-2 text-[12px]">
                          <span className="text-[var(--text-muted)] shrink-0">{f.label}:</span>
                          <span className="min-w-0 break-words text-[var(--text-body)]">{f.value || "—"}</span>
                        </li>
                      ))}
                      {fields.length > 6 && <li className="text-[12px] text-[var(--text-muted)]">+{fields.length - 6} more</li>}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-4">
        <span className="v3-mono hidden text-[12px] text-[var(--text-muted)] sm:block">
          {fileCount > 1 ? "applies your selection across all files" : ""}
        </span>
        <Button
          size="lg"
          onClick={onRun}
          disabled={busy}
          hoverIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 7h16M10 4h4M6 7l1 13h10l1-13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          {busy ? "Removing…" : allFilesAllOn ? "Remove all metadata" : `Remove selected${fileCount > 1 ? ` · ${fileCount} files` : ` (${selectedCount})`}`}
        </Button>
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { formatBytes } from "@/lib/file-utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { Icon } from "@/components/shared/Icon";
import type { MetadataCategory, MetadataField } from "@/lib/processing/types";
import { Button } from "../ui/Button";
import type { ToolEntry } from "./useV3Tool";

interface Props {
  entries: ToolEntry[];
  onDownload: () => void;
  onReset: () => void;
}

const CATEGORY_ORDER: MetadataCategory[] = [
  "gps", "device", "dates", "author", "software", "ai", "copyright", "comments", "custom",
];

function valueToString(v: unknown): string {
  if (v == null) return "—";
  const s = String(v);
  return s.length > 64 ? s.slice(0, 64) + "…" : s;
}

function groupByCategory(fields: MetadataField[]): [MetadataCategory, MetadataField[]][] {
  const map = new Map<MetadataCategory, MetadataField[]>();
  for (const f of fields) {
    const arr = map.get(f.category) ?? [];
    arr.push(f);
    map.set(f.category, arr);
  }
  return CATEGORY_ORDER.filter((c) => map.has(c)).map((c) => [c, map.get(c)!]);
}

export function CardReport({ entries, onDownload, onReset }: Props) {
  const [openId, setOpenId] = useState<string | null>(entries[0]?.id ?? null);

  const stats = useMemo(() => {
    let removed = 0, kept = 0, originalSize = 0, cleanedSize = 0;
    for (const e of entries) {
      const r = e.finalReport ?? e.scan;
      removed += r.fieldsRemoved.length;
      kept += r.fieldsKept.length;
      originalSize += e.file.size;
      cleanedSize += e.cleanedBlob?.size ?? r.cleanedFileSize;
    }
    return { removed, kept, saved: Math.max(0, originalSize - cleanedSize) };
  }, [entries]);

  return (
    <div className="flex h-full flex-col rounded-[var(--radius)] bg-[var(--surface)] p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <span className="grid place-items-center h-10 w-10 rounded-full bg-[color-mix(in_srgb,var(--success)_22%,transparent)]">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10.5l4 4 8-9" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <h3 className="text-[clamp(20px,2.4vw,28px)] font-semibold text-[var(--text)] leading-tight">
            {stats.removed > 0 ? "Metadata removed" : "Nothing left to remove"}
          </h3>
          <p className="text-[14px] text-[var(--text-body)]">
            {entries.length} file{entries.length !== 1 ? "s" : ""} cleaned, in your browser.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Fields removed", value: stats.removed, accent: "var(--success)" },
          { label: "Fields kept", value: stats.kept, accent: "var(--text-muted)" },
          { label: "Size saved", value: formatBytes(stats.saved), accent: "var(--text)" },
        ].map((s) => (
          <div key={s.label} className="rounded-[var(--radius-sm)] bg-[var(--card)] p-4">
            <p className="v3-mono text-[12px] uppercase tracking-[0.12em] text-[var(--text-muted)]">{s.label}</p>
            <p className="mt-2 text-[clamp(22px,3vw,32px)] font-semibold leading-none" style={{ color: s.accent }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* per-file accordion — expand to see every field removed */}
      <ul className="min-h-0 flex-1 overflow-y-auto space-y-2 mb-8 pr-1 -mr-1">
        {entries.map((e) => {
          const r = e.finalReport ?? e.scan;
          const isOpen = openId === e.id;
          const grouped = groupByCategory(r.fieldsRemoved);
          return (
            <li key={e.id}>
              <div className="rounded-[var(--radius-sm)] bg-[var(--card)] overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenId(isOpen ? null : e.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left cursor-pointer"
                >
                  <span className="min-w-0 truncate text-[14px] text-[var(--text)]">cleaned_{e.file.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="v3-mono text-[12px] text-[var(--success)]">−{r.fieldsRemoved.length} removed</span>
                    <span className="transition-transform duration-200" style={{ transform: isOpen ? "rotate(180deg)" : "none", color: "var(--text-muted)" }}>
                      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </span>
                  </span>
                </button>

                <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
                  <div className="overflow-hidden">
                    <div className="px-4 pb-4 space-y-4">
                      {grouped.length === 0 ? (
                        <p className="text-[13px] text-[var(--text-muted)]">No fields were removed from this file.</p>
                      ) : (
                        grouped.map(([cat, fields]) => {
                          const cfg = CATEGORY_CONFIG[cat];
                          return (
                            <div key={cat}>
                              <div className="mb-2 flex items-center gap-2">
                                <Icon name={cfg.icon} size={14} weight="duotone" color="var(--text-muted)" />
                                <span className="v3-mono text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)]">{cfg.label}</span>
                              </div>
                              <ul className="v3-mono space-y-1">
                                {fields.map((f, i) => (
                                  <li key={i} className="flex min-w-0 gap-2 text-[12px]">
                                    <span className="shrink-0 text-[var(--text-muted)]">{f.label}:</span>
                                    <span className="min-w-0 break-words text-[var(--text-body)]">{valueToString(f.value)}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-auto flex flex-col sm:flex-row items-center justify-end gap-3">
        <Button
          variant="ghost"
          size="lg"
          onClick={onReset}
          hoverIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 12a9 9 0 1 0 3-6.7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M3 4v4h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Start over
        </Button>
        <Button
          size="lg"
          onClick={onDownload}
          hoverIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        >
          Download clean {entries.length > 1 ? "files (.zip)" : "file"}
        </Button>
        <Button
          variant="soft"
          size="lg"
          href="https://ko-fi.com/metastrip"
          external
          hoverIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M4 8h12v5a4 4 0 01-4 4H8a4 4 0 01-4-4V8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M16 9h2.5a2.5 2.5 0 010 5H16" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
              <path d="M7 3v2M11 3v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        >
          Tip jar
        </Button>
      </div>
    </div>
  );
}

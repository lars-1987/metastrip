"use client";

import { getFileTypeLabel, formatBytes } from "@/lib/file-utils";
import type { ToolEntry } from "./useV3Tool";

interface Props {
  entries: ToolEntry[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onRemoveEntry?: (id: string) => void;
  running?: boolean;
  tickedIds?: string[];
}

function Spinner() {
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--text)] animate-spin" aria-label="Processing" />;
}

function Tick() {
  return (
    <span className="v3-tick-pop grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_28%,transparent)]" aria-label="Done">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.2l2.6 2.6L10 3.2" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Left column once files are loaded — click a file to review/select its
 *  metadata in the panel to the right. During removal each file shows a
 *  spinner that flips to a tick, one after another. */
export function FilesCard({ entries, selectedId, onSelect, onRemoveEntry, running, tickedIds = [] }: Props) {
  const selectable = !running && !!onSelect && entries.length > 1;

  return (
    <div className="flex h-full flex-col rounded-[var(--radius)] bg-[var(--surface)] p-6 md:p-7">
      <h3 className="v3-mono mb-5 text-[12px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {entries.length} {entries.length === 1 ? "file" : "files"}
        {selectable && <span className="ml-2 normal-case tracking-normal text-[var(--text-muted)]">· tap to review each</span>}
      </h3>
      <ul className="min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1 -mr-1">
        {entries.map((e) => {
          const active = selectable && e.id === selectedId;
          return (
            <li key={e.id}>
              <div
                role={selectable ? "button" : undefined}
                tabIndex={selectable ? 0 : undefined}
                onClick={selectable ? () => onSelect?.(e.id) : undefined}
                onKeyDown={selectable ? (ev) => { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); onSelect?.(e.id); } } : undefined}
                className={`group flex items-start justify-between gap-3 rounded-[var(--radius-sm)] p-4 transition-colors ${
                  selectable ? "cursor-pointer" : ""
                } ${
                  active
                    ? "bg-[color-mix(in_srgb,var(--primary)_22%,var(--card))]"
                    : "bg-[var(--card)] hover:bg-[var(--card-elevated)]"
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-[var(--text)]">{e.file.name}</p>
                  <p className="v3-mono mt-1 text-[12px] text-[var(--text-muted)]">
                    {getFileTypeLabel(e.file.type)} · {formatBytes(e.file.size)}
                  </p>
                </div>
                {running ? (
                  tickedIds.includes(e.id) ? <Tick /> : <Spinner />
                ) : (
                  onRemoveEntry && (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); onRemoveEntry(e.id); }}
                      aria-label={`Remove ${e.file.name}`}
                      className="-m-2.5 shrink-0 p-2.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors text-lg leading-none"
                    >
                      ×
                    </button>
                  )
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

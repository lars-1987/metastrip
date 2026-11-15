"use client";

import { formatBytes } from "@/lib/file-utils";
import { labelOf } from "@/lib/processing/formats";
import type { ToolEntry } from "./useV3Tool";
import { useMessages } from "@/components/i18n/LocaleProvider";
import type { Messages } from "@/lib/i18n";

interface Props {
  entries: ToolEntry[];
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  onRemoveEntry?: (id: string) => void;
  running?: boolean;
  tickedIds?: string[];
  /** Set while files are still being scanned, so the header can count up. */
  scanProgress?: { done: number; total: number; large: boolean } | null;
  /** Names of files turned away because MetaStrip can't read their format yet. */
  skipped?: string[];
}

type FilesText = Messages["files"];

function Spinner({ m }: { m: FilesText }) {
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--text)] animate-spin" aria-label={m.processing} />;
}

function Tick({ m }: { m: FilesText }) {
  return (
    <span className="v3-tick-pop grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_28%,transparent)]" aria-label={m.done}>
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.2l2.6 2.6L10 3.2" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/** Stands in for the tick on a file that could not be read: nothing happened to
 *  it, so it must not get the same green mark as a cleaned one. */
function NotRead({ m }: { m: FilesText }) {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[var(--card-elevated)]" aria-label={m.notReadLabel}>
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M2.5 6h7" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** Left column once files are loaded — click a file to review/select its
 *  metadata in the panel to the right. During removal each file shows a
 *  spinner that flips to a tick, one after another. */
export function FilesCard({ entries, selectedId, onSelect, onRemoveEntry, running, tickedIds = [], scanProgress, skipped = [] }: Props) {
  const selectable = !running && !!onSelect && entries.length > 1;
  const m = useMessages().files;

  return (
    <div className="flex h-full flex-col rounded-[var(--radius)] bg-[var(--surface)] p-6 md:p-7">
      <h3 className="v3-mono mb-5 text-[12px] uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {scanProgress ? m.reading(scanProgress.done, scanProgress.total, scanProgress.large) : m.count(entries.length)}
        {selectable && !scanProgress && <span className="ml-2 normal-case tracking-normal text-[var(--text-muted)]">{m.tapToReview}</span>}
      </h3>
      {skipped.length > 0 && (
        <p role="status" className="mb-4 break-words text-[13px] leading-relaxed text-[var(--text-muted)]">
          {m.skipped(skipped)}
        </p>
      )}
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
                    {labelOf(e.format)} · {formatBytes(e.file.size)}
                    {e.error && m.notRead}
                  </p>
                </div>
                {running ? (
                  tickedIds.includes(e.id) ? (e.error ? <NotRead m={m} /> : <Tick m={m} />) : <Spinner m={m} />
                ) : (
                  onRemoveEntry && (
                    <button
                      onClick={(ev) => { ev.stopPropagation(); onRemoveEntry(e.id); }}
                      aria-label={m.remove(e.file.name)}
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

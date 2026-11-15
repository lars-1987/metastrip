"use client";

import { useRef } from "react";
import { useDropZone } from "@/hooks/useDropZone";
import { formatBytes } from "@/lib/file-utils";
import type { VerifyResult } from "@/lib/processing/verify";
import { Button } from "@/components/v3/ui/Button";
import { Checkbox } from "@/components/v3/ui/Checkbox";
import { useConverter, KEEPABLE, FAILURE_TEXT, type ConvertItem, type Keepable } from "./useConverter";

/* The HEIC to JPG converter: a dropzone, then one card that lists the batch
   as it converts and saves the JPGs. Its own component and hook, so the main
   tool is untouched, but it sits in the same super-dark panel
   (.v3-tool-frame) so the two look like one product. */

// image/heic in the list matters on iPhones: without it, Safari's picker hands
// over its own JPEG copy instead of the original photo.
const ACCEPT = "image/heic,image/heif,.heic,.heif,image/jpeg,image/png,image/webp,image/avif,image/gif";
const FORMATS = ["HEIC", "JPG", "PNG", "WEBP", "AVIF", "GIF"];

const KEEP_LABEL: Record<Keepable, string> = { gps: "location", dates: "date taken", device: "camera details" };

function list(words: string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words[words.length - 1]}`;
}

function Spinner() {
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-[var(--border-strong)] border-t-[var(--text)] animate-spin" aria-label="Converting" />;
}

function Tick() {
  return (
    <span className="v3-tick-pop grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_28%,transparent)]" aria-label="Converted">
      <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
        <path d="M2 6.2l2.6 2.6L10 3.2" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Waiting() {
  return <span className="h-5 w-5 shrink-0 rounded-full border-2 border-dashed border-[var(--border-strong)]" aria-label="Waiting" />;
}

function Failed() {
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--danger)_22%,transparent)]" aria-label="Not converted">
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
        <path d="M3 3l6 6M9 3l-6 6" stroke="var(--danger)" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </span>
  );
}

/** What the re-read found, in a few words. */
function checkLine(verify: VerifyResult | undefined, kept: string[]): { text: string; warn?: boolean } {
  if (!verify) return { text: "checking metadata…" };
  switch (verify.status) {
    case "clean":
      return { text: "no metadata left · checked" };
    case "kept":
      return { text: `only your kept ${list(kept)} · checked` };
    case "leftovers":
      return { text: `the check still found ${list(verify.leftoverCategories)} data`, warn: true };
    default:
      return { text: "not re-checked" };
  }
}

function Row({ item, kept, onDownload }: { item: ConvertItem; kept: string[]; onDownload?: () => void }) {
  const r = item.result;
  const check = item.status === "done" ? checkLine(item.verify, kept) : null;
  return (
    <li className="flex items-start justify-between gap-3 rounded-[var(--radius-sm)] bg-[var(--card)] p-4">
      <div className="min-w-0">
        <p className="truncate text-[15px] text-[var(--text)]">
          {item.outName ?? item.file.name}
        </p>
        <p className="v3-mono mt-1 text-[12px] text-[var(--text-muted)]">
          {/* Each piece kept whole, so a phone wraps between them, never inside "1200 × 800". */}
          <span className="whitespace-nowrap">
            {r ? `${formatBytes(item.file.size)} → ${formatBytes(r.blob.size)}` : formatBytes(item.file.size)}
          </span>
          {r && <span className="whitespace-nowrap"> · {r.width} × {r.height}</span>}
          {item.status === "converting" && " · converting…"}
        </p>
        {check && (
          <p className={`v3-mono mt-1 text-[12px] ${check.warn ? "text-[var(--danger)]" : "text-[var(--text-muted)]"}`}>
            {/* "· checked" kept whole, so a phone never leaves "checked" alone on a line. */}
            {check.text.split(" · ").map((piece, i) => (i === 0 ? piece : <span key={i} className="whitespace-nowrap"> · {piece}</span>))}
          </p>
        )}
        {item.status === "failed" && item.failure && (
          <p className="mt-1 text-[13px] leading-snug text-[var(--danger)]">{FAILURE_TEXT[item.failure]}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-3">
        {onDownload && (
          <button
            onClick={onDownload}
            aria-label={`Download ${item.outName}`}
            className="-m-2 p-2 text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M12 4v11m0 0l-4.5-4.5M12 15l4.5-4.5M5 20h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
        {item.status === "queued" ? <Waiting /> : item.status === "converting" ? <Spinner /> : item.status === "done" ? <Tick /> : <Failed />}
      </div>
    </li>
  );
}

export function ConverterTool() {
  const t = useConverter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragOver, dragHandlers } = useDropZone({ onFiles: t.addFiles });
  const kept = KEEPABLE.filter((k) => t.keep.has(k.category)).map((k) => KEEP_LABEL[k.category]);

  if (t.phase === "drop") {
    return (
      <div data-private className="v3-tool-frame flex flex-col gap-3 md:min-h-[calc(100svh-272px)]">
        <div
          {...dragHandlers}
          onClick={() => inputRef.current?.click()}
          className={`group relative flex min-h-[360px] flex-1 flex-col items-center justify-center overflow-hidden
            rounded-[var(--radius)] px-8 py-16 text-center cursor-pointer transition-all duration-300
            ${isDragOver
              ? "bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] shadow-[inset_0_0_0_2px_var(--border-strong)]"
              : "bg-[var(--surface)]"}`}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPT}
            className="hidden"
            onChange={(e) => {
              if (e.target.files) t.addFiles(Array.from(e.target.files));
              e.target.value = "";
            }}
          />
          <div
            className={`mb-8 grid h-20 w-20 place-items-center rounded-[20px] bg-[var(--card-elevated)] transition-transform duration-300 ${
              isDragOver ? "scale-110 -translate-y-1" : ""
            }`}
            aria-hidden
          >
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="var(--text)" strokeWidth="1.7" />
              <circle cx="8.5" cy="9.5" r="1.6" stroke="var(--text-muted)" strokeWidth="1.7" />
              <path d="M4 18l5-4 4 3 3-2 4 3" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="max-w-[480px] text-[clamp(17px,1.9vw,22px)] leading-[1.45] text-[var(--text)]">
            {isDragOver
              ? "Drop them right here."
              : "Drop iPhone photos or any images here, or click to choose. They become JPGs in your browser; nothing is uploaded."}
          </p>
          <div className="mt-8">
            <Button size="lg" variant="primary">Choose photos</Button>
          </div>
          <p className="v3-mono mt-7 text-[14px] tracking-wide text-[var(--text-muted)]">
            {FORMATS.join(" · ")} <span aria-hidden>→</span><span className="sr-only">to</span> JPG
          </p>
          {t.addError && <p className="mt-5 text-[14px] text-[var(--danger)]" role="alert">{t.addError}</p>}
        </div>

        <div className="rounded-[var(--radius)] bg-[var(--surface)] px-6 py-5">
          <p className="v3-mono mb-3 text-[12px] uppercase tracking-[0.16em] text-[var(--text-muted)]">Keep in the JPGs</p>
          <div className="flex flex-wrap gap-x-7 gap-y-3">
            {KEEPABLE.map((k) => (
              <Checkbox key={k.category} label={k.label} checked={t.keep.has(k.category)} onChange={(on) => t.toggleKeep(k.category, on)} />
            ))}
          </div>
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--text-muted)]">
            {kept.length === 0
              ? "Nothing is kept: location, date, camera and every other detail are removed."
              : `Keeping ${list(kept)}. Everything else is removed.`}
          </p>
        </div>
      </div>
    );
  }

  const { finished, total, converted, failed } = t.progress;
  const working = t.phase === "working";
  const heading = working
    ? `converting ${Math.min(finished + 1, total)} of ${total}…`
    : failed
      ? `${converted} converted · ${failed} not converted`
      : `${converted} converted`;

  return (
    <div data-private className="v3-tool-frame">
      <div className="flex flex-col rounded-[var(--radius)] bg-[var(--surface)] p-4 md:p-7">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h3 className="v3-mono text-[12px] uppercase tracking-[0.16em] text-[var(--text-muted)]" aria-live="polite">{heading}</h3>
            <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
              {kept.length === 0 ? "All metadata removed from the JPGs." : `Kept ${list(kept)}; everything else removed.`}
            </p>
          </div>
          {!working && (
            <div className="flex flex-wrap gap-3">
              {converted > 0 && t.canShare && (
                <Button variant="primary" onClick={t.share}>Save or share</Button>
              )}
              {converted > 0 && (
                <Button variant={t.canShare ? "soft" : "primary"} onClick={t.downloadAll} disabled={t.zipping}>
                  {t.zipping ? "Zipping…" : converted === 1 ? "Download JPG" : `Download ${converted} JPGs (zip)`}
                </Button>
              )}
              <Button variant="ghost" onClick={t.reset}>Convert more</Button>
            </div>
          )}
        </div>

        {working && (
          <div className="mb-5 h-1.5 overflow-hidden rounded-full bg-[var(--card-elevated)]" aria-hidden>
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-[width] duration-300"
              style={{ width: `${total ? (finished / total) * 100 : 0}%` }}
            />
          </div>
        )}

        {t.saveError && <p className="mb-4 text-[14px] text-[var(--danger)]" role="alert">{t.saveError}</p>}
        {t.skipped.length > 0 && (
          <p role="status" className="mb-4 break-words text-[13px] leading-relaxed text-[var(--text-muted)]">
            Skipped {t.skipped.length} {t.skipped.length === 1 ? "file" : "files"} that {t.skipped.length === 1 ? "isn't an image" : "aren't images"} the converter takes: {t.skipped.slice(0, 2).join(", ")}
            {t.skipped.length > 2 ? ` and ${t.skipped.length - 2} more` : ""}.
          </p>
        )}

        <ul className="max-h-[560px] space-y-2.5 overflow-y-auto pr-1 -mr-1">
          {t.items.map((item) => (
            <Row
              key={item.id}
              item={item}
              kept={kept}
              onDownload={!working && item.status === "done" && converted > 1 ? () => t.downloadOne(item.id) : undefined}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

"use client";

import { useRef, type ReactNode } from "react";
import { useDropZone } from "@/hooks/useDropZone";
import { ACCEPTED_TYPES } from "@/lib/constants";
import { Button } from "../ui/Button";

interface Props {
  onFiles: (files: File[]) => void;
  busy: boolean;
  error: string | null;
}

type Kind = "image" | "doc" | "video" | "audio";

const FORMATS: { ext: string; kind: Kind }[] = [
  { ext: "jpeg", kind: "image" }, { ext: "png", kind: "image" }, { ext: "webp", kind: "image" },
  { ext: "pdf", kind: "doc" }, { ext: "docx", kind: "doc" }, { ext: "xlsx", kind: "doc" }, { ext: "pptx", kind: "doc" },
  { ext: "mp4", kind: "video" }, { ext: "mov", kind: "video" },
  { ext: "mp3", kind: "audio" }, { ext: "m4a", kind: "audio" }, { ext: "flac", kind: "audio" }, { ext: "wav", kind: "audio" },
];

const ICON = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none" } as const;
const KIND_ICON: Record<Kind, ReactNode> = {
  image: (
    <svg {...ICON}>
      <rect x="3" y="4" width="18" height="16" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8.5" cy="9.5" r="1.6" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4 18l5-4 4 3 3-2 4 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  doc: (
    <svg {...ICON}>
      <path d="M6 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M14 3v4h4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  ),
  video: (
    <svg {...ICON}>
      <rect x="3" y="5" width="18" height="14" rx="2.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M10.5 9.5l4 2.5-4 2.5z" fill="currentColor" />
    </svg>
  ),
  audio: (
    <svg {...ICON}>
      <path d="M9 17V5l10-2v12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6.5" cy="17.5" r="2.5" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="16.5" cy="15" r="2.5" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  ),
};

/** A format label that flips on hover to reveal its file-type icon.
 *  3D properties are written with -webkit- prefixes too, or Safari flattens
 *  the transform and shows both faces at once. */
function FormatChip({ ext, kind }: { ext: string; kind: Kind }) {
  const hidden = { backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" } as React.CSSProperties;
  return (
    <span
      className="group/chip relative inline-block align-middle transition-colors duration-200 hover:text-[var(--text)]"
      style={{ perspective: "320px", WebkitPerspective: "320px" } as React.CSSProperties}
    >
      <span
        className="relative block transition-transform duration-500 ease-[cubic-bezier(0.5,1.4,0.5,1)] motion-safe:group-hover/chip:[transform:rotateY(180deg)]"
        style={{ transformStyle: "preserve-3d", WebkitTransformStyle: "preserve-3d" } as React.CSSProperties}
      >
        {/* front: the word */}
        <span className="block" style={hidden}>{ext}</span>
        {/* back: the file-type icon, pre-flipped so it reads upright after the spin */}
        <span
          className="absolute inset-0 grid place-items-center"
          style={{ ...hidden, transform: "rotateY(180deg)", WebkitTransform: "rotateY(180deg)" } as React.CSSProperties}
          aria-hidden
        >
          {KIND_ICON[kind]}
        </span>
      </span>
    </span>
  );
}

export function CardDropzone({ onFiles, busy, error }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { isDragOver, dragHandlers } = useDropZone({
    onFiles,
    acceptedTypes: ACCEPTED_TYPES,
  });

  return (
    <div
      {...dragHandlers}
      onClick={() => inputRef.current?.click()}
      className={`group relative flex h-full min-h-[360px] flex-col items-center justify-center overflow-hidden
        rounded-[var(--radius)] px-8 py-20 text-center cursor-pointer transition-all duration-300
        ${isDragOver
          ? "bg-[color-mix(in_srgb,var(--primary)_10%,var(--surface))] shadow-[inset_0_0_0_2px_var(--border-strong)]"
          : "bg-[var(--surface)]"}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_TYPES.join(",")}
        className="hidden"
        onChange={(e) => {
          if (e.target.files) onFiles(Array.from(e.target.files));
          e.target.value = "";
        }}
      />

      <div
        className={`mb-8 grid place-items-center h-20 w-20 rounded-[20px] bg-[var(--card-elevated)] transition-transform duration-300 ${
          isDragOver ? "scale-110 -translate-y-1" : ""
        }`}
        aria-hidden
      >
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
          <path d="M12 16V4m0 0L7 9m5-5l5 5" stroke="var(--text)" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="var(--text-muted)" strokeWidth="1.7" strokeLinecap="round" />
        </svg>
      </div>

      <p className="max-w-[460px] text-[clamp(17px,1.9vw,22px)] leading-[1.45] text-[var(--text)]">
        {busy
          ? "Reading your files…"
          : isDragOver
            ? "Drop them right here."
            : "Drag & drop your files, or click to browse. Everything is processed in your browser. No uploads to external servers."}
      </p>

      <div className="mt-8">
        <Button
          size="lg"
          variant="primary"
          hoverIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          }
        >
          Choose files
        </Button>
      </div>

      <div className="v3-mono mt-7 flex flex-wrap items-center justify-center text-[14px] tracking-wide text-[var(--text-muted)]">
        {FORMATS.map((f, i) => (
          <span key={f.ext} className="inline-flex items-center">
            {i > 0 && <span aria-hidden className="select-none px-2 opacity-50">·</span>}
            <FormatChip ext={f.ext} kind={f.kind} />
          </span>
        ))}
      </div>

      {error && (
        <p className="mt-5 text-[14px] text-[var(--danger)]" role="alert">{error}</p>
      )}
    </div>
  );
}

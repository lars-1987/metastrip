"use client";

import { useRef, useCallback, useState, useEffect } from "react";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useDropZone } from "@/hooks/useDropZone";
import {
  ACCEPTED_TYPES,
  BATCH_LIMIT,
  RELEVANT_CATEGORIES_BY_FILE_CATEGORY,
} from "@/lib/constants";
import type { MetadataCategory } from "@/lib/processing/types";
import { detectFileType, getFileCategory } from "@/lib/file-utils";
import { TerminalPrompt } from "./TerminalPrompt";
import { TerminalFileList } from "./TerminalFileList";
import { TerminalStripTags } from "./TerminalStripTags";
import { TerminalOutput } from "./TerminalOutput";
import { TerminalActions } from "./TerminalActions";
import { trackFileDownloaded } from "@/lib/analytics";
import { useClock } from "@/hooks/useClock";
import { isChunkLoadError, reloadForStaleChunk } from "@/lib/chunk-reload";

function SystemClockPill() {
  const now = useClock();
  const label = now
    ? now.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
    : "";
  return (
    <span
      className="px-2 py-0.5 rounded bg-white/[0.04] text-white/60 tabular-nums"
      suppressHydrationWarning
    >
      {label || "—"}
    </span>
  );
}

interface TerminalSessionTabProps {
  onOpenSupport?: () => void;
}

export function TerminalSessionTab({ onOpenSupport }: TerminalSessionTabProps) {
  const {
    files,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    downloadZip,
    stripOptions,
    setStripOptions,
    batchProgress,
    processingLog,
  } = useFileProcessor();

  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const handleFiles = useCallback(
    (newFiles: File[]) => {
      setAddError(null);
      const result = addFiles(newFiles);
      if (result.error) setAddError(result.error);
    },
    [addFiles]
  );

  // Listen for demo file drops from desktop icons
  useEffect(() => {
    function handleDemoFile(e: Event) {
      const file = (e as CustomEvent).detail as File;
      if (file) handleFiles([file]);
    }
    window.addEventListener("metastrip-demo-file", handleDemoFile);
    return () => window.removeEventListener("metastrip-demo-file", handleDemoFile);
  }, [handleFiles]);

  const { isDragOver, dragHandlers } = useDropZone({
    onFiles: handleFiles,
    acceptedTypes: ACCEPTED_TYPES,
  });

  const isProcessing = files.some((f) => f.status === "processing");

  // Auto-scroll to bottom on any DOM changes (catches animated lines appearing via setTimeout)
  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    const observer = new MutationObserver(() => {
      bottomRef.current?.scrollIntoView({ block: "end" });
    });
    observer.observe(container, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  const hasPending = files.some((f) => f.status === "pending");
  const doneFiles = files.filter((f) => f.status === "done" && f.result);
  const hasDone = doneFiles.length > 0;

  // Union of metadata categories relevant to any file in the batch.
  // Hides toggles like "GPS" when only audio files are queued, etc.
  const relevantCategories = (() => {
    const union = new Set<MetadataCategory>();
    for (const f of files) {
      const type = detectFileType(f.file);
      if (!type) continue;
      const cat = getFileCategory(type);
      for (const m of RELEVANT_CATEGORIES_BY_FILE_CATEGORY[cat]) union.add(m);
    }
    return union;
  })();

  const handleExecute = useCallback(async () => {
    await processAll(stripOptions);
  }, [processAll, stripOptions]);

  const handleDownload = useCallback(async () => {
    try {
      if (doneFiles.length === 1 && doneFiles[0].result) {
        const r = doneFiles[0].result;
        const { saveAs } = await import("file-saver");
        saveAs(r.cleanedBlob, `cleaned_${r.report.fileName}`);
        trackFileDownloaded({ file_type: r.originalFile.type });
      } else {
        await downloadZip();
      }
    } catch (err) {
      // Most likely a stale dynamic-import chunk after a deploy — reload to
      // fetch fresh chunks. If it's something else, surface it gently rather
      // than letting it bubble to the error boundary.
      if (isChunkLoadError(err) && reloadForStaleChunk()) return;
      setAddError("Download failed — please reload the page and try again.");
    }
  }, [doneFiles, downloadZip]);

  const handleToggle = useCallback(
    (key: MetadataCategory) => {
      setStripOptions((prev) => ({ ...prev, [key]: !prev[key] }));
    },
    [setStripOptions]
  );

  const handleToggleAll = useCallback(() => {
    // Only consider categories actually visible to the user — toggling "all"
    // shouldn't flip hidden categories the user can't see.
    const visible: MetadataCategory[] =
      relevantCategories.size > 0
        ? (Array.from(relevantCategories) as MetadataCategory[])
        : ["gps", "device", "dates", "author", "software", "copyright", "ai", "comments", "custom"];
    const allSelected = visible.every((c) => stripOptions[c]);
    const newValue = !allSelected;
    setStripOptions((prev) => {
      const next = { ...prev };
      for (const c of visible) next[c] = newValue;
      return next;
    });
  }, [stripOptions, setStripOptions, relevantCategories]);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const fileList = e.target.files;
      if (fileList) {
        handleFiles(Array.from(fileList));
        e.target.value = "";
      }
    },
    [handleFiles]
  );

  return (
    <div
      ref={scrollRef}
      className={`flex-1 overflow-y-auto transition-colors duration-200 ${
        isDragOver ? "bg-purple/[0.03]" : ""
      }`}
      {...dragHandlers}
    >
      <div className="min-h-full flex flex-col justify-end p-4 pb-20 md:p-6 md:pb-6">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          onChange={handleInputChange}
          className="hidden"
        />

        {files.length === 0 && (
          <>
            {/* Upload badge */}
            <div
              className={`flex flex-col items-center justify-center py-10 mb-6 rounded-xl border border-dashed cursor-pointer transition-all duration-200 animate-card-slide-in ${
                isDragOver
                  ? "border-purple-light/40 bg-purple/[0.06]"
                  : "border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.02]"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
            >
              <div className={`text-3xl mb-3 transition-transform duration-200 ${isDragOver ? "scale-110 -translate-y-1" : ""}`}>
                {isDragOver ? "↓" : "↑"}
              </div>
              <div className={`font-[family-name:var(--font-mono)] text-sm transition-colors duration-200 ${
                isDragOver ? "text-purple-light" : "text-white/45"
              }`}>
                {isDragOver ? "drop files here..." : "drag & drop files or click to browse"}
              </div>
              <div className="font-[family-name:var(--font-mono)] text-[11px] text-white/30 mt-1.5">
                jpeg, png, webp, pdf, docx, xlsx, pptx, mp4, mov, mp3, m4a, flac, wav
              </div>
            </div>

            <div className="font-[family-name:var(--font-mono)] text-sm space-y-1.5 mb-4 animate-card-slide-in [animation-delay:100ms]">
              <div className="text-white/65">
                metastrip v2.0 — client-side metadata removal
              </div>
              <div className="text-white/65">
                batch limit: {BATCH_LIMIT} files | all processing happens in your browser
              </div>
            </div>
          </>
        )}

        {files.length > 0 && (
          <div className="mb-3 animate-card-slide-in">
            <TerminalFileList files={files} onRemoveFile={removeFile} />
          </div>
        )}

        {files.length > 0 && hasPending && !isProcessing && (
          <div className="mb-1">
            <div className="text-xs text-white/50 font-[family-name:var(--font-mono)] mb-1">
              select metadata to remove:
            </div>
            <TerminalStripTags
              stripOptions={stripOptions}
              onToggle={handleToggle}
              onToggleAll={handleToggleAll}
              relevantCategories={relevantCategories}
            />
          </div>
        )}

        <TerminalPrompt
          files={files}
          stripOptions={stripOptions}
          isProcessing={isProcessing}
        />

        {addError && (
          <div className="text-xs text-warning font-[family-name:var(--font-mono)] mt-1">
            ⚠ {addError}
          </div>
        )}

        <TerminalOutput
          log={processingLog}
          total={batchProgress?.total ?? files.filter((f) => f.status !== "pending").length}
          stripOptions={stripOptions}
          onOpenSupport={onOpenSupport}
        />

        <TerminalActions
          hasFiles={files.length > 0}
          hasPending={hasPending}
          hasDone={hasDone}
          doneCount={doneFiles.length}
          isProcessing={isProcessing}
          onExecute={handleExecute}
          onDownload={handleDownload}
          onClear={clearAll}
        />

        {/* tmux-style status bar */}
        {files.length === 0 && (
          <div className="flex flex-wrap items-center gap-1.5 mt-6 pt-3 border-t border-white/[0.04] font-[family-name:var(--font-mono)] text-[11px] animate-card-slide-in [animation-delay:200ms]">
            <span className="px-2 py-0.5 rounded bg-purple/20 text-purple-light">v2.0</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/40">client-side</span>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-white/40">no tracking</span>
            <a
              href="https://github.com/lars-1987/metastrip"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2 py-0.5 rounded bg-white/[0.04] text-amber-400/70 hover:bg-white/[0.06] hover:text-amber-300 transition-colors no-underline flex items-center gap-1"
              title="View source on GitHub"
            >
              <span>⎇ main</span>
              <span className="text-cyan-300/70">↑3</span>
              <span className="text-amber-300/80">✱</span>
            </a>
            <span className="px-2 py-0.5 rounded bg-white/[0.04] text-emerald-400/70">✓ build passing</span>
            <span className="flex-1" />
            <SystemClockPill />
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}

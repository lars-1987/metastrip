"use client";

import { useState, useCallback, useEffect } from "react";
import { processFile } from "@/lib/processing/coordinator";
import type {
  FileEntry,
  StripOptions,
  ProcessingResult,
} from "@/lib/processing/types";
import { DEFAULT_STRIP_OPTIONS } from "@/lib/processing/types";
import { FREE_TIER } from "@/lib/constants";
import {
  trackFileAdded,
  trackFileStripped,
  trackDailyLimitReached,
} from "@/lib/analytics";

function getDailyKey(): string {
  const d = new Date();
  return `metastrip_daily_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getDailyCount(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(getDailyKey());
  return val ? parseInt(val, 10) : 0;
}

function incrementDailyCount(): void {
  if (typeof window === "undefined") return;
  const key = getDailyKey();
  const current = getDailyCount();
  localStorage.setItem(key, String(current + 1));
}

export interface BatchProgress {
  completed: number;
  total: number;
  currentFileName?: string;
}

export function useFileProcessor() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [stripOptions, setStripOptions] =
    useState<StripOptions>(DEFAULT_STRIP_OPTIONS);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(
    null
  );

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const entries: FileEntry[] = newFiles.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: "pending" as const,
      }));

      trackFileAdded({
        file_type: newFiles.map((f) => f.type).join(","),
        file_size: newFiles.reduce((sum, f) => sum + f.size, 0),
        file_count: newFiles.length,
      });

      setFiles((prev) => [...prev, ...entries]);
      if (entries.length > 0 && !selectedFileId) {
        setSelectedFileId(entries[0].id);
      }
    },
    [selectedFileId]
  );

  const removeFile = useCallback(
    (id: string) => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
      if (selectedFileId === id) setSelectedFileId(null);
    },
    [selectedFileId]
  );

  const clearAll = useCallback(() => {
    setFiles([]);
    setSelectedFileId(null);
    setBatchProgress(null);
  }, []);

  // Free tier: single file processing with daily limits
  const processSingle = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      const count = getDailyCount();
      if (count >= FREE_TIER.maxFilesPerDay) {
        trackDailyLimitReached();
        return {
          error: `Daily limit reached (${FREE_TIER.maxFilesPerDay} files). Get a Batch Pass for more.`,
        };
      }

      const entry = files.find((f) => f.id === id);
      if (!entry) return { error: "File not found" };

      const maxBytes = FREE_TIER.maxFileSizeMB * 1024 * 1024;
      if (entry.file.size > maxBytes) {
        return {
          error: `File too large (max ${FREE_TIER.maxFileSizeMB}MB)`,
        };
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "processing" as const } : f
        )
      );

      try {
        const result = await processFile(entry.file);

        if (result.error) {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === id
                ? { ...f, status: "error" as const, result }
                : f
            )
          );
          return { error: result.error };
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "done" as const, result } : f
          )
        );
        incrementDailyCount();

        trackFileStripped({
          file_type: entry.file.type,
          file_size: entry.file.size,
          fields_removed_count: result.report.fieldsRemoved.length,
        });

        return {};
      } catch {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "error" as const } : f
          )
        );
        return { error: "Processing failed" };
      }
    },
    [files]
  );

  // Batch mode: process all pending files (no daily limit)
  const processAll = useCallback(
    async (options: StripOptions): Promise<number> => {
      const pending = files.filter((f) => f.status === "pending");
      if (pending.length === 0) return 0;

      setBatchProgress({ completed: 0, total: pending.length });
      let successCount = 0;
      let firstDoneId: string | null = null;

      for (let i = 0; i < pending.length; i++) {
        const entry = pending[i];
        setBatchProgress({
          completed: i,
          total: pending.length,
          currentFileName: entry.file.name,
        });

        setFiles((prev) =>
          prev.map((f) =>
            f.id === entry.id
              ? { ...f, status: "processing" as const }
              : f
          )
        );

        try {
          const result = await processFile(entry.file, options);
          const status = result.error ? ("error" as const) : ("done" as const);
          if (!result.error) {
            successCount++;
            if (!firstDoneId) firstDoneId = entry.id;

            trackFileStripped({
              file_type: entry.file.type,
              file_size: entry.file.size,
              fields_removed_count: result.report.fieldsRemoved.length,
            });
          }

          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id ? { ...f, status, result } : f
            )
          );
        } catch {
          setFiles((prev) =>
            prev.map((f) =>
              f.id === entry.id
                ? { ...f, status: "error" as const }
                : f
            )
          );
        }
      }

      setBatchProgress({
        completed: pending.length,
        total: pending.length,
      });

      if (firstDoneId) {
        setSelectedFileId(firstDoneId);
      }

      return successCount;
    },
    [files]
  );

  // Download all completed files as ZIP with audit report
  const downloadZip = useCallback(async () => {
    const completed = files.filter(
      (f) => f.status === "done" && f.result
    );
    if (completed.length === 0) return;

    const JSZip = (await import("jszip")).default;
    const { saveAs } = await import("file-saver");
    const { generateAuditReport } = await import(
      "@/lib/processing/report"
    );

    const zip = new JSZip();
    const results: ProcessingResult[] = [];

    for (const entry of completed) {
      if (!entry.result) continue;
      results.push(entry.result);
      zip.file(
        `cleaned_${entry.result.report.fileName}`,
        entry.result.cleanedBlob
      );
    }

    const report = generateAuditReport(results);
    zip.file("metastrip-report.json", JSON.stringify(report, null, 2));

    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `metastrip-batch-${Date.now()}.zip`);
  }, [files]);

  const [remainingToday, setRemainingToday] = useState(
    FREE_TIER.maxFilesPerDay
  );

  // Sync with localStorage after mount to avoid hydration mismatch
  useEffect(() => {
    setRemainingToday(FREE_TIER.maxFilesPerDay - getDailyCount());
  }, [files]);

  return {
    files,
    selectedFileId,
    setSelectedFileId,
    addFiles,
    removeFile,
    clearAll,
    processSingle,
    processAll,
    downloadZip,
    stripOptions,
    setStripOptions,
    batchProgress,
    remainingToday,
  };
}

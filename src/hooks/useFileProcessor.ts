"use client";

import { useState, useCallback } from "react";
import { processFile } from "@/lib/processing/coordinator";
import type {
  FileEntry,
  StripOptions,
  ProcessingResult,
} from "@/lib/processing/types";
import { DEFAULT_STRIP_OPTIONS } from "@/lib/processing/types";
import { BATCH_LIMIT } from "@/lib/constants";
import type { MetadataCategory } from "@/lib/processing/types";
import {
  trackFileAdded,
  trackFileStripped,
} from "@/lib/analytics";

export interface BatchProgress {
  completed: number;
  total: number;
  currentFileName?: string;
}

export interface CategoryResult {
  category: MetadataCategory;
  fieldsRemoved: number;
}

export interface ProcessingLogEntry {
  fileId: string;
  fileName: string;
  status: "processing" | "done" | "error";
  fieldsRemoved?: number;
  categoryResults?: CategoryResult[];
  error?: string;
}

export function useFileProcessor() {
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [stripOptions, setStripOptions] =
    useState<StripOptions>(DEFAULT_STRIP_OPTIONS);
  const [batchProgress, setBatchProgress] = useState<BatchProgress | null>(
    null
  );
  const [processingLog, setProcessingLog] = useState<ProcessingLogEntry[]>([]);

  const addFiles = useCallback(
    (newFiles: File[]): { error?: string } => {
      const currentCount = files.length;
      const available = BATCH_LIMIT - currentCount;

      if (available <= 0) {
        return { error: `Batch limit reached (max ${BATCH_LIMIT} files)` };
      }

      const toAdd = newFiles.slice(0, available);

      const entries: FileEntry[] = toAdd.map((file) => ({
        file,
        id: `${file.name}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        status: "pending" as const,
      }));

      trackFileAdded({
        file_type: toAdd.map((f) => f.type).join(","),
        file_size: toAdd.reduce((sum, f) => sum + f.size, 0),
        file_count: toAdd.length,
      });

      setFiles((prev) => [...prev, ...entries]);
      if (entries.length > 0 && !selectedFileId) {
        setSelectedFileId(entries[0].id);
      }

      if (toAdd.length < newFiles.length) {
        return { error: `Only added ${toAdd.length} of ${newFiles.length} files (max ${BATCH_LIMIT})` };
      }

      return {};
    },
    [files.length, selectedFileId]
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
    setProcessingLog([]);
  }, []);

  const processSingle = useCallback(
    async (id: string): Promise<{ error?: string }> => {
      const entry = files.find((f) => f.id === id);
      if (!entry) return { error: "File not found" };

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: "processing" as const } : f
        )
      );

      setProcessingLog((prev) => [
        ...prev,
        { fileId: id, fileName: entry.file.name, status: "processing" },
      ]);

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
          setProcessingLog((prev) =>
            prev.map((l) =>
              l.fileId === id ? { ...l, status: "error" as const, error: result.error } : l
            )
          );
          return { error: result.error };
        }

        setFiles((prev) =>
          prev.map((f) =>
            f.id === id ? { ...f, status: "done" as const, result } : f
          )
        );

        const catMap = new Map<MetadataCategory, number>();
        for (const field of result.report.fieldsRemoved) {
          catMap.set(field.category, (catMap.get(field.category) ?? 0) + 1);
        }
        const categoryResults: CategoryResult[] = Array.from(catMap.entries()).map(
          ([category, fieldsRemoved]) => ({ category, fieldsRemoved })
        );

        setProcessingLog((prev) =>
          prev.map((l) =>
            l.fileId === id
              ? { ...l, status: "done" as const, fieldsRemoved: result.report.fieldsRemoved.length, categoryResults }
              : l
          )
        );

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
        setProcessingLog((prev) =>
          prev.map((l) =>
            l.fileId === id ? { ...l, status: "error" as const, error: "Processing failed" } : l
          )
        );
        return { error: "Processing failed" };
      }
    },
    [files]
  );

  const processAll = useCallback(
    async (options: StripOptions): Promise<number> => {
      const pending = files.filter((f) => f.status === "pending");
      if (pending.length === 0) return 0;

      setBatchProgress({ completed: 0, total: pending.length });
      setProcessingLog([]);
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

        setProcessingLog((prev) => [
          ...prev,
          { fileId: entry.id, fileName: entry.file.name, status: "processing" },
        ]);

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

          let categoryResults: CategoryResult[] | undefined;
          if (!result.error) {
            const catMap = new Map<MetadataCategory, number>();
            for (const field of result.report.fieldsRemoved) {
              catMap.set(field.category, (catMap.get(field.category) ?? 0) + 1);
            }
            categoryResults = Array.from(catMap.entries()).map(
              ([category, fieldsRemoved]) => ({ category, fieldsRemoved })
            );
          }

          setProcessingLog((prev) =>
            prev.map((l) =>
              l.fileId === entry.id
                ? {
                    ...l,
                    status,
                    fieldsRemoved: result.error ? undefined : result.report.fieldsRemoved.length,
                    categoryResults,
                    error: result.error,
                  }
                : l
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
          setProcessingLog((prev) =>
            prev.map((l) =>
              l.fileId === entry.id
                ? { ...l, status: "error" as const, error: "Processing failed" }
                : l
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
    processingLog,
  };
}

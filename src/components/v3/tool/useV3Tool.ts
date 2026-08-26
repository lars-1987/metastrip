"use client";

import { useCallback, useMemo, useState } from "react";
import { processFile } from "@/lib/processing/coordinator";
import { detectFileType, getFileCategory, formatBytes } from "@/lib/file-utils";
import { BATCH_LIMIT, BATCH_SIZE_WARN_BYTES, BATCH_SIZE_HARD_CAP_BYTES, RELEVANT_CATEGORIES_BY_FILE_CATEGORY } from "@/lib/constants";
import type { StripOptions, MetadataCategory, MetadataReport } from "@/lib/processing/types";
import { trackFileAdded, trackFileStripped, trackFileDownloaded, trackFileFailed } from "@/lib/analytics";
import { prefersReducedMotion } from "../motion";

export type Phase = "drop" | "review" | "done";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const ALL_ON: StripOptions = {
  gps: true, device: true, dates: true, author: true, software: true,
  copyright: true, ai: true, comments: true, custom: true,
};

const CATEGORY_ORDER: MetadataCategory[] = [
  "gps", "device", "dates", "author", "software", "ai", "copyright", "comments", "custom",
];

export interface ToolEntry {
  id: string;
  file: File;
  scan: MetadataReport;          // fieldsFound for this file
  fullyStrippedBlob: Blob;       // pre-computed full strip (for the all-on path)
  options: StripOptions;         // per-file selection
  cleanedBlob?: Blob;
  finalReport?: MetadataReport;
  error?: string;
}

function optionsAllOn(o: StripOptions): boolean {
  return CATEGORY_ORDER.every((c) => o[c]);
}

export function useV3Tool() {
  const [phase, setPhase] = useState<Phase>("drop");
  const [entries, setEntries] = useState<ToolEntry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [running, setRunning] = useState(false);
  const [tickedIds, setTickedIds] = useState<string[]>([]);
  /** Live scan progress. Scanning is the slow part (~500ms/file), so a large
   *  batch needs real feedback rather than one static "reading files" label. */
  const [scanProgress, setScanProgress] = useState<{ done: number; total: number; large: boolean } | null>(null);

  const addFiles = useCallback(async (incoming: File[]) => {
    setAddError(null);
    const supported = incoming.filter((f) => detectFileType(f) !== null);

    // Anything we turned away is worth knowing about: the rejected mime types
    // are a direct read on which formats to support next.
    for (const f of incoming.filter((f) => detectFileType(f) === null)) {
      trackFileFailed({
        file_type: f.type || "unknown",
        file_size: f.size,
        stage: "add",
        reason: "unsupported_type",
      });
    }

    if (supported.length === 0) { setAddError("Those file types aren't supported yet."); return; }
    if (supported.length > BATCH_LIMIT) {
      trackFileFailed({
        file_type: supported.map((f) => f.type).join(","),
        file_size: supported.reduce((s, f) => s + f.size, 0),
        stage: "add",
        reason: "batch_limit",
      });
      setAddError(`Up to ${BATCH_LIMIT} files at a time.`);
      return;
    }

    const totalBytes = supported.reduce((s, f) => s + f.size, 0);
    if (totalBytes > BATCH_SIZE_HARD_CAP_BYTES) {
      trackFileFailed({
        file_type: supported.map((f) => f.type).join(","),
        file_size: totalBytes,
        stage: "add",
        reason: "batch_size_cap",
      });
      setAddError(
        `That batch is ${formatBytes(totalBytes)}. Up to ${formatBytes(BATCH_SIZE_HARD_CAP_BYTES)} at a time.`
      );
      return;
    }

    setBusy(true);
    trackFileAdded({
      file_type: supported.map((f) => f.type).join(","),
      file_size: supported.reduce((s, f) => s + f.size, 0),
      file_count: supported.length,
    });

    const large = totalBytes > BATCH_SIZE_WARN_BYTES;
    setScanProgress({ done: 0, total: supported.length, large });

    const scanned: ToolEntry[] = [];
    for (const file of supported) {
      const r = await processFile(file, { ...ALL_ON });
      if (r.error) {
        trackFileFailed({
          file_type: file.type || "unknown",
          file_size: file.size,
          stage: "scan",
          reason: r.error,
        });
      }
      scanned.push({
        id: `${file.name}-${file.size}-${scanned.length}-${file.lastModified}`,
        file,
        scan: r.report,
        fullyStrippedBlob: r.cleanedBlob,
        options: { ...ALL_ON },
        error: r.error,
      });
      // Publish as we go: each file appears in the list the moment it is really
      // done, so a 75-file batch shows genuine progress instead of looking hung.
      setEntries([...scanned]);
      setScanProgress({ done: scanned.length, total: supported.length, large });
      if (scanned.length === 1) {
        setSelectedId(scanned[0].id);
        setPhase("review");
      }
    }
    setScanProgress(null);
    setBusy(false);
  }, []);

  /** Files the dropzone turned away before they reached addFiles. Same message
   *  and same telemetry as an unsupported pick from the file input. */
  const rejectFiles = useCallback((rejected: File[]) => {
    for (const f of rejected) {
      trackFileFailed({
        file_type: f.type || "unknown",
        file_size: f.size,
        stage: "add",
        reason: "unsupported_type",
      });
    }
    setAddError("Those file types aren't supported yet.");
  }, []);

  const removeEntry = useCallback((id: string) => {
    setEntries((prev) => {
      const next = prev.filter((e) => e.id !== id);
      if (next.length === 0) { setPhase("drop"); setSelectedId(null); }
      else setSelectedId((sel) => (sel === id ? next[0].id : sel));
      return next;
    });
  }, []);

  const selectEntry = useCallback((id: string) => setSelectedId(id), []);

  // mutate the active file's options
  const setCategory = useCallback((cat: MetadataCategory, on: boolean) => {
    setEntries((prev) =>
      prev.map((e) => (e.id === selectedId ? { ...e, options: { ...e.options, [cat]: on } } : e))
    );
  }, [selectedId]);

  const setAll = useCallback((on: boolean) => {
    setEntries((prev) =>
      prev.map((e) =>
        e.id === selectedId
          ? { ...e, options: CATEGORY_ORDER.reduce((a, c) => ({ ...a, [c]: on }), {} as StripOptions) }
          : e
      )
    );
  }, [selectedId]);

  const runRemoval = useCallback(async () => {
    if (running) return;
    setBusy(true);
    setRunning(true);
    setTickedIds([]);

    // do the real work (instant for the all-on fast path, a beat for partial)
    const finished: ToolEntry[] = [];
    for (const e of entries) {
      let cleanedBlob = e.fullyStrippedBlob;
      let finalReport = e.scan;
      if (!optionsAllOn(e.options)) {
        const r = await processFile(e.file, { ...e.options });
        cleanedBlob = r.cleanedBlob;
        finalReport = r.report;
        if (r.error) {
          trackFileFailed({
            file_type: e.file.type || "unknown",
            file_size: e.file.size,
            stage: "strip",
            reason: r.error,
          });
        }
      }
      trackFileStripped({
        file_type: e.file.type,
        file_size: e.file.size,
        fields_removed_count: finalReport.fieldsRemoved.length,
      });
      finished.push({ ...e, cleanedBlob, finalReport });
    }
    setEntries(finished);

    // staggered spinner → tick over each file. It's mostly psychological: the
    // strip is near-instant, but an instant jump to "done" reads as suspicious.
    if (!prefersReducedMotion()) {
      const ids = entries.map((e) => e.id);
      // Spread the ticks over a fixed window rather than a fixed per-file delay.
      // The strip itself is near-instant, so this is reassurance, not progress;
      // at 75 files a per-file delay added ~12s on top of a scan already watched.
      const stagger = Math.min(420, Math.max(16, Math.round(1500 / ids.length)));
      await sleep(450); // everything spins first
      for (let i = 0; i < ids.length; i++) {
        setTickedIds(ids.slice(0, i + 1));
        await sleep(stagger);
      }
      await sleep(450); // let the last tick land
    }

    setRunning(false);
    setPhase("done");
    setBusy(false);
  }, [entries, running]);

  const reset = useCallback(() => {
    setEntries([]);
    setSelectedId(null);
    setAddError(null);
    setPhase("drop");
  }, []);

  const download = useCallback(async () => {
    const done = entries.filter((e) => e.cleanedBlob && e.finalReport);
    if (done.length === 0) return;
    try {
      if (done.length === 1) {
        const { saveAs } = await import("file-saver");
        saveAs(done[0].cleanedBlob!, `cleaned_${done[0].file.name}`);
        trackFileDownloaded({ file_type: done[0].file.type });
      } else {
        const JSZip = (await import("jszip")).default;
        const { saveAs } = await import("file-saver");
        const zip = new JSZip();
        for (const e of done) zip.file(`cleaned_${e.file.name}`, e.cleanedBlob!);
        const blob = await zip.generateAsync({ type: "blob" });
        saveAs(blob, "metastrip-cleaned.zip");
        done.forEach((e) => trackFileDownloaded({ file_type: e.file.type }));
      }
    } catch {
      setAddError("Download failed; please reload and try again.");
    }
  }, [entries]);

  const activeEntry = useMemo(
    () => entries.find((e) => e.id === selectedId) ?? entries[0] ?? null,
    [entries, selectedId]
  );

  // visible category toggles for the ACTIVE file
  const visibleCategories = useMemo(() => {
    if (!activeEntry) return [];
    const type = detectFileType(activeEntry.file);
    const relevant = type ? RELEVANT_CATEGORIES_BY_FILE_CATEGORY[getFileCategory(type)] : null;
    const set = new Set<MetadataCategory>();
    for (const f of activeEntry.scan.fieldsFound) {
      if (!relevant || relevant.has(f.category)) set.add(f.category);
    }
    return CATEGORY_ORDER.filter((c) => set.has(c));
  }, [activeEntry]);

  const allFilesAllOn = useMemo(() => entries.every((e) => optionsAllOn(e.options)), [entries]);

  return {
    phase, entries, selectedId, activeEntry, addError, busy, running, tickedIds, scanProgress,
    visibleCategories, allFilesAllOn,
    addFiles, rejectFiles, removeEntry, selectEntry, setCategory, setAll, runRemoval, reset, download,
  };
}

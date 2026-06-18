"use client";

import { useCallback, useMemo, useState } from "react";
import { processFile } from "@/lib/processing/coordinator";
import { detectFileType, getFileCategory } from "@/lib/file-utils";
import { BATCH_LIMIT, RELEVANT_CATEGORIES_BY_FILE_CATEGORY } from "@/lib/constants";
import type { StripOptions, MetadataCategory, MetadataReport } from "@/lib/processing/types";
import { trackFileAdded, trackFileStripped, trackFileDownloaded } from "@/lib/analytics";
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

  const addFiles = useCallback(async (incoming: File[]) => {
    setAddError(null);
    const supported = incoming.filter((f) => detectFileType(f) !== null);
    if (supported.length === 0) { setAddError("Those file types aren't supported yet."); return; }
    if (supported.length > BATCH_LIMIT) { setAddError(`Up to ${BATCH_LIMIT} files at a time.`); return; }

    setBusy(true);
    trackFileAdded({
      file_type: supported.map((f) => f.type).join(","),
      file_size: supported.reduce((s, f) => s + f.size, 0),
      file_count: supported.length,
    });

    const scanned: ToolEntry[] = [];
    for (const file of supported) {
      const r = await processFile(file, { ...ALL_ON });
      scanned.push({
        id: `${file.name}-${file.size}-${scanned.length}-${file.lastModified}`,
        file,
        scan: r.report,
        fullyStrippedBlob: r.cleanedBlob,
        options: { ...ALL_ON },
        error: r.error,
      });
    }
    setEntries(scanned);
    setSelectedId(scanned[0]?.id ?? null);
    setPhase("review");
    setBusy(false);
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
      const stagger = Math.min(420, Math.max(150, Math.round(1500 / ids.length)));
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
    phase, entries, selectedId, activeEntry, addError, busy, running, tickedIds,
    visibleCategories, allFilesAllOn,
    addFiles, removeEntry, selectEntry, setCategory, setAll, runRemoval, reset, download,
  };
}

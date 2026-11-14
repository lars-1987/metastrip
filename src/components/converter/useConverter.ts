"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Converter, ConversionError, type Converted, type ConversionFailure } from "@/lib/conversion/convert";
import { isConvertible } from "@/lib/conversion/formats";
import { stripOptions, uniqueName, type Keepable } from "@/lib/conversion/batch";
import { identify, extensionOf } from "@/lib/processing/formats";
import { verifyCleaned, type VerifyResult } from "@/lib/processing/verify";
import { BATCH_LIMIT, BATCH_SIZE_HARD_CAP_BYTES } from "@/lib/constants";
import { formatBytes } from "@/lib/file-utils";
import type { MetadataCategory } from "@/lib/processing/types";
import { canShareFiles } from "@/lib/share";
import { forDownload } from "@/lib/download";
import {
  trackConverterAdded,
  trackConverterConverted,
  trackConverterDownloaded,
  trackConverterFailed,
  trackConverterVerified,
} from "@/lib/analytics";

/* The converter's state: drop a batch, convert it file by file, save the JPGs.

   One Converter per batch, disposed when the batch ends: libheif's memory
   grows to fit the largest photo and never shrinks, so the next batch starts
   with a fresh worker. Every JPG is read again with every category on, the
   same check the main tool runs, and the result shows on its row. */

export type Phase = "drop" | "working" | "done";
export type { Keepable };

export const KEEPABLE: { category: Keepable; label: string }[] = [
  { category: "gps", label: "Location" },
  { category: "dates", label: "Date taken" },
  { category: "device", label: "Camera details" },
];

export interface ConvertItem {
  id: string;
  file: File;
  status: "queued" | "converting" | "done" | "failed";
  result?: Converted;
  /** The name it's saved under, unique within the batch. */
  outName?: string;
  failure?: ConversionFailure;
  verify?: VerifyResult;
}

export const FAILURE_TEXT: Record<ConversionFailure, string> = {
  unsupported: "Not an image the converter takes.",
  undecodable: "Couldn't read this image. It may be damaged, or use a kind of HEIC this browser can't open.",
  worker: "The converter stopped part-way. Try this one again on its own.",
  failed: "Ran out of memory on this one. Try it on its own, or on a computer.",
};

async function save(blob: Blob, name: string) {
  const { saveAs } = await import("file-saver");
  saveAs(forDownload(blob), name);
}

export function useConverter() {
  const [phase, setPhase] = useState<Phase>("drop");
  const [items, setItems] = useState<ConvertItem[]>([]);
  const [keep, setKeep] = useState<Set<Keepable>>(() => new Set());
  const [addError, setAddError] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [zipping, setZipping] = useState(false);
  /** Bumped by Start over, so a batch still running can't write into the next. */
  const runId = useRef(0);
  const converter = useRef<Converter | null>(null);

  useEffect(() => () => converter.current?.dispose(), []);

  const toggleKeep = useCallback((category: Keepable, on: boolean) => {
    setKeep((prev) => {
      const next = new Set(prev);
      if (on) next.add(category);
      else next.delete(category);
      return next;
    });
  }, []);

  const addFiles = useCallback(async (incoming: File[]) => {
    setAddError(null);
    setSkipped([]);
    setSaveError(null);
    const identities = await Promise.all(incoming.map(identify));
    const accepted: { file: File; format: string }[] = [];
    const turnedAway: string[] = [];
    incoming.forEach((file, i) => {
      const id = identities[i];
      if (id.status === "supported" && isConvertible(id.format)) { accepted.push({ file, format: id.format }); return; }
      turnedAway.push(file.name);
      trackConverterFailed({
        stage: "add",
        reason: "unsupported_type",
        file_type: file.type || "unknown",
        file_ext: extensionOf(file.name),
        file_size: file.size,
        ...(id.status !== "unknown" && { source_format: id.format }),
      });
    });

    if (accepted.length === 0) {
      setAddError("The converter takes HEIC, JPG, PNG, WebP, AVIF and GIF images.");
      return;
    }
    if (accepted.length > BATCH_LIMIT) {
      trackConverterFailed({ stage: "add", reason: "batch_limit", file_size: accepted.reduce((n, a) => n + a.file.size, 0) });
      setAddError(`Up to ${BATCH_LIMIT} images at a time.`);
      return;
    }
    // Files convert one at a time, so the batch size only bounds what the tab
    // holds at once: the sources plus their JPGs.
    const total = accepted.reduce((n, a) => n + a.file.size, 0);
    if (total > BATCH_SIZE_HARD_CAP_BYTES) {
      trackConverterFailed({ stage: "add", reason: "batch_size_cap", file_size: total });
      setAddError(`That batch is ${formatBytes(total)}. Up to ${formatBytes(BATCH_SIZE_HARD_CAP_BYTES)} at a time, so try fewer images at once.`);
      return;
    }

    const run = ++runId.current;
    const strip = stripOptions(keep);
    const list: ConvertItem[] = accepted.map(({ file }, i) => ({
      id: `${i}-${file.name}-${file.size}-${file.lastModified}`,
      file,
      status: "queued",
    }));
    setSkipped(turnedAway);
    setItems(list);
    setPhase("working");
    trackConverterAdded({
      file_count: list.length,
      total_size: total,
      formats: [...new Set(accepted.map((a) => a.format))].sort(),
      keep: [...keep].sort() as MetadataCategory[],
    });

    const update = (id: string, patch: Partial<ConvertItem>) => {
      if (runId.current !== run) return;
      setItems((prev) => prev.map((x) => (x.id === id ? { ...x, ...patch } : x)));
    };

    converter.current?.dispose();
    const conv = new Converter();
    converter.current = conv;
    const taken = new Set<string>();
    try {
      for (let i = 0; i < list.length; i++) {
        if (runId.current !== run) return;
        const item = list[i];
        const format = accepted[i].format;
        update(item.id, { status: "converting" });
        const started = performance.now();
        try {
          const result = await conv.convert(item.file, strip);
          if (runId.current !== run) return;
          trackConverterConverted({
            source_format: format,
            file_size: item.file.size,
            output_size: result.blob.size,
            megapixels: Math.round((result.width * result.height) / 1e5) / 10,
            decoder: result.decoder,
            colour: result.colour,
            duration_ms: Math.round(performance.now() - started),
          });
          const outName = uniqueName(result.name, taken);
          update(item.id, { status: "done", result, outName });
          let verify: VerifyResult;
          try {
            verify = await verifyCleaned(result.blob, outName, "image/jpeg", strip);
          } catch {
            verify = { status: "unchecked", remaining: 0, leftoverCategories: [] };
          }
          trackConverterVerified({ status: verify.status, leftover_categories: verify.leftoverCategories });
          update(item.id, { verify });
        } catch (err) {
          const failure: ConversionFailure = err instanceof ConversionError ? err.reason : "failed";
          trackConverterFailed({
            stage: "convert",
            reason: failure,
            source_format: format,
            file_size: item.file.size,
            detail: err instanceof ConversionError ? err.detail : err instanceof Error ? err.name : "",
          });
          update(item.id, { status: "failed", failure });
        }
      }
    } finally {
      // The batch is over (or abandoned): free the decoder's memory.
      conv.dispose();
      if (converter.current === conv) converter.current = null;
      if (runId.current === run) setPhase("done");
    }
  }, [keep]);

  const done = useMemo(() => items.filter((x) => x.status === "done" && x.result && x.outName), [items]);

  const downloadAll = useCallback(async () => {
    if (done.length === 0) return;
    setSaveError(null);
    try {
      if (done.length === 1) {
        await save(done[0].result!.blob, done[0].outName!);
        trackConverterDownloaded({ file_count: 1, method: "single" });
        return;
      }
      setZipping(true);
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      // JPGs are already compressed: storing them is as small and much faster.
      for (const x of done) zip.file(x.outName!, x.result!.blob, { compression: "STORE" });
      const blob = await zip.generateAsync({ type: "blob" });
      await save(blob, "metastrip-jpg.zip");
      trackConverterDownloaded({ file_count: done.length, method: "zip" });
    } catch {
      setSaveError("Download failed; please reload and try again.");
    } finally {
      setZipping(false);
    }
  }, [done]);

  const downloadOne = useCallback(async (id: string) => {
    const x = done.find((d) => d.id === id);
    if (!x) return;
    setSaveError(null);
    try {
      await save(x.result!.blob, x.outName!);
      trackConverterDownloaded({ file_count: 1, method: "row" });
    } catch {
      setSaveError("Download failed; please reload and try again.");
    }
  }, [done]);

  // Built ahead of the tap: iOS drops the user gesture across an await and
  // then refuses to open the share sheet.
  const shareFiles = useMemo(
    () => (phase === "done" ? done.map((x) => new File([x.result!.blob], x.outName!, { type: "image/jpeg" })) : []),
    [done, phase]
  );
  const canShare = useMemo(() => canShareFiles(shareFiles), [shareFiles]);

  const share = useCallback(() => {
    if (shareFiles.length === 0) return;
    setSaveError(null);
    navigator.share({ files: shareFiles }).then(
      () => trackConverterDownloaded({ file_count: shareFiles.length, method: "share" }),
      (err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSaveError("Sharing didn't work here; use Download instead.");
      }
    );
  }, [shareFiles]);

  const reset = useCallback(() => {
    runId.current++;
    converter.current?.dispose();
    converter.current = null;
    setItems([]);
    setAddError(null);
    setSkipped([]);
    setSaveError(null);
    setPhase("drop");
  }, []);

  const progress = useMemo(() => {
    const finished = items.filter((x) => x.status === "done" || x.status === "failed").length;
    return { finished, total: items.length, converted: done.length, failed: items.filter((x) => x.status === "failed").length };
  }, [items, done]);

  return {
    phase, items, keep, addError, skipped, saveError, zipping, progress, canShare,
    toggleKeep, addFiles, downloadAll, downloadOne, share, reset,
  };
}

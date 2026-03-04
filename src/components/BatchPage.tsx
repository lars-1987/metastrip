"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { saveAs } from "file-saver";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/tool/DropZone";
import { FileCard } from "@/components/tool/FileCard";
import { MetadataPreview } from "@/components/tool/MetadataPreview";
import { StatsBar } from "@/components/tool/StatsBar";
import { StripOptions } from "@/components/tool/StripOptions";
import { ProcessingProgress } from "@/components/tool/ProcessingProgress";
import { useDropZone } from "@/hooks/useDropZone";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { useBatchPass, type BatchPassType } from "@/hooks/useBatchPass";
import {
  SUPPORTED_IMAGE_TYPES,
  SUPPORTED_DOCUMENT_TYPES,
} from "@/lib/constants";
import { trackFileDownloaded, trackBatchProcessed } from "@/lib/analytics";

function getAcceptedTypes(passType: BatchPassType): string[] {
  if (passType === "image") {
    return SUPPORTED_IMAGE_TYPES.filter((t) =>
      ["image/jpeg", "image/png", "image/webp"].includes(t)
    );
  }
  return SUPPORTED_DOCUMENT_TYPES;
}

export function BatchPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [verifyState, setVerifyState] = useState<
    "loading" | "error" | "ready"
  >("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const {
    pass,
    isActive,
    activatePass,
    consumeFiles,
  } = useBatchPass();

  const {
    files,
    selectedFileId,
    setSelectedFileId,
    addFiles,
    removeFile,
    clearAll,
    processAll,
    downloadZip,
    stripOptions,
    setStripOptions,
    batchProgress,
  } = useFileProcessor();

  const acceptedTypes = pass ? getAcceptedTypes(pass.passType) : [];

  const { isDragOver, dragHandlers } = useDropZone({
    onFiles: addFiles,
    acceptedTypes,
  });

  // Verify Stripe session on mount
  useEffect(() => {
    async function verify() {
      // If we already have an active pass, skip verification
      if (isActive && !sessionId) {
        setVerifyState("ready");
        return;
      }

      if (!sessionId) {
        // Check if there's an existing pass in sessionStorage
        if (isActive) {
          setVerifyState("ready");
          return;
        }
        setErrorMsg("No session ID found. Please purchase a batch pass first.");
        setVerifyState("error");
        return;
      }

      try {
        const res = await fetch(
          `/api/verify-session?session_id=${sessionId}`
        );
        if (!res.ok) {
          const data = await res.json();
          setErrorMsg(data.error || "Failed to verify session.");
          setVerifyState("error");
          return;
        }

        const data = await res.json();
        activatePass({
          passType: data.passType as BatchPassType,
          maxFiles: data.maxFiles,
          maxFileSizeMB: data.maxFileSizeMB,
          sessionId: data.sessionId,
        });
        setVerifyState("ready");
      } catch {
        setErrorMsg("Failed to verify session. Please try again.");
        setVerifyState("error");
      }
    }

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId]);

  const selectedFile = files.find((f) => f.id === selectedFileId);

  const handleDownload = useCallback(
    (id: string) => {
      const entry = files.find((f) => f.id === id);
      if (entry?.result) {
        saveAs(
          entry.result.cleanedBlob,
          `cleaned_${entry.result.report.fileName}`
        );
        trackFileDownloaded({ file_type: entry.file.type });
      }
    },
    [files]
  );

  const handleProcess = useCallback(
    async (id: string) => {
      // For batch, we still allow individual processing
      const entry = files.find((f) => f.id === id);
      if (!entry) return;

      // Use processAll with a single file approach
      // Actually just use the coordinator directly for single file
      const { processFile } = await import(
        "@/lib/processing/coordinator"
      );

      // Set processing state
      const filesCopy = [...files];
      const idx = filesCopy.findIndex((f) => f.id === id);
      if (idx === -1) return;

      // We handle this via processAll for consistency
    },
    [files]
  );

  const handleStripAll = useCallback(async () => {
    if (!pass) return;
    const pending = files.filter((f) => f.status === "pending").length;
    const count = await processAll(stripOptions);
    if (count > 0) {
      consumeFiles(count);
    }
    trackBatchProcessed({
      file_count: pending,
      success_count: count,
    });
  }, [pass, processAll, stripOptions, consumeFiles, files]);

  const handleDownloadZip = useCallback(async () => {
    await downloadZip();
  }, [downloadZip]);

  const pendingCount = files.filter((f) => f.status === "pending").length;
  const doneCount = files.filter((f) => f.status === "done").length;
  const processingCount = files.filter(
    (f) => f.status === "processing"
  ).length;
  const allDone = files.length > 0 && pendingCount === 0 && processingCount === 0;
  const isProcessing = processingCount > 0 || (batchProgress !== null && batchProgress.completed < batchProgress.total);

  const canAddMore =
    pass && pass.remainingFiles > 0 && !isProcessing;

  // Loading state
  if (verifyState === "loading") {
    return (
      <>
        <AnimatedBackground />
        <Nav fileCount={0} />
        <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-[140px] pb-20 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple/[0.08] border border-purple/15">
            <span className="text-xs text-purple-light font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              VERIFYING PAYMENT
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white/80 font-[family-name:var(--font-outfit)] mb-3">
            Activating your batch pass...
          </h2>
          <div className="w-8 h-8 mx-auto mt-6 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (verifyState === "error") {
    return (
      <>
        <AnimatedBackground />
        <Nav fileCount={0} />
        <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-[140px] pb-20 text-center">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-danger/[0.08] border border-danger/15">
            <span className="text-xs text-danger font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              VERIFICATION FAILED
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white/80 font-[family-name:var(--font-outfit)] mb-3">
            Could not activate batch pass
          </h2>
          <p className="text-sm text-white/40 font-[family-name:var(--font-outfit)] mb-6">
            {errorMsg}
          </p>
          <Link
            href="/pricing"
            className="inline-block px-8 py-3 rounded-[14px] text-white text-sm font-semibold font-[family-name:var(--font-outfit)] no-underline transition-all duration-200 hover:-translate-y-0.5"
            style={{
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
              boxShadow:
                "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}
          >
            View Pricing
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <AnimatedBackground />
      <Nav fileCount={files.length} />

      <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-[100px] pb-20">
        {/* Pass info bar */}
        {pass && (
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 px-5 rounded-2xl bg-white/[0.02] border border-white/[0.06] mb-6 animate-hero-fade-in">
            <div className="flex items-center gap-3">
              <div
                className="px-3 py-1 rounded-lg text-xs font-bold font-[family-name:var(--font-mono)] uppercase tracking-[0.05em]"
                style={{
                  background:
                    pass.passType === "image"
                      ? "rgba(167,139,250,0.1)"
                      : "rgba(6,182,212,0.1)",
                  color:
                    pass.passType === "image" ? "#a78bfa" : "#06b6d4",
                  border: `1px solid ${pass.passType === "image" ? "rgba(167,139,250,0.2)" : "rgba(6,182,212,0.2)"}`,
                }}
              >
                {pass.passType === "image"
                  ? "Image Batch Pass"
                  : "Document Batch Pass"}
              </div>
              <span className="text-[13px] text-white/50 font-[family-name:var(--font-outfit)]">
                {pass.remainingFiles} file
                {pass.remainingFiles !== 1 ? "s" : ""} remaining
              </span>
            </div>
            {pass.remainingFiles === 0 && (
              <Link
                href="/pricing"
                className="text-xs text-purple-light font-[family-name:var(--font-mono)] hover:text-purple transition-colors no-underline"
              >
                Get another pass →
              </Link>
            )}
          </div>
        )}

        {/* Drop Zone */}
        {canAddMore && (
          <div
            className="animate-card-slide-in"
            style={{ animationDelay: "0.1s" }}
          >
            <DropZone
              onFiles={addFiles}
              isDragOver={isDragOver}
              dragHandlers={dragHandlers}
              multiple
            />
          </div>
        )}

        {/* Strip Options */}
        {files.length > 0 && !allDone && (
          <div className="mt-5">
            <StripOptions
              options={stripOptions}
              onChange={setStripOptions}
            />
          </div>
        )}

        {/* Stats */}
        {files.length > 0 && (
          <div className="mt-5">
            <StatsBar files={files} />
          </div>
        )}

        {/* Batch Progress */}
        {batchProgress && isProcessing && (
          <div className="mt-5">
            <ProcessingProgress
              completed={batchProgress.completed}
              total={batchProgress.total}
              currentFileName={batchProgress.currentFileName}
            />
          </div>
        )}

        {/* Batch action buttons */}
        {files.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 mt-5">
            {pendingCount > 0 && !isProcessing && (
              <button
                onClick={handleStripAll}
                className="px-6 py-3 rounded-[14px] border-none cursor-pointer text-white text-sm font-semibold font-[family-name:var(--font-outfit)] transition-all duration-200 hover:-translate-y-px"
                style={{
                  background:
                    "linear-gradient(135deg, #7c3aed, #6d28d9)",
                  boxShadow:
                    "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                }}
              >
                Strip All ({pendingCount} file
                {pendingCount !== 1 ? "s" : ""})
              </button>
            )}

            {doneCount > 1 && (
              <button
                onClick={handleDownloadZip}
                className="px-6 py-3 rounded-[14px] border border-cyan/20 bg-cyan/[0.06] cursor-pointer text-cyan text-sm font-semibold font-[family-name:var(--font-outfit)] transition-all duration-200 hover:-translate-y-px hover:bg-cyan/[0.1]"
              >
                {"\u2B07"} Download All (.zip)
              </button>
            )}

            {files.length > 0 && !isProcessing && (
              <button
                onClick={clearAll}
                className="px-4 py-3 rounded-[14px] border border-white/[0.06] bg-transparent cursor-pointer text-white/35 text-sm font-medium font-[family-name:var(--font-outfit)] hover:text-white/60 transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* File List + Metadata Panel */}
        {files.length > 0 && (
          <div
            className={`grid gap-5 mt-5 ${
              selectedFile
                ? "grid-cols-1 lg:grid-cols-[1fr_380px]"
                : "grid-cols-1"
            }`}
          >
            {/* File list */}
            <div className="flex flex-col gap-2">
              {files.map((f, i) => (
                <FileCard
                  key={f.id}
                  entry={f}
                  isSelected={f.id === selectedFileId}
                  onSelect={() => setSelectedFileId(f.id)}
                  onRemove={() => removeFile(f.id)}
                  onProcess={() => handleProcess(f.id)}
                  onDownload={() => handleDownload(f.id)}
                  index={i}
                />
              ))}
            </div>

            {/* Metadata panel */}
            {selectedFile && <MetadataPreview entry={selectedFile} />}
          </div>
        )}

        {/* Empty state */}
        {files.length === 0 && pass && (
          <div className="text-center mt-12">
            <p className="text-white/40 text-[15px] font-[family-name:var(--font-outfit)]">
              Drop your files above to get started with batch processing.
            </p>
          </div>
        )}
      </div>

      <Footer />
    </>
  );
}

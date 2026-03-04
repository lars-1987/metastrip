"use client";

import { useCallback } from "react";
import { saveAs } from "file-saver";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { DropZone } from "@/components/tool/DropZone";
import { FileCard } from "@/components/tool/FileCard";
import { MetadataPreview } from "@/components/tool/MetadataPreview";
import { StatsBar } from "@/components/tool/StatsBar";
import { useDropZone } from "@/hooks/useDropZone";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { ACCEPTED_TYPES } from "@/lib/constants";
import { Icon } from "@/components/shared/Icon";
import type { IconName } from "@/components/shared/Icon";
import { trackFileDownloaded } from "@/lib/analytics";

function Features() {
  const features: { icon: IconName; title: string; desc: string }[] = [
    {
      icon: "Lock",
      title: "Zero Upload",
      desc: "Files are processed entirely in your browser. Nothing touches our servers.",
    },
    {
      icon: "Lightning",
      title: "Instant Strip",
      desc: "Client-side processing means no upload wait. Strip metadata in milliseconds.",
    },
    {
      icon: "Crosshair",
      title: "Deep Scan",
      desc: "EXIF, XMP, IPTC, GPS, AI generation tags, document properties, comments.",
    },
    {
      icon: "ChartBar",
      title: "Audit Report",
      desc: "Batch passes include a detailed report of every field found and removed.",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-16">
      {features.map((f, i) => (
        <div
          key={i}
          className="p-7 px-6 rounded-2xl bg-white/[0.02] border border-white/[0.05] transition-all duration-300 hover:bg-white/[0.04] hover:border-purple/15 hover:-translate-y-0.5 animate-card-slide-in"
          style={{ animationDelay: `${0.6 + i * 0.1}s` }}
        >
          <div className="mb-3.5"><Icon name={f.icon} size={28} weight="duotone" className="text-white/80" /></div>
          <div className="text-[15px] font-semibold text-white/85 font-[family-name:var(--font-outfit)] mb-2">
            {f.title}
          </div>
          <div className="text-[13px] text-white/35 font-[family-name:var(--font-outfit)] leading-relaxed">
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePage() {
  const {
    files,
    selectedFileId,
    setSelectedFileId,
    addFiles,
    removeFile,
    clearAll,
    processSingle,
    remainingToday,
  } = useFileProcessor();

  const { isDragOver, dragHandlers } = useDropZone({
    onFiles: addFiles,
    acceptedTypes: ACCEPTED_TYPES,
  });

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
      const { error } = await processSingle(id);
      if (error) {
        alert(error);
      } else {
        setSelectedFileId(id);
      }
    },
    [processSingle, setSelectedFileId]
  );

  return (
    <>
      <AnimatedBackground />
      <Nav fileCount={files.length} />

      <div className="relative z-[1] max-w-[1100px] mx-auto px-6 pt-[100px] pb-20">
        {/* Hero */}
        <div className="text-center mb-12 animate-hero-fade-in">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full bg-purple/[0.08] border border-purple/15">
            <span className="text-xs text-purple-light font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              v1.0 — FREE FOR SINGLE FILES
            </span>
          </div>
          <h1
            className="text-4xl sm:text-5xl font-extrabold leading-[1.1] -tracking-[0.04em] font-[family-name:var(--font-outfit)] mb-4 animate-gradient-shift"
            style={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Strip the data you
            <br />
            didn&apos;t know you shared
          </h1>
          <p className="text-[17px] text-white/40 max-w-[520px] mx-auto font-[family-name:var(--font-outfit)] leading-[1.7] font-normal">
            Every file carries hidden metadata — GPS coordinates, device info,
            author names, timestamps. MetaStrip removes it all, instantly,
            without your files ever leaving your browser.
          </p>
          {remainingToday < 5 && (
            <div className="mt-3">
              <p className="text-xs text-warning/80 font-[family-name:var(--font-mono)]">
                {remainingToday} free strip{remainingToday !== 1 ? "s" : ""}{" "}
                remaining today
              </p>
              {remainingToday === 0 && (
                <Link
                  href="/pricing"
                  className="text-xs text-purple-light font-[family-name:var(--font-mono)] mt-1 inline-block hover:text-purple transition-colors no-underline"
                >
                  Get a Batch Pass for unlimited processing →
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Drop Zone */}
        <div className="animate-card-slide-in" style={{ animationDelay: "0.2s" }}>
          <DropZone
            onFiles={addFiles}
            isDragOver={isDragOver}
            dragHandlers={dragHandlers}
          />
        </div>

        {/* Stats */}
        {files.length > 0 && (
          <div className="mt-6">
            <StatsBar files={files} />
          </div>
        )}

        {/* File List + Metadata Panel */}
        {files.length > 0 && (
          <div className="flex flex-col gap-5 mt-5">
            {/* File list */}
            <div className="flex flex-col gap-2">
              {/* Batch actions bar */}
              {files.length > 1 && (
                <div className="flex items-center justify-between p-2.5 px-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-stats-slide-up">
                  <span className="text-xs text-white/40 font-[family-name:var(--font-outfit)]">
                    {files.length} files queued
                  </span>
                  <button
                    onClick={clearAll}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.06] bg-transparent cursor-pointer text-white/35 text-xs font-medium font-[family-name:var(--font-outfit)] hover:text-white/60 transition-colors"
                  >
                    Clear
                  </button>
                </div>
              )}

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

        {/* Features */}
        {files.length === 0 && <Features />}
      </div>

      <Footer />
    </>
  );
}

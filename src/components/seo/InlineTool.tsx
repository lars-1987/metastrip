"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import type { SEOPageConfig } from "@/lib/seo-configs";
import { formatBytes } from "@/lib/file-utils";
import { Icon } from "@/components/shared/Icon";

interface InlineToolProps {
  config: SEOPageConfig;
}

export default function InlineTool({ config }: InlineToolProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<
    "idle" | "scanning" | "found" | "stripping" | "done"
  >("idle");
  const [visibleFields, setVisibleFields] = useState(0);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalFields = config.metadataCategories.reduce(
    (a, c) => a + c.fields.length,
    0,
  );

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    (f: File) => {
      setFile(f);
      setStatus("scanning");
      setVisibleFields(0);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      let counter = 0;
      intervalRef.current = setInterval(() => {
        counter++;
        setVisibleFields(counter);
        if (counter >= totalFields) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setStatus("found");
        }
      }, 70);
    },
    [totalFields],
  );

  const handleStrip = useCallback(() => {
    setStatus("stripping");
    setTimeout(() => setStatus("done"), 1200);
  }, []);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setFile(null);
    setStatus("idle");
    setVisibleFields(0);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (f) handleFile(f);
    },
    [handleFile],
  );

  // ── Idle state: drop zone ──────────────────────────────
  if (!file) {
    return (
      <div
        className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] animate-card-slide-in"
        style={{ animationDelay: "0.25s" }}
      >
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          className={`py-[52px] px-10 text-center cursor-pointer transition-colors duration-200 ${
            isDragOver ? "bg-purple/[0.04]" : ""
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept={config.acceptedTypes.join(",")}
            onChange={onInputChange}
            className="hidden"
          />

          <div className="w-16 h-16 rounded-[18px] mx-auto mb-[18px] flex items-center justify-center bg-gradient-to-br from-purple/[0.12] to-cyan/[0.08] border border-purple/[0.12]">
            <Icon name={config.fileIcon} size={28} weight="duotone" className="text-white/80" />
          </div>

          <p className="text-[17px] font-semibold text-white/85 font-[family-name:var(--font-outfit)] mb-1.5">
            Drop a file here to try it
          </p>
          <p className="text-[13px] text-white/30 font-[family-name:var(--font-outfit)]">
            {config.acceptedLabel} — max 25 MB — free, no account
          </p>
        </div>
      </div>
    );
  }

  // ── Active states: file loaded ─────────────────────────
  let fieldCounter = 0;

  return (
    <div
      className="rounded-3xl overflow-hidden bg-white/[0.02] border border-white/[0.06] animate-card-slide-in"
      style={{ animationDelay: "0.25s" }}
    >
      {/* ── File header bar ── */}
      <div
        className={`px-6 py-4 flex items-center gap-3.5 border-b border-white/[0.04] transition-colors duration-300 ${
          status === "done" ? "bg-emerald-500/[0.04]" : ""
        }`}
      >
        {/* Icon */}
        <div
          className={`w-[42px] h-[42px] rounded-xl shrink-0 flex items-center justify-center text-lg ${
            status === "done"
              ? "bg-emerald-500/[0.1] border border-emerald-500/[0.15]"
              : "bg-white/[0.03] border border-white/[0.06]"
          }`}
        >
          {status === "done" ? (
            <span className="text-emerald-400">&#10003;</span>
          ) : status === "stripping" ? (
            <div className="w-5 h-5 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          ) : (
            <Icon name={config.fileIcon} size={18} weight="duotone" className="text-white/80" />
          )}
        </div>

        {/* File info */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-white/90 font-[family-name:var(--font-outfit)] truncate">
            {file.name}
          </p>
          <p className="text-xs text-white/35 font-[family-name:var(--font-outfit)] mt-0.5">
            {formatBytes(file.size)}
            {status === "scanning" && (
              <span className="text-purple/70 ml-2">Scanning...</span>
            )}
            {status === "found" && (
              <span className="text-amber-400/70 ml-2">
                {totalFields} fields found
              </span>
            )}
            {status === "stripping" && (
              <span className="text-purple/70 ml-2">Stripping...</span>
            )}
            {status === "done" && (
              <span className="text-emerald-400/70 ml-2">Clean</span>
            )}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "found" && (
            <button
              onClick={handleStrip}
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white font-[family-name:var(--font-outfit)] cursor-pointer border-none"
              style={{
                background:
                  "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(6,182,212,0.6))",
              }}
            >
              Strip All
            </button>
          )}

          {status === "done" && (
            <Link
              href="/"
              className="px-4 py-2 rounded-xl text-[13px] font-semibold text-emerald-400 font-[family-name:var(--font-outfit)] border border-emerald-500/20 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.1] transition-colors duration-200 no-underline"
            >
              &#8595; Download Clean
            </Link>
          )}

          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white/30 hover:text-white/60 hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer bg-transparent border-none text-base"
            aria-label="Reset"
          >
            &#215;
          </button>
        </div>
      </div>

      {/* ── Metadata categories ── */}
      <div className="py-2">
        {config.metadataCategories.map((cat) => {
          const fieldsWithVisibility = cat.fields.map((field) => ({
            ...field,
            visible: ++fieldCounter <= visibleFields,
          }));

          const visibleCount = fieldsWithVisibility.filter(
            (f) => f.visible,
          ).length;

          if (visibleCount === 0 && status === "scanning") {
            return null;
          }

          return (
            <div key={cat.category} className="px-5 py-2">
              {/* Category header */}
              <div className="flex items-center gap-2 mb-1.5 px-1">
                <Icon name={cat.icon} size={14} weight="duotone" color={cat.color} />
                <span className="text-xs font-medium text-white/50 font-[family-name:var(--font-outfit)]">
                  {cat.label}
                </span>
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-md font-[family-name:var(--font-mono)]"
                  style={{
                    backgroundColor: cat.color + "12",
                    color: cat.color,
                  }}
                >
                  {visibleCount}
                </span>
              </div>

              {/* Fields */}
              <div className="flex flex-col gap-px">
                {fieldsWithVisibility.map(
                  (field, i) =>
                    field.visible && (
                      <div
                        key={i}
                        className="flex items-center justify-between py-1.5 px-3 rounded-lg hover:bg-white/[0.02] transition-colors duration-150 animate-field-fade-in"
                      >
                        <span className="text-xs text-white/40 font-[family-name:var(--font-outfit)]">
                          {field.label}
                        </span>
                        <span
                          className={`text-xs font-[family-name:var(--font-mono)] text-right max-w-[55%] truncate ${
                            status === "done"
                              ? "line-through text-white/20"
                              : "text-white/60"
                          }`}
                        >
                          {field.value}
                        </span>
                      </div>
                    ),
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Batch upsell CTA ── */}
      {status === "done" && (
        <div
          className="mx-4 mb-4 p-4 px-5 rounded-[14px] flex items-center justify-between animate-card-slide-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
            border: "1px solid rgba(124,58,237,0.1)",
          }}
        >
          <div className="min-w-0 mr-4">
            <p className="text-sm font-semibold text-white/80 font-[family-name:var(--font-outfit)] mb-0.5">
              Need to strip more files?
            </p>
            <p className="text-xs text-white/35 font-[family-name:var(--font-outfit)]">
              {config.batchCta.subtext}
            </p>
          </div>
          <Link
            href="/pricing"
            className="shrink-0 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white font-[family-name:var(--font-outfit)] no-underline"
            style={{
              background:
                "linear-gradient(135deg, rgba(124,58,237,0.8), rgba(6,182,212,0.6))",
            }}
          >
            {config.batchCta.text}
          </Link>
        </div>
      )}
    </div>
  );
}

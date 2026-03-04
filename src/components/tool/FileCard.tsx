"use client";

import { cn } from "@/lib/utils";
import { formatBytes, getFileIcon, getFileTypeLabel } from "@/lib/file-utils";
import type { FileEntry } from "@/lib/processing/types";

interface FileCardProps {
  entry: FileEntry;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  onProcess: () => void;
  onDownload: () => void;
  index: number;
}

export function FileCard({
  entry,
  isSelected,
  onSelect,
  onRemove,
  onProcess,
  onDownload,
  index,
}: FileCardProps) {
  const { file, status, result } = entry;
  const metaCount = result?.report?.fieldsFound?.length ?? 0;

  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:bg-white/[0.04]",
        isSelected ? "bg-white/[0.04]" : "bg-white/[0.025]",
        status === "done" && "border border-success/20",
        status === "processing" && "border border-purple/30",
        status === "error" && "border border-danger/30",
        status === "pending" && "border border-white/[0.06]"
      )}
      style={{
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Processing shimmer */}
      {status === "processing" && (
        <div
          className="absolute inset-0 animate-shimmer"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(124,58,237,0.06), transparent)",
          }}
        />
      )}

      <div className="p-4 px-5 flex items-center gap-4 relative">
        {/* File icon */}
        <div
          className={cn(
            "w-11 h-11 rounded-xl shrink-0 flex items-center justify-center text-xl transition-all duration-300",
            status === "done" &&
              "bg-success/10 border border-success/15 text-success",
            status === "processing" && "bg-purple/[0.12] border border-white/[0.06]",
            status === "error" && "bg-danger/10 border border-danger/15",
            status === "pending" && "bg-white/[0.04] border border-white/[0.06]"
          )}
        >
          {status === "done" ? (
            "\u2713"
          ) : status === "processing" ? (
            <div className="w-[18px] h-[18px] border-2 border-purple/30 border-t-purple-light rounded-full animate-spin" />
          ) : (
            getFileIcon(file.type)
          )}
        </div>

        {/* File info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white/90 font-[family-name:var(--font-outfit)] truncate">
              {file.name}
            </span>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple/[0.12] text-purple-light font-[family-name:var(--font-mono)] tracking-[0.05em] shrink-0">
              {getFileTypeLabel(file.type)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="text-xs text-white/30 font-[family-name:var(--font-mono)]">
              {formatBytes(file.size)}
            </span>
            {status === "done" && metaCount > 0 && (
              <span className="text-[11px] text-success font-[family-name:var(--font-mono)]">
                {metaCount} fields stripped
              </span>
            )}
            {status === "pending" && metaCount > 0 && (
              <span className="text-[11px] text-danger font-[family-name:var(--font-mono)]">
                {metaCount} fields found
              </span>
            )}
            {status === "processing" && (
              <span className="text-[11px] text-purple-light font-[family-name:var(--font-mono)]">
                Stripping metadata...
              </span>
            )}
            {status === "error" && (
              <span className="text-[11px] text-danger font-[family-name:var(--font-mono)]">
                {result?.error || "Error"}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {status === "pending" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onProcess();
              }}
              className="px-[18px] py-2 rounded-[10px] border-none cursor-pointer text-white text-xs font-semibold font-[family-name:var(--font-outfit)] transition-all duration-200"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow:
                  "0 0 15px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              Strip
            </button>
          )}
          {status === "done" && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDownload();
              }}
              className="px-[18px] py-2 rounded-[10px] border border-success/25 bg-success/[0.08] cursor-pointer text-success text-xs font-semibold font-[family-name:var(--font-outfit)] transition-all duration-200 hover:bg-success/15"
            >
              {"\u2193"} Download
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="w-8 h-8 rounded-lg border-none cursor-pointer bg-transparent text-white/25 flex items-center justify-center text-base transition-all duration-200 hover:text-danger hover:bg-danger/[0.08]"
          >
            {"\u00D7"}
          </button>
        </div>
      </div>
    </div>
  );
}

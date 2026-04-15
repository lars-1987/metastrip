"use client";

import { useRef } from "react";
import { PrivacyBadge } from "@/components/shared/PrivacyBadge";
import { cn } from "@/lib/utils";
import { ACCEPTED_TYPES } from "@/lib/constants";

interface DropZoneProps {
  onFiles: (files: File[]) => void;
  isDragOver: boolean;
  dragHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent) => void;
  };
  multiple?: boolean;
  disabled?: boolean;
}

export function DropZone({
  onFiles,
  isDragOver,
  dragHandlers,
  multiple = false,
  disabled = false,
}: DropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      {...dragHandlers}
      onClick={() => !disabled && inputRef.current?.click()}
      className={cn(
        "relative py-16 px-10 rounded-[20px] text-center overflow-hidden transition-all duration-[400ms]",
        disabled
          ? "opacity-50 cursor-not-allowed border-2 border-dashed border-white/[0.04]"
          : isDragOver
            ? "cursor-pointer border-2 border-dashed border-purple/80"
            : "cursor-pointer border-2 border-dashed border-white/[0.08]"
      )}
      style={{
        background: isDragOver
          ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 100%)"
          : "rgba(255,255,255,0.02)",
      }}
    >
      {/* Glow effect */}
      <div
        className="absolute inset-0 transition-opacity duration-[400ms]"
        style={{
          opacity: isDragOver ? 0.6 : 0,
          background:
            "radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)",
        }}
      />

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple={multiple}
        disabled={disabled}
        className="hidden"
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />

      <div className="relative z-[1]">
        {/* Upload icon */}
        <div
          className={cn(
            "w-[72px] h-[72px] rounded-[20px] mx-auto mb-5 flex items-center justify-center border border-purple/15",
            isDragOver && "animate-icon-bounce"
          )}
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
          }}
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="rgba(167,139,250,0.8)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <p className="text-lg font-semibold text-white/95 font-[family-name:var(--font-outfit)] mb-2">
          {isDragOver
            ? "Release to strip metadata"
            : multiple
              ? "Drop files here or click to browse"
              : "Drop a file here or click to browse"}
        </p>
        <p className="text-[13px] text-white/45 font-[family-name:var(--font-outfit)] leading-relaxed">
          JPEG, PNG, WebP, PDF, DOCX, XLSX, PPTX
        </p>

        <div className="mt-4">
          <PrivacyBadge />
        </div>
      </div>
    </div>
  );
}

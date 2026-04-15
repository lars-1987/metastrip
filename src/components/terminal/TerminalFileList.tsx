"use client";

import type { FileEntry } from "@/lib/processing/types";
import { formatBytes } from "@/lib/file-utils";

interface TerminalFileListProps {
  files: FileEntry[];
  onRemoveFile: (id: string) => void;
}

function getTypeColor(type: string): string {
  if (type.startsWith("image/")) return "text-cyan";
  return "text-purple-light";
}

function getPermissions(type: string): string {
  if (type.startsWith("image/")) return "-rw-r--r--";
  return "-rw-r--r--";
}

function getDateStr(): string {
  const d = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[d.getMonth()]} ${String(d.getDate()).padStart(2, " ")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export function TerminalFileList({ files, onRemoveFile }: TerminalFileListProps) {
  if (files.length === 0) return null;

  const dateStr = getDateStr();
  const totalSize = files.reduce((sum, f) => sum + f.file.size, 0);

  return (
    <div className="font-[family-name:var(--font-mono)] text-sm">
      {/* ls header */}
      <div className="text-white/65 mb-1">
        <span className="text-purple-400 mr-1.5">❯</span>
        <span>ls -la</span>
      </div>

      {/* File rows */}
      <div className="pl-4 space-y-px">
        {files.map((entry) => (
          <div
            key={entry.id}
            className="group flex items-center gap-0 hover:bg-white/[0.03] rounded px-1 -mx-1 py-0.5 transition-colors duration-100"
          >
            <span className="text-white/45 w-[82px] shrink-0">{getPermissions(entry.file.type)}</span>
            <span className="text-white/55 w-[62px] shrink-0 text-right mr-2">{formatBytes(entry.file.size)}</span>
            <span className="text-white/45 w-[96px] shrink-0">{dateStr}</span>
            <span className={`${getTypeColor(entry.file.type)} truncate flex-1`}>
              {entry.file.name}
            </span>
            <button
              onClick={() => onRemoveFile(entry.id)}
              className="w-4 h-4 flex items-center justify-center text-white/10 group-hover:text-white/40 hover:!text-danger text-[10px] cursor-pointer bg-transparent border-none transition-colors duration-150 shrink-0 ml-2"
              aria-label={`Remove ${entry.file.name}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="text-white/50 mt-1.5 pl-4">
        {files.length} file{files.length !== 1 ? "s" : ""}, {formatBytes(totalSize)} total
      </div>
    </div>
  );
}

"use client";

import type { FileEntry } from "@/lib/processing/types";

interface StatsBarProps {
  files: FileEntry[];
}

export function StatsBar({ files }: StatsBarProps) {
  const total = files.length;
  const done = files.filter((f) => f.status === "done").length;
  const totalMeta = files.reduce(
    (acc, f) => acc + (f.result?.report?.fieldsFound?.length ?? 0),
    0
  );

  if (total === 0) return null;

  const stats = [
    { label: "Files", value: total, color: "#a78bfa" },
    { label: "Processed", value: done, color: "#4ade80" },
    { label: "Fields Found", value: totalMeta, color: "#f87171" },
  ];

  return (
    <div className="flex gap-3 animate-stats-slide-up">
      {stats.map(({ label, value, color }) => (
        <div
          key={label}
          className="flex-1 p-3.5 px-[18px] rounded-[14px] bg-white/[0.02] border border-white/[0.05]"
        >
          <div
            className="text-[22px] font-bold font-[family-name:var(--font-outfit)]"
            style={{ color }}
          >
            {value}
          </div>
          <div className="text-[11px] text-white/35 font-[family-name:var(--font-mono)] mt-0.5">
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

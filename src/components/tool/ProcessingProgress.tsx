"use client";

interface ProcessingProgressProps {
  completed: number;
  total: number;
  currentFileName?: string;
}

export function ProcessingProgress({
  completed,
  total,
  currentFileName,
}: ProcessingProgressProps) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 animate-panel-fade-in">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-semibold text-white/70 font-[family-name:var(--font-outfit)]">
          Processing Batch
        </span>
        <span className="text-xs text-purple-light font-[family-name:var(--font-mono)]">
          {completed}/{total}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-white/[0.04] overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300 ease-out"
          style={{
            width: `${percent}%`,
            background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
            boxShadow: "0 0 10px rgba(124,58,237,0.3)",
          }}
        />
      </div>

      {currentFileName && completed < total && (
        <p className="text-[11px] text-white/30 font-[family-name:var(--font-mono)] mt-2 truncate">
          Stripping: {currentFileName}
        </p>
      )}

      {completed === total && total > 0 && (
        <p className="text-[11px] text-success font-[family-name:var(--font-mono)] mt-2">
          All files processed successfully
        </p>
      )}
    </div>
  );
}

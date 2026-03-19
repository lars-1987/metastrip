"use client";

interface TerminalActionsProps {
  hasFiles: boolean;
  hasPending: boolean;
  hasDone: boolean;
  doneCount: number;
  isProcessing: boolean;
  onExecute: () => void;
  onDownload: () => void;
  onClear: () => void;
}

export function TerminalActions({
  hasFiles,
  hasPending,
  hasDone,
  doneCount,
  isProcessing,
  onExecute,
  onDownload,
  onClear,
}: TerminalActionsProps) {
  if (!hasFiles) return null;

  return (
    <div className="flex items-center gap-2 pt-3 mt-2 border-t border-white/[0.04]">
      {hasPending && !isProcessing && (
        <button
          onClick={onExecute}
          className="px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-mono)] font-semibold text-white cursor-pointer border-none transition-all duration-200 hover:-translate-y-px"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow: "0 0 20px rgba(124,58,237,0.25)",
          }}
        >
          ▶ execute
        </button>
      )}

      {isProcessing && (
        <span className="text-sm text-purple-light font-[family-name:var(--font-mono)] flex items-center gap-2">
          <span className="w-3 h-3 border-2 border-purple/30 border-t-purple rounded-full animate-spin" />
          processing...
        </span>
      )}

      {hasDone && !isProcessing && (
        <button
          onClick={onDownload}
          className="px-4 py-2 rounded-lg text-sm font-[family-name:var(--font-mono)] font-semibold text-success bg-success/[0.08] border border-success/20 cursor-pointer hover:bg-success/[0.14] transition-colors duration-200"
        >
          ↓ download{doneCount > 1 ? " zip" : ""}
        </button>
      )}

      {hasFiles && !isProcessing && (
        <button
          onClick={onClear}
          className="px-3 py-2 rounded-lg text-sm font-[family-name:var(--font-mono)] text-white/40 hover:text-white/60 bg-transparent border border-white/[0.06] hover:border-white/[0.12] cursor-pointer transition-colors duration-200"
        >
          clear
        </button>
      )}
    </div>
  );
}

"use client";

interface TerminalWindowProps {
  children: React.ReactNode;
}

export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div
      data-terminal-window
      className="w-full md:rounded-2xl overflow-hidden flex flex-col pointer-events-auto"
      style={{
        background: "var(--terminal-bg)",
        color: "var(--terminal-text)",
        border: "1px solid color-mix(in srgb, var(--terminal-bg) 70%, var(--text) 30%)",
        // Locked height (no min/max) so the terminal doesn't resize when files
        // are dropped and the log area grows. Inner regions handle their own scroll.
        height: "min(85vh, 720px)",
        // Soft drop shadow that reads on cream + transparent on dark
        boxShadow: "0 24px 60px -12px rgba(31,21,48,0.18), 0 4px 16px -4px rgba(31,21,48,0.08)",
      }}
    >
      {children}
    </div>
  );
}

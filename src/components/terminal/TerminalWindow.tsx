"use client";

interface TerminalWindowProps {
  children: React.ReactNode;
}

export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div
      data-terminal-window
      // Locked height, so the window doesn't grow as files are added; the
      // regions inside scroll. On desktop it leaves room for menubar and dock.
      className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-white/[0.08] pointer-events-auto h-[calc(100dvh_-_1.75rem)] lg:h-[min(calc(100vh_-_10.5rem),_720px)]"
      style={{
        background: "var(--terminal-bg)",
        color: "var(--terminal-text)",
        boxShadow: "0 30px 70px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </div>
  );
}

"use client";

interface TerminalWindowProps {
  children: React.ReactNode;
}

export function TerminalWindow({ children }: TerminalWindowProps) {
  return (
    <div data-terminal-window className="w-full md:max-w-6xl md:mx-auto md:mt-6 md:mb-10 md:rounded-xl overflow-hidden border border-white/[0.08] bg-[#0c0c0e] flex flex-col min-h-[80vh] md:min-h-0 md:h-[75vh] pointer-events-auto"
      style={{
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03)",
      }}
    >
      {children}
    </div>
  );
}

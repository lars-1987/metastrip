"use client";

import type { CommandResult } from "@/lib/terminal-commands";
import { PowerlineBar } from "./PowerlinePrompt";

const STYLE_COLORS: Record<string, string> = {
  success: "text-success",
  error: "text-danger",
  warning: "text-warning",
  info: "text-white/70",
  joke: "text-amber-300/80",
  neofetch: "text-white/70",
};

/* ── Neofetch renderer ── */

// Simple, clean block letters — plain ASCII only
const ASCII_LOGO = [
  " _  _ ____ ___ ____ ____ ___ ____ _ ___  ",
  " |\\/| |___  |  |__| [__   |  |__/ | |__] ",
  " |  | |___  |  |  | ___]  |  |  \\ | |    ",
];

function NeofetchOutput({ meta }: { meta: Record<string, string> }) {
  const infoLines = [
    { label: null, value: "user@anonymous", labelColor: "", valueColor: "text-purple-300 font-semibold" },
    { label: null, value: "─────────────────────", labelColor: "", valueColor: "text-white/30" },
    { label: "os", value: meta.os, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "browser", value: meta.browser, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "shell", value: meta.shell, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "uptime", value: meta.uptime, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "packages", value: meta.packages, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "privacy", value: meta.privacy, labelColor: "text-purple-400", valueColor: "text-success" },
    { label: "tracking", value: meta.tracking, labelColor: "text-purple-400", valueColor: "text-white/70" },
    { label: "accounts", value: meta.accounts, labelColor: "text-purple-400", valueColor: "text-white/70" },
  ];

  const maxLines = Math.max(ASCII_LOGO.length, infoLines.length);

  return (
    <div className="py-2">
      {Array.from({ length: maxLines }).map((_, i) => {
        const asciiLine = ASCII_LOGO[i] ?? "";
        const info = infoLines[i];
        const paddedAscii = asciiLine.padEnd(44);

        return (
          <div key={i} className="flex whitespace-pre leading-snug">
            {/* ASCII art side */}
            <span className="shrink-0 text-purple-400">{paddedAscii}</span>
            {/* Info side */}
            {info && (
              <span>
                {info.label ? (
                  <>
                    <span className={info.labelColor}>{info.label}</span>
                    <span className="text-white/40">: </span>
                    <span className={info.valueColor}>{info.value}</span>
                  </>
                ) : (
                  <span className={info.valueColor}>{info.value}</span>
                )}
              </span>
            )}
          </div>
        );
      })}

      {/* Color palette row */}
      <div className="flex items-center gap-1 mt-2 ml-1">
        {[
          { color: "bg-[#7c3aed]", label: "purple" },
          { color: "bg-[#06b6d4]", label: "cyan" },
          { color: "bg-[#4ade80]", label: "green" },
          { color: "bg-[#f472b6]", label: "pink" },
          { color: "bg-[#febc2e]", label: "yellow" },
          { color: "bg-[#ff5f57]", label: "red" },
          { color: "bg-white/70", label: "white" },
          { color: "bg-white/20", label: "dim" },
        ].map((c) => (
          <span
            key={c.label}
            className={`inline-block w-4 h-4 rounded-sm ${c.color}`}
            title={c.label}
          />
        ))}
      </div>
    </div>
  );
}

/* ── Command entry ── */

function CommandEntry({ result }: { result: CommandResult }) {
  const outputColor = STYLE_COLORS[result.style ?? "info"];

  return (
    <div className="mb-3">
      {/* Prompt + command the user typed */}
      <div className="font-[family-name:var(--font-mono)] text-sm py-1">
        <PowerlineBar />
        <div className="flex items-start">
          <span className="text-purple-400 mr-1.5 shrink-0">❯</span>
          <span className="text-white/90 break-all">{result.command}</span>
        </div>
      </div>

      {/* Command output */}
      {result.style === "neofetch" && result.meta ? (
        <div className="font-[family-name:var(--font-mono)] text-xs">
          <NeofetchOutput meta={result.meta} />
        </div>
      ) : (
        <div className={`font-[family-name:var(--font-mono)] text-sm pl-0 ${outputColor}`}>
          {result.output.map((line, i) => (
            <div key={i} className="whitespace-pre-wrap leading-relaxed min-h-[1.25em]">
              {line}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function CommandHistory({ history }: { history: CommandResult[] }) {
  return (
    <div className="mb-2">
      {history.map((result, i) => (
        <CommandEntry key={i} result={result} />
      ))}
    </div>
  );
}

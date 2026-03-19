"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { MetaStripIcon } from "@/components/shared/Logo";

/**
 * Powerline-style prompt bar mimicking a Warp/oh-my-zsh setup.
 * Shows: [favicon] metastrip ❯ …/path ❯ ⎇ main
 * Then a second line with ❯ cursor (optionally interactive)
 */

interface PowerlinePromptProps {
  showCursor?: boolean;
  command?: string;
  isTyping?: boolean;
  isProcessing?: boolean;
  /** When true, the prompt becomes a real text input */
  interactive?: boolean;
  /** Called when user presses Enter with a command */
  onCommand?: (cmd: string) => void;
}

/** Just the powerline bar (no command line) — used in command history display */
export function PowerlineBar() {
  return (
    <div className="flex items-center flex-wrap gap-0 mb-0.5">
      <div className="flex items-center gap-1.5 bg-white/[0.08] pl-2 pr-0.5 py-[3px] rounded-l-md">
        <MetaStripIcon size={14} />
        <span className="text-purple-300 font-semibold text-xs">metastrip</span>
        <span className="text-white/20 text-xs ml-0.5">❯</span>
      </div>
      <div className="flex items-center bg-white/[0.05] px-2.5 py-[3px]">
        <span className="text-cyan-300/80 text-xs">…/uploads</span>
        <span className="text-white/20 text-xs ml-1.5">❯</span>
      </div>
      <div className="flex items-center bg-white/[0.03] px-2.5 py-[3px] rounded-r-md">
        <span className="text-amber-400/70 text-xs">⎇ main</span>
      </div>
    </div>
  );
}

export function PowerlinePrompt({
  showCursor = true,
  command,
  isTyping,
  isProcessing,
  interactive,
  onCommand,
}: PowerlinePromptProps) {
  const [inputValue, setInputValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus the input when interactive
  useEffect(() => {
    if (interactive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [interactive]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" && inputValue.trim()) {
        onCommand?.(inputValue.trim());
        setInputValue("");
      }
    },
    [inputValue, onCommand]
  );

  // Click anywhere on the prompt area to focus the hidden input
  const handleClick = useCallback(() => {
    if (interactive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [interactive]);

  return (
    <div className="font-[family-name:var(--font-mono)] text-sm py-1" onClick={handleClick}>
      {/* Powerline bar */}
      <PowerlineBar />

      {/* Command line */}
      <div className="flex items-start">
        <span className="text-purple-400 mr-1.5 shrink-0">❯</span>

        {interactive ? (
          /* Interactive mode: real input that looks like the terminal */
          <div className="flex-1 flex items-start min-w-0">
            <span className="text-white/80 break-all whitespace-pre-wrap">{inputValue}</span>
            <span className="text-white/60 animate-blink-cursor">_</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="absolute opacity-0 w-0 h-0 pointer-events-none"
              aria-label="Terminal input"
              autoCapitalize="off"
              autoCorrect="off"
              autoComplete="off"
              spellCheck={false}
            />
          </div>
        ) : command ? (
          <span className="text-white/80 break-all">
            {command}
            {(isTyping || isProcessing) && (
              <span className={`text-white/40 ml-0.5 ${isTyping ? "" : "animate-blink-cursor"}`}>_</span>
            )}
          </span>
        ) : showCursor ? (
          <span className="text-white/60 animate-blink-cursor">_</span>
        ) : null}
      </div>
    </div>
  );
}

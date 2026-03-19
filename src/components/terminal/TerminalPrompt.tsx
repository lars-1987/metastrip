"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { FileEntry, StripOptions } from "@/lib/processing/types";
import { DEFAULT_STRIP_OPTIONS } from "@/lib/processing/types";
import { PowerlinePrompt } from "./PowerlinePrompt";
import { executeCommand, CLEAR_SENTINEL, type CommandResult } from "@/lib/terminal-commands";
import { CommandHistory } from "./CommandHistory";

interface TerminalPromptProps {
  files: FileEntry[];
  stripOptions: StripOptions;
  isProcessing: boolean;
}

function buildCommand(files: FileEntry[], stripOptions: StripOptions): string {
  const pendingFiles = files.filter((f) => f.status === "pending" || f.status === "processing");

  const allSelected = Object.entries(stripOptions).every(([, v]) => v);
  const noneSelected = Object.entries(stripOptions).every(([, v]) => !v);
  const allDefault = Object.entries(stripOptions).every(
    ([k, v]) => v === DEFAULT_STRIP_OPTIONS[k as keyof StripOptions]
  );

  let removeFlags = "";
  if (allSelected) {
    removeFlags = "--remove-all";
  } else if (noneSelected) {
    removeFlags = "";
  } else if (allDefault) {
    removeFlags = "--remove-all --keep copyright";
  } else {
    const selected = Object.entries(stripOptions)
      .filter(([, v]) => v)
      .map(([k]) => k);
    removeFlags = selected.length > 0 ? `--remove ${selected.join(" ")}` : "";
  }

  const fileNames = pendingFiles.length > 0
    ? pendingFiles.map((f) => f.file.name)
    : files.map((f) => f.file.name);
  const displayNames = fileNames.length > 3
    ? [...fileNames.slice(0, 3), `+${fileNames.length - 3} more`]
    : fileNames;

  return ["metastrip", removeFlags, ...displayNames].filter(Boolean).join(" ");
}

export function TerminalPrompt({ files, stripOptions, isProcessing }: TerminalPromptProps) {
  const [typedLength, setTypedLength] = useState<number | null>(null);
  const [commandHistory, setCommandHistory] = useState<CommandResult[]>([]);
  const prevProcessing = useRef(false);
  const command = files.length > 0 ? buildCommand(files, stripOptions) : "";

  // Typewriter effect when processing starts
  useEffect(() => {
    if (isProcessing && !prevProcessing.current && command.length > 0) {
      setTypedLength(0);
      let i = 0;
      const interval = setInterval(() => {
        i++;
        setTypedLength(i);
        if (i >= command.length) {
          clearInterval(interval);
        }
      }, 12);
      return () => clearInterval(interval);
    }
    if (!isProcessing && prevProcessing.current) {
      setTypedLength(null);
    }
    prevProcessing.current = isProcessing;
  }, [isProcessing, command]);

  // Reset typed state when files change (before processing)
  useEffect(() => {
    if (!isProcessing) {
      setTypedLength(null);
    }
  }, [files.length, isProcessing]);

  const handleCommand = useCallback((input: string) => {
    const result = executeCommand(input);
    if (result.output[0] === CLEAR_SENTINEL) {
      setCommandHistory([]);
      return;
    }
    setCommandHistory((prev) => [...prev, result]);
  }, []);

  const isIdle = files.length === 0 && !isProcessing;

  // Show command history + interactive prompt when idle
  if (isIdle) {
    return (
      <>
        {commandHistory.length > 0 && (
          <CommandHistory history={commandHistory} />
        )}
        <PowerlinePrompt showCursor interactive onCommand={handleCommand} />
      </>
    );
  }

  const displayText = typedLength !== null ? command.slice(0, typedLength) : command;
  const isTyping = typedLength !== null && typedLength < command.length;

  return (
    <>
      {commandHistory.length > 0 && (
        <CommandHistory history={commandHistory} />
      )}
      <PowerlinePrompt
        command={displayText}
        isTyping={isTyping}
        isProcessing={isProcessing}
      />
    </>
  );
}

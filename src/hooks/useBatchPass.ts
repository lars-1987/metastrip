"use client";

import { useState, useCallback, useEffect } from "react";

export type BatchPassType = "image" | "document";

export interface BatchPassState {
  passType: BatchPassType;
  maxFiles: number;
  remainingFiles: number;
  maxFileSizeMB: number;
  sessionId: string;
  activatedAt: number;
}

const STORAGE_KEY = "metastrip_batch_pass";

function loadPass(): BatchPassState | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BatchPassState;
  } catch {
    return null;
  }
}

function savePass(pass: BatchPassState | null): void {
  if (typeof window === "undefined") return;
  if (pass) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(pass));
  } else {
    sessionStorage.removeItem(STORAGE_KEY);
  }
}

export function useBatchPass() {
  const [pass, setPass] = useState<BatchPassState | null>(null);

  useEffect(() => {
    setPass(loadPass());
  }, []);

  const activatePass = useCallback(
    (data: {
      passType: BatchPassType;
      maxFiles: number;
      maxFileSizeMB: number;
      sessionId: string;
    }) => {
      // Prevent duplicate activation of same session
      const existing = loadPass();
      if (existing?.sessionId === data.sessionId) {
        setPass(existing);
        return;
      }

      const newPass: BatchPassState = {
        ...data,
        remainingFiles: data.maxFiles,
        activatedAt: Date.now(),
      };
      savePass(newPass);
      setPass(newPass);
    },
    []
  );

  const consumeFiles = useCallback(
    (count: number) => {
      if (!pass) return;
      const updated = {
        ...pass,
        remainingFiles: Math.max(0, pass.remainingFiles - count),
      };
      savePass(updated);
      setPass(updated);
    },
    [pass]
  );

  const isActive = pass !== null && pass.remainingFiles > 0;

  const allowedFileCategory: "image" | "document" | null = pass
    ? pass.passType === "image"
      ? "image"
      : "document"
    : null;

  const clearPass = useCallback(() => {
    savePass(null);
    setPass(null);
  }, []);

  return {
    pass,
    isActive,
    allowedFileCategory,
    activatePass,
    consumeFiles,
    clearPass,
  };
}

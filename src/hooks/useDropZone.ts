"use client";

import { useState, useCallback, type DragEvent } from "react";
import { isAcceptedForUpload } from "@/lib/file-utils";

interface UseDropZoneOptions {
  /**
   * The accepted files, with any rejected from the same drop riding along so
   * one handler can report both. Calling onRejected first instead meant the
   * accepted batch cleared its message in the same tick, and a mixed drop lost
   * its unsupported files without a word.
   */
  onFiles: (files: File[], rejected: File[]) => void;
  acceptedTypes: string[];
  /**
   * A drop where nothing was accepted. Optional so existing consumers keep
   * their current behaviour; without it an unsupported drop is silently
   * discarded, which leaves the user with no feedback and us with no signal
   * about which formats people are actually bringing.
   */
  onRejected?: (files: File[]) => void;
}

export function useDropZone({ onFiles, acceptedTypes, onRejected }: UseDropZoneOptions) {
  const [isDragOver, setIsDragOver] = useState(false);

  const onDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const onDragLeave = useCallback(() => {
    setIsDragOver(false);
  }, []);

  const onDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const dropped = Array.from(e.dataTransfer.files);
      if (!dropped.length) return;
      const accepted = dropped.filter((f) => isAcceptedForUpload(f, acceptedTypes));
      const rejected = dropped.filter((f) => !isAcceptedForUpload(f, acceptedTypes));
      if (accepted.length) onFiles(accepted, rejected);
      else if (rejected.length) onRejected?.(rejected);
    },
    [onFiles, onRejected, acceptedTypes]
  );

  return {
    isDragOver,
    setIsDragOver,
    dragHandlers: { onDragOver, onDragLeave, onDrop },
  };
}

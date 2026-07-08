"use client";

import { useState, useCallback, type DragEvent } from "react";
import { isAcceptedForUpload } from "@/lib/file-utils";

interface UseDropZoneOptions {
  onFiles: (files: File[]) => void;
  acceptedTypes: string[];
}

export function useDropZone({ onFiles, acceptedTypes }: UseDropZoneOptions) {
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
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        isAcceptedForUpload(f, acceptedTypes)
      );
      if (files.length) onFiles(files);
    },
    [onFiles, acceptedTypes]
  );

  return {
    isDragOver,
    setIsDragOver,
    dragHandlers: { onDragOver, onDragLeave, onDrop },
  };
}

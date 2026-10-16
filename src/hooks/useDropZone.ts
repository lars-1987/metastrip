"use client";

import { useState, useCallback, type DragEvent } from "react";

interface UseDropZoneOptions {
  /**
   * Every dropped file, unfiltered. The consumer identifies each one from its
   * bytes and reports the ones it can't take. Filtering here by name and MIME
   * type used to turn files away before they could be identified, so a TIFF
   * never got its "not supported yet" message.
   */
  onFiles: (files: File[]) => void;
}

export function useDropZone({ onFiles }: UseDropZoneOptions) {
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
      if (dropped.length) onFiles(dropped);
    },
    [onFiles]
  );

  return {
    isDragOver,
    setIsDragOver,
    dragHandlers: { onDragOver, onDragLeave, onDrop },
  };
}

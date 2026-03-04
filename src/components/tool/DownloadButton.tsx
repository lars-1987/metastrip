"use client";

import { saveAs } from "file-saver";
import type { ProcessingResult } from "@/lib/processing/types";

interface DownloadButtonProps {
  result: ProcessingResult;
}

export function DownloadButton({ result }: DownloadButtonProps) {
  const handleDownload = () => {
    saveAs(result.cleanedBlob, `cleaned_${result.report.fileName}`);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-[18px] py-2 rounded-[10px] border border-success/25 bg-success/[0.08] cursor-pointer text-success text-xs font-semibold font-[family-name:var(--font-outfit)] transition-all duration-200 hover:bg-success/15"
    >
      {"\u2193"} Download Clean File
    </button>
  );
}

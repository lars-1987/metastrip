import { Suspense } from "react";
import { BatchPage } from "@/components/BatchPage";

export const metadata = {
  title: "Batch Processing — MetaStrip",
  description: "Process multiple files at once with your MetaStrip batch pass.",
};

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
          <div className="text-white/40 text-sm font-[family-name:var(--font-mono)]">
            Loading...
          </div>
        </div>
      }
    >
      <BatchPage />
    </Suspense>
  );
}

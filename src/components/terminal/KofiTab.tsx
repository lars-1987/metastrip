"use client";

import { KOFI_URL } from "@/lib/constants";

export function KofiTab() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden p-4 md:p-6">
      <div className="font-[family-name:var(--font-mono)] text-sm text-white/65 mb-4">
        <span className="text-purple-400 mr-1.5">❯</span>
        <span>open {KOFI_URL}</span>
      </div>

      <div className="flex-1 flex items-start justify-center min-h-0 overflow-y-auto">
        <div className="w-full max-w-md rounded-xl overflow-hidden border border-white/[0.06] shadow-lg">
          <iframe
            id="kofiframe"
            src={`${KOFI_URL}/?hidefeed=true&widget=true&embed=true&preview=true`}
            className="w-full border-none"
            style={{ background: "#f9f9f9" }}
            height="712"
            title="Support MetaStrip on Ko-fi"
          />
        </div>
      </div>
    </div>
  );
}

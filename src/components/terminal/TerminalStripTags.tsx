"use client";

import type { StripOptions, MetadataCategory } from "@/lib/processing/types";
import { CATEGORY_CONFIG } from "@/lib/constants";

interface TerminalStripTagsProps {
  stripOptions: StripOptions;
  onToggle: (key: MetadataCategory) => void;
  onToggleAll: () => void;
}

const CATEGORIES: MetadataCategory[] = [
  "gps", "device", "dates", "author", "software", "ai", "copyright", "comments", "custom",
];

export function TerminalStripTags({ stripOptions, onToggle, onToggleAll }: TerminalStripTagsProps) {
  const allSelected = CATEGORIES.every((c) => stripOptions[c]);

  return (
    <div className="flex flex-wrap gap-1.5 py-2">
      {/* All toggle */}
      <button
        onClick={onToggleAll}
        className={`px-2.5 py-1 rounded text-xs font-[family-name:var(--font-mono)] font-medium border cursor-pointer transition-all duration-150 ${
          allSelected
            ? "bg-purple/20 text-purple-light border-purple/30"
            : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/[0.12]"
        }`}
      >
        all
      </button>

      {CATEGORIES.map((cat) => {
        const active = stripOptions[cat];
        return (
          <button
            key={cat}
            onClick={() => onToggle(cat)}
            className={`px-2.5 py-1 rounded text-xs font-[family-name:var(--font-mono)] font-medium border cursor-pointer transition-all duration-150 ${
              active
                ? "bg-purple/20 text-purple-light border-purple/30"
                : "bg-white/[0.03] text-white/40 border-white/[0.06] hover:border-white/[0.12]"
            }`}
          >
            {CATEGORY_CONFIG[cat].label.toLowerCase().split(" ")[0]}
          </button>
        );
      })}
    </div>
  );
}

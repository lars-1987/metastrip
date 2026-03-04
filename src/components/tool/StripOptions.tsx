"use client";

import { cn } from "@/lib/utils";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { Icon } from "@/components/shared/Icon";
import type {
  StripOptions as StripOptionsType,
  MetadataCategory,
} from "@/lib/processing/types";

interface StripOptionsProps {
  options: StripOptionsType;
  onChange: (options: StripOptionsType) => void;
}

export function StripOptions({ options, onChange }: StripOptionsProps) {
  const categories = Object.entries(CATEGORY_CONFIG) as [
    MetadataCategory,
    (typeof CATEGORY_CONFIG)[MetadataCategory],
  ][];

  const handleToggle = (category: MetadataCategory) => {
    onChange({ ...options, [category]: !options[category] });
  };

  const allSelected = Object.values(options).every(Boolean);

  const handleSelectAll = () => {
    const newOptions = { ...options };
    const targetValue = !allSelected;
    for (const key of Object.keys(newOptions)) {
      newOptions[key as MetadataCategory] = targetValue;
    }
    onChange(newOptions);
  };

  return (
    <div className="rounded-2xl bg-white/[0.02] border border-white/[0.06] p-5 animate-panel-fade-in">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[13px] font-semibold text-white/70 font-[family-name:var(--font-outfit)]">
          Strip Options
        </h3>
        <button
          onClick={handleSelectAll}
          className="text-[11px] text-purple-light font-[family-name:var(--font-mono)] hover:text-purple transition-colors cursor-pointer"
        >
          {allSelected ? "Deselect All" : "Select All"}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {categories.map(([category, config]) => (
          <label
            key={category}
            className={cn(
              "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
              options[category]
                ? "bg-purple/[0.06] border border-purple/15"
                : "bg-white/[0.01] border border-white/[0.04] hover:bg-white/[0.03]"
            )}
          >
            <input
              type="checkbox"
              checked={options[category]}
              onChange={() => handleToggle(category)}
              className="sr-only"
            />
            <div
              className={cn(
                "w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-all duration-200",
                options[category]
                  ? "bg-purple border-purple"
                  : "bg-transparent border-white/15"
              )}
            >
              {options[category] && (
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}
            </div>
            <Icon name={config.icon} size={16} weight="duotone" color={config.color} />
            <span className="text-[13px] text-white/65 font-[family-name:var(--font-outfit)]">
              {config.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

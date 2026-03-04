"use client";

import { useState } from "react";
import type { FileEntry, MetadataCategory } from "@/lib/processing/types";
import { CATEGORY_CONFIG } from "@/lib/constants";
import { Icon } from "@/components/shared/Icon";
import { cn } from "@/lib/utils";

interface MetadataPreviewProps {
  entry: FileEntry;
}

export function MetadataPreview({ entry }: MetadataPreviewProps) {
  const [expandedCats, setExpandedCats] = useState<Set<string>>(
    new Set(["gps", "author"])
  );

  const { status, result } = entry;
  const fields = result?.report?.fieldsFound ?? [];

  if (fields.length === 0) {
    return (
      <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] animate-panel-fade-in">
        <div className="p-4 px-5">
          <span className="text-[13px] font-semibold text-white/70 font-[family-name:var(--font-outfit)]">
            No metadata found
          </span>
          <p className="text-xs text-white/30 font-[family-name:var(--font-outfit)] mt-2">
            This file doesn&apos;t contain any detectable metadata.
          </p>
        </div>
      </div>
    );
  }

  // Group fields by category
  const grouped = fields.reduce<Record<string, typeof fields>>((acc, field) => {
    if (!acc[field.category]) acc[field.category] = [];
    acc[field.category].push(field);
    return acc;
  }, {});

  const removedKeys = new Set(
    result?.report?.fieldsRemoved?.map((f) => `${f.category}:${f.key}`) ?? []
  );

  const toggle = (cat: string) => {
    setExpandedCats((prev) => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const categories = Object.entries(grouped).filter(
    ([, catFields]) => catFields.length > 0
  );

  return (
    <div className="rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.06] animate-panel-fade-in">
      {/* Header */}
      <div className="p-3.5 px-5 border-b border-white/[0.05] flex items-center justify-between">
        <span className="text-[13px] font-semibold text-white/70 font-[family-name:var(--font-outfit)]">
          Metadata Found
        </span>
        <span
          className={cn(
            "text-[11px] px-2.5 py-0.5 rounded-full font-[family-name:var(--font-mono)] font-medium",
            status === "done"
              ? "bg-success/10 text-success"
              : "bg-danger/10 text-danger"
          )}
        >
          {status === "done" ? "STRIPPED" : "EXPOSED"}
        </span>
      </div>

      {/* Category sections */}
      {categories.map(([cat, catFields]) => {
        const config = CATEGORY_CONFIG[cat as MetadataCategory];
        if (!config) return null;
        const isExpanded = expandedCats.has(cat);

        return (
          <div key={cat} className="border-b border-white/[0.03] last:border-0">
            <button
              onClick={() => toggle(cat)}
              className="w-full p-3 px-5 border-none cursor-pointer bg-transparent flex items-center gap-2.5 transition-colors duration-200 hover:bg-white/[0.02]"
            >
              <Icon name={config.icon} size={16} weight="duotone" color={config.color} />
              <span className="flex-1 text-left text-[13px] font-medium text-white/70 font-[family-name:var(--font-outfit)]">
                {config.label}
              </span>
              <span
                className="text-[10px] px-2 py-0.5 rounded-md font-[family-name:var(--font-mono)] font-semibold"
                style={{
                  background: `${config.color}15`,
                  color: config.color,
                }}
              >
                {catFields.length}
              </span>
              <span
                className={cn(
                  "text-white/30 text-xs transition-transform duration-200",
                  isExpanded && "rotate-180"
                )}
              >
                {"\u25BE"}
              </span>
            </button>

            {isExpanded && (
              <div className="pb-3 pl-11 pr-5">
                {catFields.map((field, i) => {
                  const isRemoved = removedKeys.has(
                    `${field.category}:${field.key}`
                  );
                  return (
                    <div
                      key={`${field.key}-${i}`}
                      className={cn(
                        "flex justify-between items-center py-1.5",
                        i < catFields.length - 1 && "border-b border-white/[0.02]"
                      )}
                    >
                      <span className="text-xs text-white/40 font-[family-name:var(--font-outfit)]">
                        {field.label}
                      </span>
                      <span
                        className={cn(
                          "text-xs font-[family-name:var(--font-mono)] max-w-[280px] truncate",
                          isRemoved
                            ? "text-white/20 line-through"
                            : "text-white/60"
                        )}
                      >
                        {String(field.value ?? "")}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

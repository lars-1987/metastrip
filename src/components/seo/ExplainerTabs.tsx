"use client";

import { useState } from "react";
import type { ExplainerTab } from "@/lib/seo-configs";
import { Icon } from "@/components/shared/Icon";

interface ExplainerTabsProps {
  tabs: ExplainerTab[];
}

export default function ExplainerTabs({ tabs }: ExplainerTabsProps) {
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.id ?? "");

  const current = tabs.find((t) => t.id === activeTab);

  return (
    <div>
      {/* ── Tab bar ── */}
      <div className="flex gap-1.5 p-1 rounded-[14px] bg-[var(--surface)] border border-[var(--border)] overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2.5 px-3 rounded-[10px] border-none cursor-pointer flex items-center justify-center gap-[7px] transition-all duration-200 min-w-0 ${
                isActive
                  ? "bg-[var(--surface-elevated)]"
                  : "bg-transparent hover:bg-[var(--surface)]"
              }`}
            >
              <Icon name={tab.icon} size={14} weight="duotone" />
              <span
                className={`text-[13px] font-medium font-[family-name:var(--font-outfit)] truncate ${
                  isActive ? "text-[color:var(--text)]" : "text-[color:var(--text-muted)]"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content panel ── */}
      {current && (
        <div
          key={current.id}
          className="rounded-[20px] bg-[var(--surface)] border border-[var(--border)] animate-panel-fade-in mt-4"
        >
          <div className="p-8 px-7">
            {/* Icon + title */}
            <div className="flex items-center gap-3 mb-4">
              <Icon name={current.icon} size={24} weight="duotone" className="text-[color:var(--text)]" />
              <h3 className="text-xl font-bold text-[color:var(--text)] font-[family-name:var(--font-outfit)] -tracking-[0.02em]">
                {current.title}
              </h3>
            </div>

            {/* Description */}
            <p className="text-sm text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.7] mb-5 max-w-[560px]">
              {current.description}
            </p>

            {/* Example box */}
            <div className="p-[14px] px-[18px] rounded-xl bg-black/30 border border-[var(--border)] mb-4">
              <p className="text-[10px] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] mb-1.5 tracking-[0.08em] uppercase">
                {current.example.label}
              </p>
              <p
                className="text-sm font-[family-name:var(--font-mono)] font-medium leading-relaxed break-words"
                style={{ color: current.color }}
              >
                {current.example.value}
              </p>
            </div>

            {/* Risk callout */}
            <div className="flex gap-2.5 p-3 px-4 rounded-xl bg-danger/[0.04] border border-danger/[0.08]">
              <span className="shrink-0 mt-0.5"><Icon name="Warning" size={14} weight="fill" className="text-danger/70" /></span>
              <p className="text-[13px] text-danger/70 font-[family-name:var(--font-outfit)] leading-relaxed">
                {current.risk}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

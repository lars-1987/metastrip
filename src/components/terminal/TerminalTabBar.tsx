"use client";

import type { TabState } from "@/hooks/useTerminalTabs";

interface TerminalTabBarProps {
  tabs: TabState[];
  activeTabId: string;
  onSelectTab: (id: string) => void;
  onCloseTab: (id: string) => void;
  onNewTab: () => void;
}

export function TerminalTabBar({
  tabs,
  activeTabId,
  onSelectTab,
  onCloseTab,
  onNewTab,
}: TerminalTabBarProps) {
  return (
    <div className="flex items-center bg-white/[0.02] border-b border-white/[0.06] overflow-x-auto shrink-0 scrollbar-none">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-[family-name:var(--font-mono)] border-none cursor-pointer transition-colors duration-150 whitespace-nowrap shrink-0 ${
              isActive
                ? "bg-white/[0.06] text-white/90"
                : "bg-transparent text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
            }`}
          >
            <span>{tab.label}</span>
            {tabs.length > 1 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseTab(tab.id);
                }}
                className="w-4 h-4 flex items-center justify-center rounded text-[10px] text-white/20 hover:text-white/60 hover:bg-white/[0.08] opacity-0 group-hover:opacity-100 transition-all duration-150"
              >
                ×
              </span>
            )}
            {isActive && (
              <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-purple rounded-full" />
            )}
          </button>
        );
      })}

      {/* New tab button */}
      <button
        onClick={onNewTab}
        className="flex items-center justify-center w-8 h-8 mx-1 text-white/20 hover:text-white/50 hover:bg-white/[0.04] rounded transition-colors duration-150 cursor-pointer bg-transparent border-none text-sm font-[family-name:var(--font-mono)] shrink-0"
        aria-label="New tab"
      >
        +
      </button>
    </div>
  );
}

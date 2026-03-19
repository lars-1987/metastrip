"use client";

import { useState, useCallback } from "react";

export type TabType = "metastrip" | "kofi" | "privacy" | "about" | "blog";

export interface TabState {
  id: string;
  type: TabType;
  label: string;
  closable?: boolean;
}

let tabCounter = 0;

function createId() {
  return `tab-${Date.now()}-${++tabCounter}`;
}

const DEFAULT_TABS: TabState[] = [
  { id: "tab-metastrip-default", type: "metastrip", label: "metastrip" },
  { id: "tab-kofi-default", type: "kofi", label: "buy me a coffee \u2615" },
  { id: "tab-privacy-default", type: "privacy", label: "privacy & use", closable: true },
  { id: "tab-about-default", type: "about", label: "about", closable: true },
  { id: "tab-blog-default", type: "blog", label: "blog", closable: true },
];

export function useTerminalTabs() {
  const [tabs, setTabs] = useState<TabState[]>(DEFAULT_TABS);
  const [activeTabId, setActiveTabId] = useState(DEFAULT_TABS[0].id);

  const createTab = useCallback(() => {
    const id = createId();
    const newTab: TabState = {
      id,
      type: "metastrip",
      label: "metastrip",
    };
    setTabs((prev) => [...prev, newTab]);
    setActiveTabId(id);
  }, []);

  const openTab = useCallback((type: TabType, label: string) => {
    // Focus existing tab of that type if it exists
    setTabs((prev) => {
      const existing = prev.find((t) => t.type === type);
      if (existing) {
        setActiveTabId(existing.id);
        return prev;
      }
      // Create new tab
      const id = createId();
      const newTab: TabState = { id, type, label, closable: true };
      setActiveTabId(id);
      return [...prev, newTab];
    });
  }, []);

  const closeTab = useCallback(
    (id: string) => {
      setTabs((prev) => {
        if (prev.length <= 1) return prev;
        const idx = prev.findIndex((t) => t.id === id);
        const next = prev.filter((t) => t.id !== id);
        if (activeTabId === id) {
          const newIdx = Math.min(idx, next.length - 1);
          setActiveTabId(next[newIdx].id);
        }
        return next;
      });
    },
    [activeTabId]
  );

  return {
    tabs,
    activeTabId,
    setActiveTabId,
    createTab,
    closeTab,
    openTab,
  };
}

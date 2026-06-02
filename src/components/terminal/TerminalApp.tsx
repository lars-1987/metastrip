"use client";

import { useTerminalTabs } from "@/hooks/useTerminalTabs";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { TerminalWindow } from "./TerminalWindow";
import { TerminalTitleBar } from "./TerminalTitleBar";
import { TerminalTabBar } from "./TerminalTabBar";
import { TerminalSessionTab } from "./TerminalSessionTab";
import { KofiTab } from "./KofiTab";
import { PrivacyTab } from "./PrivacyTab";
import { AboutTab } from "./AboutTab";
import { BlogTab } from "./BlogTab";

/**
 * The terminal — now lives inline inside the hero section, no longer
 * a "desktop app". All chrome (menubar, dock, desktop icons, floating
 * joke windows, drag-to-move) was removed in the v3 redesign.
 */
export function TerminalApp() {
  const { tabs, activeTabId, setActiveTabId, createTab, closeTab } =
    useTerminalTabs();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  return (
    <div className="w-full max-w-5xl mx-auto">
      <TerminalWindow>
        <TerminalTitleBar />
        <TerminalTabBar
          tabs={tabs}
          activeTabId={activeTabId}
          onSelectTab={setActiveTabId}
          onCloseTab={closeTab}
          onNewTab={createTab}
        />

        {/* Tab content — each metastrip tab gets its own key for independent
            state. Wrapped in an ErrorBoundary keyed by the active tab so a
            render/processing throw in one tab shows a contained, recoverable
            fallback inside the terminal chrome instead of white-screening the
            whole page. Re-keying on tab id resets the boundary when the user
            switches tabs. */}
        <ErrorBoundary key={`boundary-${activeTabId}`} label="this tab">
          {activeTab?.type === "metastrip" && (
            <TerminalSessionTab
              key={activeTab.id}
              onOpenSupport={() => {
                const kofiTab = tabs.find((t) => t.type === "kofi");
                if (kofiTab) setActiveTabId(kofiTab.id);
              }}
            />
          )}
          {activeTab?.type === "kofi" && <KofiTab />}
          {activeTab?.type === "privacy" && <PrivacyTab />}
          {activeTab?.type === "about" && <AboutTab />}
          {activeTab?.type === "blog" && <BlogTab />}
        </ErrorBoundary>
      </TerminalWindow>
    </div>
  );
}

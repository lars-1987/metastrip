"use client";

import { useCallback, useRef, useState } from "react";
import { useTerminalTabs, type TabType } from "@/hooks/useTerminalTabs";
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
import { TerminalWindow } from "./TerminalWindow";
import { TerminalTitleBar } from "./TerminalTitleBar";
import { TerminalTabBar } from "./TerminalTabBar";
import { TerminalSessionTab } from "./TerminalSessionTab";
import { KofiTab } from "./KofiTab";
import { PrivacyTab } from "./PrivacyTab";
import { AboutTab } from "./AboutTab";
import { BlogTab } from "./BlogTab";
import { Wallpaper } from "./desktop/Wallpaper";
import { MenuBar } from "./desktop/MenuBar";
import { Dock } from "./desktop/Dock";
import { DesktopIcons } from "./desktop/DesktopIcons";
import { FloatingWindow } from "./desktop/FloatingWindow";
import { WelcomeNotification } from "./desktop/WelcomeNotification";
import { ShutDown } from "./desktop/ShutDown";
import { DESKTOP_WINDOWS } from "./desktop/windows";

const TAB_LABELS: Record<TabType, string> = {
  metastrip: "metastrip",
  kofi: "buy me a coffee ☕",
  privacy: "privacy & use",
  about: "about",
  blog: "blog",
};

interface OpenWindow {
  id: string;
  x: number;
  y: number;
}

const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

/**
 * /terminal: the original terminal UI on a fake macOS desktop, kept as an
 * easter egg for anyone poking around. Menubar, dock, draggable desktop icons,
 * joke windows, a draggable terminal, and photo.jpg, which strips for real when
 * dropped on the terminal. Below lg it is just the terminal on the wallpaper.
 */
export function TerminalApp() {
  const { tabs, activeTabId, setActiveTabId, createTab, closeTab, openTab } = useTerminalTabs();
  const activeTab = tabs.find((t) => t.id === activeTabId);

  /* ── the terminal window drags by its title bar ── */
  const [termOffset, setTermOffset] = useState({ x: 0, y: 0 });
  const [termDragging, setTermDragging] = useState(false);
  const termDragStart = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

  const handleTermDragStart = useCallback(
    (e: React.PointerEvent) => {
      if (!isDesktop()) return;
      // Leave the traffic lights clickable.
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      if (e.clientX - rect.left < 80) return;
      setTermDragging(true);
      termDragStart.current = { mouseX: e.clientX, mouseY: e.clientY, offsetX: termOffset.x, offsetY: termOffset.y };
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    [termOffset]
  );

  const handleTermDragMove = useCallback(
    (e: React.PointerEvent) => {
      if (!termDragging) return;
      setTermOffset({
        x: termDragStart.current.offsetX + (e.clientX - termDragStart.current.mouseX),
        // Never above the menubar, so the title bar can always be grabbed again.
        y: Math.max(-28, termDragStart.current.offsetY + (e.clientY - termDragStart.current.mouseY)),
      });
    },
    [termDragging]
  );

  /* ── joke windows, most recently focused last (drawn on top) ── */
  const [windows, setWindows] = useState<OpenWindow[]>([]);

  const openWindow = useCallback((id: string) => {
    const def = DESKTOP_WINDOWS[id];
    if (!def) return;
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === id);
      if (existing) return [...prev.filter((w) => w.id !== id), existing];
      const n = prev.length % 5;
      return [
        ...prev,
        {
          id,
          x: Math.max(24, Math.round(window.innerWidth / 2 - def.width / 2 - 140 + n * 32)),
          y: 96 + n * 32,
        },
      ];
    });
  }, []);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) => (prev[prev.length - 1]?.id === id ? prev : [...prev.filter((w) => w.id !== id), prev.find((w) => w.id === id)!]));
  }, []);

  const closeWindow = useCallback((id: string) => setWindows((prev) => prev.filter((w) => w.id !== id)), []);

  /** Desktop icons and the dock share one id space: tab types open tabs,
   *  anything else is a joke window. */
  const open = useCallback(
    (id: string) => {
      if (id in TAB_LABELS) openTab(id as TabType, TAB_LABELS[id as TabType]);
      else openWindow(id);
    },
    [openTab, openWindow]
  );

  const handleDropOnTerminal = useCallback(
    async (iconId: string) => {
      if (iconId !== "photo") return;
      const session = tabs.find((t) => t.type === "metastrip");
      if (session) setActiveTabId(session.id);
      const { createDemoJpeg } = await import("@/lib/demo-jpeg");
      const file = createDemoJpeg();
      // Let the tab switch render before the session tab picks the file up.
      setTimeout(() => window.dispatchEvent(new CustomEvent("metastrip-demo-file", { detail: file })), 100);
    },
    [tabs, setActiveTabId]
  );

  const [shutDown, setShutDown] = useState(false);

  return (
    // translate="no" + notranslate: browser auto-translation rewrites text nodes
    // in place, which makes React's DOM updates throw inside this constantly
    // changing surface. data-private keeps it out of session replay.
    <div className="notranslate min-h-dvh bg-[#0f0b1f]" translate="no" data-private>
      <Wallpaper />
      <MenuBar
        onAbout={() => openWindow("about")}
        onShutDown={() => setShutDown(true)}
        onNewTab={createTab}
        onOpenTab={openTab}
        onOpenWindow={openWindow}
      />
      <DesktopIcons onOpen={open} onDropOnTerminal={handleDropOnTerminal} />
      <Dock onOpen={open} />

      {windows.map((w, i) => {
        const def = DESKTOP_WINDOWS[w.id];
        return (
          <FloatingWindow
            key={w.id}
            title={def.title}
            width={def.width}
            initialX={w.x}
            initialY={w.y}
            z={50 + i}
            onFocus={() => focusWindow(w.id)}
            onClose={() => closeWindow(w.id)}
          >
            {def.content}
          </FloatingWindow>
        );
      })}

      <div
        className="relative z-[1] flex min-h-dvh items-start justify-center p-3 pt-4 lg:p-0 lg:pt-14 pointer-events-none"
        style={{
          transform: `translate(${termOffset.x}px, ${termOffset.y}px)`,
          transition: termDragging ? "none" : "transform 0.1s ease-out",
        }}
        onPointerMove={handleTermDragMove}
        onPointerUp={() => setTermDragging(false)}
      >
        <TerminalWindow>
          <TerminalTitleBar onDragStart={handleTermDragStart} />
          <TerminalTabBar tabs={tabs} activeTabId={activeTabId} onSelectTab={setActiveTabId} onCloseTab={closeTab} onNewTab={createTab} />
          {/* Keyed by tab so a throw in one tab shows a contained fallback and
              resets when the user switches tabs. */}
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

      <WelcomeNotification />
      {shutDown && <ShutDown onDone={() => setShutDown(false)} />}
    </div>
  );
}

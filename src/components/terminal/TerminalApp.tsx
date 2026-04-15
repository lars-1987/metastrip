"use client";

import { useState, useCallback, useRef } from "react";
import { useTerminalTabs, type TabType } from "@/hooks/useTerminalTabs";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { DesktopIcons } from "@/components/shared/DesktopIcons";
import { Dock } from "@/components/shared/Dock";
import { MenuBar } from "@/components/shared/MenuBar";
import { TerminalWindow } from "./TerminalWindow";
import { TerminalTitleBar } from "./TerminalTitleBar";
import { TerminalTabBar } from "./TerminalTabBar";
import { TerminalSessionTab } from "./TerminalSessionTab";
import { KofiTab } from "./KofiTab";
import { PrivacyTab } from "./PrivacyTab";
import { AboutTab } from "./AboutTab";
import { BlogTab } from "./BlogTab";
import { FloatingWindow } from "./FloatingWindow";

/* ── Joke content for desktop icons ── */
interface JokeWindow {
  id: string;
  title: string;
  content: React.ReactNode;
  width?: number;
  x: number;
  y: number;
}

const JOKE_CONTENT: Record<string, { title: string; content: React.ReactNode; width?: number }> = {
  env: {
    title: ".env",
    width: 380,
    content: (
      <pre className="text-[12px] font-[family-name:var(--font-mono)] leading-relaxed text-white/80 whitespace-pre-wrap">
        <span className="text-white/40"># DO NOT COMMIT THIS FILE</span>{"\n"}
        <span className="text-white/40"># ...seriously, we mean it this time</span>{"\n\n"}
        <span className="text-purple-400">SECRET_KEY</span>=<span className="text-emerald-400">nice-try-buddy</span>{"\n"}
        <span className="text-purple-400">DATABASE_URL</span>=<span className="text-emerald-400">localhost:5432/we-dont-have-one</span>{"\n"}
        <span className="text-purple-400">AWS_ACCESS_KEY</span>=<span className="text-emerald-400">lol-everything-is-client-side</span>{"\n"}
        <span className="text-purple-400">TRACKING_ENABLED</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">ADS_ENABLED</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">USER_DATA_SOLD</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">UPLOAD_TO_SERVER</span>=<span className="text-red-400">false</span>{"\n"}
        <span className="text-purple-400">COOKIES</span>=<span className="text-emerald-400">chocolate-chip-only</span>{"\n\n"}
        <span className="text-white/40"># the only env vars you need when</span>{"\n"}
        <span className="text-white/40"># everything runs in the browser</span>
      </pre>
    ),
  },
  nodemodules: {
    title: "node_modules/ — 47.3 GB",
    width: 380,
    content: (
      <div className="text-[12px] font-[family-name:var(--font-mono)] leading-snug">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/[0.06] text-[11px]">
          <span className="text-white/40">~/metastrip/</span>
          <span className="text-amber-400">node_modules</span>
        </div>
        {/* File listing */}
        <div className="space-y-0.5">
          {[
            { name: "is-odd/", size: "2.1 GB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "is-even/", size: "2.1 GB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "is-number/", size: "1.8 GB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "left-pad/", size: "1.2 GB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "is-is-odd/", size: "900 MB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "is-thirteen/", size: "750 MB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "pad-left-right-center/", size: "450 MB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: "is-positive-negative-zero-maybe/", size: "380 MB", icon: "📁", color: "text-[#6CB4EE]" },
            { name: ".package-lock.json", size: "94 MB", icon: "📄", color: "text-white/60" },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white/[0.04] group cursor-default">
              <span className="text-[13px]">{f.icon}</span>
              <span className={`flex-1 ${f.color} group-hover:text-white/90 transition-colors truncate`}>{f.name}</span>
              <span className="text-white/30 text-[10px] shrink-0">{f.size}</span>
            </div>
          ))}
        </div>
        {/* Status bar */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06] text-[10px] text-white/30">
          <span>9 items — 47.3 GB total</span>
          <span className="text-amber-400/50">rm -rf not recommended</span>
        </div>
      </div>
    ),
  },
  uploads: {
    title: "uploads/",
    width: 400,
    content: (
      <div className="text-[12px] font-[family-name:var(--font-mono)] leading-snug">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 mb-3 pb-2 border-b border-white/[0.06] text-[11px]">
          <span className="text-white/40">~/metastrip/</span>
          <span className="text-purple-400">uploads</span>
        </div>
        {/* File listing */}
        <div className="space-y-0.5">
          {[
            { name: "vacation_2026.jpg", size: "4.2 MB", icon: "🖼️", meta: "GPS: 35.6762° N, 139.6503° E", metaColor: "text-red-400/60" },
            { name: "selfie_cafe.jpg", size: "3.8 MB", icon: "🖼️", meta: "Device: iPhone 15 Pro", metaColor: "text-red-400/60" },
            { name: "resume_final_FINAL_v3.pdf", size: "2.1 MB", icon: "📄", meta: "Author: John Smith", metaColor: "text-red-400/60" },
            { name: "quarterly_report.docx", size: "890 KB", icon: "📝", meta: "Creator: Microsoft Word", metaColor: "text-red-400/60" },
            { name: "budget_2026.xlsx", size: "1.4 MB", icon: "📊", meta: "Last saved by: Admin", metaColor: "text-red-400/60" },
            { name: "cat_sleeping.png", size: "5.7 MB", icon: "🖼️", meta: "GPS: your living room", metaColor: "text-red-400/60" },
            { name: "definitely_not_memes/", size: "—", icon: "📁", meta: "nice try", metaColor: "text-white/30" },
          ].map((f) => (
            <div key={f.name} className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/[0.04] group cursor-default">
              <span className="text-[13px]">{f.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-white/80 group-hover:text-white/95 transition-colors truncate">{f.name}</div>
                <div className={`text-[10px] ${f.metaColor} truncate`}>{f.meta}</div>
              </div>
              <span className="text-white/30 text-[10px] shrink-0">{f.size}</span>
            </div>
          ))}
        </div>
        {/* Status bar */}
        <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/[0.06] text-[10px]">
          <span className="text-white/30">7 items — 18.1 MB</span>
          <span className="text-emerald-400/60">drag into metastrip to clean →</span>
        </div>
      </div>
    ),
  },
  photo: {
    title: "photo.jpg — Properties",
    width: 360,
    content: (
      <div className="text-[12px] font-[family-name:var(--font-mono)] leading-relaxed">
        <div className="w-full h-28 rounded-lg mb-3 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)" }}>
          <span className="text-3xl">📸</span>
        </div>
        <div className="text-white/50 mb-2">EXIF Metadata:</div>
        <div className="text-white/70 space-y-1">
          <div><span className="text-red-400">GPS:</span> 37.7749° N, 122.4194° W</div>
          <div><span className="text-red-400">Device:</span> iPhone 15 Pro Max</div>
          <div><span className="text-red-400">Serial:</span> DNQXYZ123456</div>
          <div><span className="text-red-400">Time:</span> 2026-03-19 08:42:17</div>
          <div><span className="text-red-400">Software:</span> iOS 19.3.1</div>
          <div><span className="text-red-400">Author:</span> John Privacy-Doesn&apos;t-Care</div>
        </div>
        <div className="mt-3 pt-3 border-t border-white/[0.06] text-amber-400/80 text-[11px]">
          ^ this is why you need metastrip
        </div>
      </div>
    ),
  },
  trash: {
    title: "Trash",
    width: 340,
    content: (
      <div className="text-[12px] font-[family-name:var(--font-mono)] leading-relaxed">
        <div className="flex items-center justify-center h-28 mb-3 text-5xl opacity-40">🗑️</div>
        <div className="text-center text-white/60 mb-1">Trash is empty</div>
        <div className="text-center text-white/40 text-[11px] mb-3">0 items &middot; 0 B</div>
        <div className="pt-3 border-t border-white/[0.06] text-emerald-400/70 text-[11px] text-center">
          nothing to delete — we never kept any of it
        </div>
      </div>
    ),
  },
  music: {
    title: "Now Playing",
    width: 340,
    content: (
      <div className="text-[12px] font-[family-name:var(--font-mono)] leading-relaxed">
        <div className="w-full h-28 rounded-lg mb-3 flex items-center justify-center"
          style={{ background: "linear-gradient(135deg, #a855f7 0%, #ec4899 50%, #f472b6 100%)" }}>
          <span className="text-4xl">♪</span>
        </div>
        <div className="text-white/90 text-[13px] mb-0.5">silence.mp3</div>
        <div className="text-white/50 text-[11px] mb-3">by metastrip &middot; Privacy, Vol. 1</div>
        {/* Fake scrubber */}
        <div className="h-0.5 bg-white/10 rounded-full mb-1 overflow-hidden">
          <div className="h-full w-1/3 bg-white/50 rounded-full" />
        </div>
        <div className="flex justify-between text-white/40 text-[10px] mb-3">
          <span>1:03</span>
          <span>3:14</span>
        </div>
        <div className="flex justify-center gap-5 text-white/70 text-lg mb-2">
          <span>⏮</span>
          <span>⏸</span>
          <span>⏭</span>
        </div>
        <div className="pt-3 border-t border-white/[0.06] text-white/50 text-[11px] text-center italic">
          the sound of your data not being uploaded
        </div>
      </div>
    ),
  },
};

export function TerminalApp() {
  const { tabs, activeTabId, setActiveTabId, createTab, closeTab, openTab } =
    useTerminalTabs();

  const activeTab = tabs.find((t) => t.id === activeTabId);

  /* ── Terminal drag state ── */
  const [termOffset, setTermOffset] = useState({ x: 0, y: 0 });
  const [termDragging, setTermDragging] = useState(false);
  const termDragStart = useRef({ mouseX: 0, mouseY: 0, offsetX: 0, offsetY: 0 });

  const handleTermDragStart = useCallback((e: React.PointerEvent) => {
    // Don't drag if clicking traffic lights area (first 80px)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    if (e.clientX - rect.left < 80) return;

    setTermDragging(true);
    termDragStart.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      offsetX: termOffset.x,
      offsetY: termOffset.y,
    };
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [termOffset]);

  const handleTermDragMove = useCallback((e: React.PointerEvent) => {
    if (!termDragging) return;
    setTermOffset({
      x: termDragStart.current.offsetX + (e.clientX - termDragStart.current.mouseX),
      y: termDragStart.current.offsetY + (e.clientY - termDragStart.current.mouseY),
    });
  }, [termDragging]);

  const handleTermDragEnd = useCallback(() => {
    setTermDragging(false);
  }, []);

  /* ── Floating joke windows ── */
  const [jokeWindows, setJokeWindows] = useState<JokeWindow[]>([]);

  const openJokeWindow = useCallback((id: string) => {
    // Don't open duplicate
    if (jokeWindows.some((w) => w.id === id)) {
      return;
    }
    const joke = JOKE_CONTENT[id];
    if (!joke) return;
    setJokeWindows((prev) => [
      ...prev,
      {
        id,
        title: joke.title,
        content: joke.content,
        width: joke.width,
        x: 200 + prev.length * 30,
        y: 150 + prev.length * 30,
      },
    ]);
  }, [jokeWindows]);

  const closeJokeWindow = useCallback((id: string) => {
    setJokeWindows((prev) => prev.filter((w) => w.id !== id));
  }, []);

  const handleDesktopOpen = useCallback((type: string, label: string) => {
    // Check if it's a joke window
    if (JOKE_CONTENT[type]) {
      openJokeWindow(type);
      return;
    }
    openTab(type as TabType, label);
  }, [openTab, openJokeWindow]);

  const handleDropOnTerminal = useCallback(async (iconId: string) => {
    if (iconId === "photo") {
      // Switch to a metastrip tab first
      const metastripTab = tabs.find((t) => t.type === "metastrip");
      if (metastripTab) {
        setActiveTabId(metastripTab.id);
      }
      // Create demo JPEG and dispatch event
      const { createDemoJpeg } = await import("@/lib/demo-jpeg");
      const file = createDemoJpeg();
      // Small delay to let tab switch render
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("metastrip-demo-file", { detail: file }));
      }, 100);
    }
  }, [tabs, setActiveTabId]);

  return (
    <>
      <AnimatedBackground />
      <MenuBar />
      <DesktopIcons onOpenTab={handleDesktopOpen} onDropOnTerminal={handleDropOnTerminal} />
      <Dock onOpenTab={handleDesktopOpen} />

      {/* Joke floating windows */}
      {jokeWindows.map((w) => (
        <FloatingWindow
          key={w.id}
          title={w.title}
          initialX={w.x}
          initialY={w.y}
          width={w.width}
          onClose={() => closeJokeWindow(w.id)}
        >
          {w.content}
        </FloatingWindow>
      ))}

      <div
        className="relative z-[1] flex items-start justify-center min-h-screen md:py-0 lg:pt-8 pointer-events-none"
        style={{
          transform: `translate(${termOffset.x}px, ${termOffset.y}px)`,
          transition: termDragging ? "none" : "transform 0.1s ease-out",
        }}
        onPointerMove={handleTermDragMove}
        onPointerUp={handleTermDragEnd}
      >
        <TerminalWindow>
          <TerminalTitleBar onDragStart={handleTermDragStart} />
          <TerminalTabBar
            tabs={tabs}
            activeTabId={activeTabId}
            onSelectTab={setActiveTabId}
            onCloseTab={closeTab}
            onNewTab={createTab}
          />

          {/* Tab content — each metastrip tab gets its own key for independent state */}
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
        </TerminalWindow>
      </div>
    </>
  );
}

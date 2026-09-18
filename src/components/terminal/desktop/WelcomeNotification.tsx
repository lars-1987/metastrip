"use client";

import { useEffect, useState } from "react";
import { MetaStripIcon } from "@/components/shared/Logo";

const SEEN_KEY = "metastrip-desktop-welcomed";

/** A macOS-style notification for whoever just stumbled in here. Shown once
 *  per browser session, a moment after load, and gone after 14 seconds. */
export function WelcomeNotification() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* storage blocked: show it anyway */
    }
    if (seen) return;
    const show = setTimeout(() => setShown(true), 1200);
    const hide = setTimeout(() => setShown(false), 15200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  if (!shown) return null;
  return (
    <div
      role="status"
      className="fixed right-3 top-3 lg:top-9 z-[210] w-[min(360px,calc(100vw-24px))] animate-panel-fade-in rounded-2xl border border-white/[0.12] p-3 pr-8 text-white"
      style={{
        background: "rgba(40, 36, 60, 0.72)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        boxShadow: "0 14px 40px rgba(0,0,0,0.45)",
      }}
    >
      <button
        type="button"
        onClick={() => setShown(false)}
        aria-label="Dismiss"
        className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-white/10 text-[11px] leading-none text-white/70 hover:bg-white/20"
      >
        ✕
      </button>
      <div className="flex gap-3">
        <span className="shrink-0">
          <MetaStripIcon size={36} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-semibold">You found the old MetaStrip</div>
          <p className="mt-0.5 text-[12.5px] leading-snug text-white/75">
            This is where it started, and it still works.{" "}
            <span className="hidden lg:inline">Drop a file in the terminal, or drag photo.jpg onto it.</span>
            <span className="lg:hidden">It&apos;s more fun on a bigger screen.</span>
          </p>
        </div>
      </div>
    </div>
  );
}

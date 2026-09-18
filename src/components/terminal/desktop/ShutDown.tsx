"use client";

import { useEffect, useState } from "react";
import { MetaStripIcon } from "@/components/shared/Logo";

/** Shut Down…: the screen goes dark, admits it is now safe to close the tab,
 *  and boots back up on a click. */
export function ShutDown({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<"fading" | "off" | "booting">("fading");

  useEffect(() => {
    if (phase === "fading") {
      const t = setTimeout(() => setPhase("off"), 900);
      return () => clearTimeout(t);
    }
    if (phase === "booting") {
      const t = setTimeout(onDone, 1800);
      return () => clearTimeout(t);
    }
  }, [phase, onDone]);

  return (
    <div
      className="fixed inset-0 z-[300] grid place-items-center bg-black font-[family-name:var(--font-mono)] animate-[desk-fade-in_0.8s_ease_both]"
      onClick={() => phase === "off" && setPhase("booting")}
      role="dialog"
      aria-label={phase === "booting" ? "Starting up" : "Shut down"}
    >
      {phase === "off" && (
        <div className="text-center cursor-pointer animate-[desk-fade-in_0.6s_ease_both]">
          <p className="text-[18px] text-[#ff9f43]">It&apos;s now safe to close this tab.</p>
          <p className="mt-3 text-[12px] text-white/35">Click anywhere to start it up again.</p>
        </div>
      )}
      {phase === "booting" && (
        <div className="flex flex-col items-center gap-6">
          <MetaStripIcon size={72} />
          <div className="h-1 w-44 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-white/80" style={{ animation: "desk-progress 1.6s ease-out both" }} />
          </div>
        </div>
      )}
    </div>
  );
}

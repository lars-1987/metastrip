"use client";

import { useEffect, useState } from "react";
import { messagesFor, type Locale } from "@/lib/i18n";

/** Recycled from V2: the metadata token cycles inside the H1 with a redact
 *  swap; reads as a declassified-document marker. */
function RedactedSlot({ items: METADATA_ITEMS }: { items: string[] }) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setIdx((i) => (i + 1) % METADATA_ITEMS.length), 2800);
    return () => clearInterval(id);
  }, [paused, METADATA_ITEMS.length]);

  return (
    <span
      className="relative inline-block align-middle whitespace-nowrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ marginInline: "0.05em" }}
    >
      <span
        key={idx}
        className="inline-block font-[family-name:var(--font-mono)] animate-redact-swap"
        style={{
          padding: "0.18em 0.42em 0.22em",
          background: "var(--text)",
          color: "var(--bg)",
          borderRadius: "0.18em",
          fontSize: "0.55em",
          fontWeight: 600,
          letterSpacing: "-0.005em",
          verticalAlign: "0.2em",
          textTransform: "lowercase",
        }}
      >
        {METADATA_ITEMS[idx]}
      </span>
    </span>
  );
}

function AnimatedUnderline() {
  return (
    <svg
      aria-hidden="true"
      className="absolute left-0 right-0 w-full pointer-events-none"
      style={{ bottom: "-0.18em", height: "0.32em" }}
      viewBox="0 0 300 14"
      preserveAspectRatio="none"
    >
      <path
        data-underline-path
        d="M 2,8 Q 75,1 150,7 Q 225,13 298,6"
        stroke="var(--text)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
        style={{ strokeDasharray: 320, strokeDashoffset: 320, animation: "var(--animate-draw-underline)" }}
      />
    </svg>
  );
}

/** The V2 hero statement, recycled to sit directly under the tool. */
export function HeroIntro({ locale = "en" }: { locale?: Locale }) {
  const m = messagesFor(locale).hero;
  return (
    <section className="px-6 lg:px-8 pt-24 lg:pt-32 pb-8">
      <div className="max-w-4xl mx-auto text-center" data-reveal>
        <h1
          className="font-extrabold leading-[1.02] tracking-[-0.04em] mb-7"
          style={{ color: "var(--text)", fontSize: "clamp(52px, 9vw, 100px)" }}
        >
          {m.before}<RedactedSlot items={m.items} />
          <br />
          <span className="relative inline-block">
            <AnimatedUnderline />
            <span className="relative">{m.after}</span>
          </span>
        </h1>
        <p
          className="mx-auto leading-[1.5] font-medium"
          style={{ color: "var(--text-secondary)", fontSize: "clamp(18px, 1.8vw, 22px)", maxWidth: 660 }}
        >
          {`${m.intro} ${m.tryAbove} `}
          <span
            className="inline-block align-middle ml-1 animate-bounce-down"
            style={{ color: "var(--accent-strong)" }}
            aria-hidden="true"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 16.5V3.5M10 3.5L4.5 9M10 3.5L15.5 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </p>
      </div>
    </section>
  );
}

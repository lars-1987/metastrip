"use client";

import type { ReactNode } from "react";

interface FounderPillProps {
  children: ReactNode;
}

/**
 * Dark "pill" with a square portrait on the left and bio text on the right.
 * Whole element links to X. Subtle lift + image zoom on hover.
 *
 * The portrait fills the full height of the text box (flex items-stretch +
 * absolute-positioned img with object-cover). Stacks vertically on mobile.
 */
export function FounderPill({ children }: FounderPillProps) {
  return (
    <a
      href="https://x.com/larsitodev"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Lars Holmstrom on X, @larsitodev"
      className="group block max-w-3xl mx-auto rounded-3xl overflow-hidden no-underline transition-all duration-300 ease-out hover:-translate-y-0.5"
      style={{
        background: "var(--card-inverse-bg)",
        color: "var(--card-inverse-text)",
        boxShadow:
          "0 6px 20px -8px rgba(31,21,48,0.18), 0 2px 6px -2px rgba(31,21,48,0.08)",
      }}
    >
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Portrait — inset inside the pill so the dark background frames it.
            Square always; vertically centered on desktop when text is taller. */}
        <div className="shrink-0 w-full md:w-[185px] lg:w-[205px] p-4 flex md:items-center justify-center">
          <div className="relative w-full aspect-square overflow-hidden rounded-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait.JPG"
              alt="Portrait of Lars Holmstrom"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            />
          </div>
        </div>

        {/* Text */}
        <div className="flex-1 px-6 pb-6 pt-2 md:pl-2 md:pr-8 md:py-6 lg:pr-9 lg:py-7 flex flex-col justify-center">
          <div
            className="leading-[1.7]"
            style={{
              color: "var(--card-inverse-muted)",
              fontSize: "clamp(14px, 1.4vw, 16px)",
            }}
          >
            {children}
          </div>
          <span
            className="mt-4 inline-flex items-center gap-1.5 text-[13px] font-semibold"
            style={{ color: "var(--card-inverse-text)" }}
          >
            <span>Find me on X</span>
            <span
              aria-hidden="true"
              className="transition-transform duration-200 ease-out group-hover:translate-x-1"
            >
              →
            </span>
          </span>
        </div>
      </div>
    </a>
  );
}

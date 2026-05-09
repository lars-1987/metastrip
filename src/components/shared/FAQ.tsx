"use client";

import { useState } from "react";
import { FAQS } from "./faq-data";
export { FAQS } from "./faq-data";
export type { FAQItem } from "./faq-data";

export function FAQ() {
  // Single-open accordion: opening one closes any other. null = all closed.
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="px-6 lg:px-8 py-24 lg:py-32">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-14 lg:mb-16">
          <div
            className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
            style={{ color: "var(--accent-strong)" }}
          >
            FAQ
          </div>
          <h2
            className="font-extrabold tracking-[-0.025em] leading-[1.05] mb-5"
            style={{
              color: "var(--text)",
              fontSize: "clamp(36px, 5vw, 60px)",
            }}
          >
            Questions? Answers.
          </h2>
          <p
            className="leading-[1.55] max-w-xl mx-auto"
            style={{ color: "var(--text-secondary)", fontSize: "clamp(16px, 1.5vw, 18px)" }}
          >
            Everything people usually ask about how the tool works,
            what it does to your files, and what happens to your data.
          </p>
        </div>

        {/* Helio-style: dark cards on light bg, single-open accordion */}
        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const isOpen = openIdx === i;
            return (
              <div
                key={i}
                data-open={isOpen}
                className="rounded-2xl overflow-hidden transition-shadow"
                style={{
                  background: "var(--card-inverse-bg)",
                  color: "var(--card-inverse-text)",
                  boxShadow: isOpen
                    ? "0 12px 32px -8px rgba(31,21,48,0.18)"
                    : "0 2px 8px -2px rgba(31,21,48,0.06)",
                }}
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-6 px-6 py-5 lg:px-7 lg:py-6 cursor-pointer text-left"
                  style={{ background: "transparent", color: "inherit", border: "none" }}
                >
                  <span
                    className="font-semibold leading-[1.35]"
                    style={{ fontSize: "clamp(16px, 1.5vw, 18px)" }}
                  >
                    {item.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 flex items-center justify-center transition-transform duration-200"
                    style={{
                      width: 24,
                      height: 24,
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      color: "var(--card-inverse-muted)",
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <line x1="9" y1="3" x2="9" y2="15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                      <line x1="3" y1="9" x2="15" y2="9" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>

                {/* CSS grid trick for smooth height animation, content always in DOM for SEO */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <div
                      className="px-6 pb-6 lg:px-7 lg:pb-7 leading-[1.7]"
                      style={{
                        color: "var(--card-inverse-muted)",
                        fontSize: "clamp(15px, 1.4vw, 17px)",
                      }}
                    >
                      {item.answer}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-14 text-center">
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            Still curious?{" "}
            <a
              href="mailto:hello@metastrip.app"
              className="underline underline-offset-2 font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              hello@metastrip.app
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

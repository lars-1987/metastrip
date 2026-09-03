"use client";

import { useState } from "react";
import { BATCH_LIMIT } from "@/lib/constants";

const PRIVACY_SECTIONS = [
  {
    num: "01",
    title: "INFORMATION WE DO NOT COLLECT",
    lines: [
      "Your files, images, documents, or any content you process.",
      "All file processing occurs entirely within your web browser.",
      "Files are never uploaded to our servers or any third-party servers.",
      "Metadata contained within your files (GPS, author, timestamps, etc).",
      "Personal information such as name, address, or phone number.",
      "User accounts, profiles, or login credentials. We have no account system.",
    ],
  },
  {
    num: "02",
    title: "INFORMATION WE COLLECT",
    lines: [
      "Analytics: PostHog (localStorage, no cookies, respects Do Not Track).",
      "  → page views, clicks, referrals, browser type, country-level location.",
      "  → no personal profiles created for anonymous visitors.",
      "Tips via Ko-fi: payment processed entirely by Ko-fi.",
      "  → we do not receive, process, or store any payment information.",
    ],
  },
  {
    num: "03",
    title: "HOW WE PROCESS YOUR FILES",
    lines: [
      "Images (JPEG, PNG, WebP)      → piexifjs (client-side JavaScript)",
      "PDF documents                 → pdf-lib (pure JS, in-browser)",
      "Office docs (DOCX/XLSX/PPTX)  → JSZip (unpack/modify in memory)",
      "Video (MP4, MOV, M4V)         → custom MP4 atom walker",
      "Audio (MP3, M4A, FLAC, WAV)   → custom ID3 / Vorbis / RIFF parsers",
      "",
      "No network requests during processing. Verify in DevTools > Network.",
      "Processed files download directly. Page close = all data discarded.",
    ],
  },
  {
    num: "04",
    title: "COOKIES AND LOCAL STORAGE",
    lines: [
      "No tracking cookies. No localStorage for tracking.",
      "PostHog configured: localStorage mode, Do Not Track respected.",
    ],
  },
  {
    num: "05",
    title: "THIRD-PARTY SERVICES",
    lines: [
      "Ko-fi         → optional tips     → ko-fi.com/privacy",
      "PostHog       → product analytics → posthog.com/privacy",
      "GitHub Pages  → static hosting    → docs.github.com/site-policy",
    ],
  },
  {
    num: "06",
    title: "DATA RETENTION",
    lines: [
      "No personal data collected beyond payment receipts.",
      "PostHog retains aggregate analytics. No personal profiles.",
    ],
  },
  {
    num: "07",
    title: "YOUR RIGHTS",
    lines: [
      "GDPR, CCPA, and similar rights satisfied by default (minimal data).",
      "Contact: hello@metastrip.app",
    ],
  },
];

const TERMS_SECTIONS = [
  {
    num: "01",
    title: "ACCEPTANCE",
    lines: [
      "By using MetaStrip you agree to these terms.",
      "The Service is operated by MetaStrip (\"we\", \"us\", \"our\").",
    ],
  },
  {
    num: "02",
    title: "DESCRIPTION OF SERVICE",
    lines: [
      "Web-based metadata removal:",
      "  Images:    JPEG, PNG, WebP",
      "  Documents: PDF, DOCX, XLSX, PPTX",
      "  Video:     MP4, MOV, M4V",
      "  Audio:     MP3, M4A, FLAC, WAV",
      "All processing is client-side JavaScript. Files never uploaded.",
      `Free to use. Batch limit: ${BATCH_LIMIT} files.`,
    ],
  },
  {
    num: "03",
    title: "USAGE LIMITS",
    lines: [
      `Up to ${BATCH_LIMIT} files (750 MB) per batch. No daily limits.`,
      "We reserve the right to modify limits at any time.",
    ],
  },
  {
    num: "04",
    title: "TIPS AND SUPPORT",
    lines: [
      "Optional tips via Ko-fi. Non-refundable. No extra features unlocked.",
      "Contact: hello@metastrip.app",
    ],
  },
  {
    num: "05",
    title: "ACCEPTABLE USE",
    lines: [
      "Do not process files you don't own or have rights to modify.",
      "Do not remove metadata to misrepresent origin/authorship.",
      "Do not remove copyright info in violation of DMCA or equivalent.",
      "Do not facilitate fraud, identity theft, or illegal activity.",
      "Do not interfere with or exploit the Service.",
    ],
  },
  {
    num: "06",
    title: "INTELLECTUAL PROPERTY",
    lines: [
      "MetaStrip brand, logo, design, and code are our IP.",
      "You retain all rights to files you process. We claim nothing.",
    ],
  },
  {
    num: "07",
    title: "WARRANTIES & LIABILITY",
    lines: [
      "Provided \"as is\" without warranties of any kind.",
      "No guarantee of complete metadata removal for all formats.",
      "Max liability: amount paid in last 12 months, or $10 USD.",
    ],
  },
  {
    num: "08",
    title: "GOVERNING LAW",
    lines: ["Laws of Victoria, Australia."],
  },
];

type DocTab = "privacy" | "terms";

export function PrivacyTab() {
  const [activeDoc, setActiveDoc] = useState<DocTab>("privacy");
  const sections = activeDoc === "privacy" ? PRIVACY_SECTIONS : TERMS_SECTIONS;

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Terminal prompt */}
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-2">
        <div className="font-[family-name:var(--font-mono)] text-sm text-white/65">
          <span className="text-purple-400 mr-1.5">❯</span>
          <span>cat /etc/metastrip/{activeDoc === "privacy" ? "privacy-policy" : "terms-of-service"}.md</span>
        </div>
      </div>

      {/* Doc tab switcher */}
      <div className="shrink-0 px-4 md:px-6 pb-3 flex gap-2">
        <button
          onClick={() => setActiveDoc("privacy")}
          className={`px-3 py-1.5 rounded-md text-sm font-[family-name:var(--font-mono)] border-none cursor-pointer transition-colors duration-150 ${
            activeDoc === "privacy"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-white/[0.04] text-white/40 hover:text-white/60"
          }`}
        >
          privacy-policy.md
        </button>
        <button
          onClick={() => setActiveDoc("terms")}
          className={`px-3 py-1.5 rounded-md text-sm font-[family-name:var(--font-mono)] border-none cursor-pointer transition-colors duration-150 ${
            activeDoc === "terms"
              ? "bg-purple-500/20 text-purple-400"
              : "bg-white/[0.04] text-white/40 hover:text-white/60"
          }`}
        >
          terms-of-service.md
        </button>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/[0.06]">
          <div className="text-xs text-white/35 font-[family-name:var(--font-mono)] mb-2">
            ─── {activeDoc === "privacy" ? "PRIVACY POLICY" : "TERMS OF SERVICE"} ───
          </div>
          <div className="text-xl font-bold text-white/95 font-[family-name:var(--font-mono)]">
            # {activeDoc === "privacy" ? "Privacy Policy" : "Terms of Service"}
          </div>
          <div className="text-xs text-white/40 font-[family-name:var(--font-mono)] mt-1">
            Effective: 2026-03-01 | Last updated: 2026-03-01
          </div>
        </div>

        {/* TL;DR box */}
        <div className="mb-6 p-4 rounded-lg bg-success/[0.04] border border-success/[0.08]">
          <div className="text-xs text-success font-[family-name:var(--font-mono)] font-bold mb-2">
            &gt; TL;DR
          </div>
          <div className="text-sm text-white/60 font-[family-name:var(--font-mono)] leading-relaxed">
            {activeDoc === "privacy"
              ? "Files processed in-browser. We never see them. No tracking cookies. No accounts. Minimal analytics. Free forever."
              : `MetaStrip is free, as-is. You own your files. Don't use it for anything illegal. Batch limit: ${BATCH_LIMIT} files.`}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div key={section.num} className="mb-5">
            <div className="text-xs font-bold font-[family-name:var(--font-mono)] mb-2">
              <span className="text-purple-400/70">{section.num}</span>
              <span className="text-white/70 ml-2">## {section.title}</span>
            </div>
            <div className="pl-4 border-l border-white/[0.06]">
              {section.lines.map((line, j) => (
                <div
                  key={j}
                  className={`text-sm font-[family-name:var(--font-mono)] leading-[1.8] ${
                    line === "" ? "h-3" : line.startsWith("  →") ? "text-white/50 pl-2" : "text-white/60"
                  }`}
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            ─── EOF ───
          </div>
          <div className="text-sm text-white/50 font-[family-name:var(--font-mono)] mt-2">
            Questions? →{" "}
            <a href="mailto:hello@metastrip.app" className="text-purple-400/70 hover:text-purple-400 transition-colors no-underline">
              hello@metastrip.app
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

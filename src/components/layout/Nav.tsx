"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

interface NavProps {
  fileCount?: number;
}

export function Nav({ fileCount }: NavProps) {
  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between"
      style={{
        background: "rgba(9,9,11,0.7)",
        backdropFilter: "blur(20px) saturate(1.5)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <Link href="/" className="no-underline">
        <Logo />
      </Link>
      <div className="flex items-center gap-6">
        <span className="text-[13px] text-white/40 font-[family-name:var(--font-outfit)] tracking-[0.02em] hidden sm:block">
          100% Client-Side Processing
        </span>
        {fileCount != null && fileCount > 0 && (
          <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple/[0.12] border border-purple/20">
            <div
              className="w-1.5 h-1.5 rounded-full bg-success-dark animate-pulse-dot"
              style={{ boxShadow: "0 0 6px #22c55e" }}
            />
            <span className="text-xs text-purple-light font-medium font-[family-name:var(--font-mono)]">
              {fileCount} file{fileCount !== 1 ? "s" : ""} queued
            </span>
          </div>
        )}
        <Link
          href="/pricing"
          className="px-5 py-2 rounded-lg border-none cursor-pointer text-white text-[13px] font-semibold font-[family-name:var(--font-outfit)] tracking-[0.01em] transition-all duration-200 hover:-translate-y-px no-underline"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow:
              "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          Get Batch Pass
        </Link>
      </div>
    </nav>
  );
}

"use client";

import Link from "next/link";
import { Logo } from "@/components/shared/Logo";

export function Nav() {
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
      </div>
    </nav>
  );
}

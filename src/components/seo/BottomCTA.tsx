import Link from "next/link";
import type { BatchCTA } from "@/lib/seo-configs";

interface BottomCTAProps {
  batchCta: BatchCTA;
}

export default function BottomCTA({ batchCta }: BottomCTAProps) {
  return (
    <section
      className="text-center mt-16 py-12 px-9 rounded-3xl border border-purple/[0.1]"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)",
      }}
    >
      <h2 className="text-[26px] font-bold text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-2.5">
        Need to process more files?
      </h2>

      <p className="text-sm text-white/40 font-[family-name:var(--font-outfit)] mb-6 leading-relaxed">
        {batchCta.subtext}
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl text-[15px] font-semibold font-[family-name:var(--font-outfit)] no-underline text-white"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow:
              "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {batchCta.text}
        </Link>

        <Link
          href="/pricing"
          className="px-8 py-3.5 rounded-xl border border-white/[0.1] bg-white/[0.03] text-white/70 text-[15px] font-semibold font-[family-name:var(--font-outfit)] hover:bg-white/[0.06] transition-all no-underline"
        >
          View Pricing
        </Link>
      </div>
    </section>
  );
}

import Link from "next/link";
import type { BatchCTA } from "@/lib/seo-configs";

interface BottomCTAProps {
  batchCta: BatchCTA;
}

export default function BottomCTA({ batchCta }: BottomCTAProps) {
  return (
    <section
      className="text-center mt-16 py-12 px-9 rounded-3xl border border-[color:color-mix(in_srgb,var(--accent-strong)_30%,transparent)]"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)",
      }}
    >
      <h2 className="text-[26px] font-bold text-[color:var(--text)] font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-2.5">
        Ready to strip metadata? It&apos;s free.
      </h2>

      <p className="text-sm text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] mb-6 leading-relaxed">
        {batchCta.subtext}
      </p>

      <div className="flex items-center justify-center gap-3">
        <Link
          href="/"
          className="px-8 py-3.5 rounded-xl text-[15px] font-semibold font-[family-name:var(--font-outfit)] no-underline text-white"
          style={{
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow:
              "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
        >
          {batchCta.text}
        </Link>
      </div>
    </section>
  );
}

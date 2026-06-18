import { V3Tool } from "../tool/V3Tool";

export function Hero() {
  return (
    <section className="relative px-5 pt-5 md:px-[116px] md:pt-8 md:min-h-[calc(100svh-84px)]">
      {/* ambient wash, pure CSS */}
      <div className="v3-aurora pointer-events-none absolute inset-0 -z-10" aria-hidden />

      {/* full-bleed tool — evenly framed (32px) on all four sides */}
      <div className="w-full">
        <V3Tool />
      </div>

      {/* scroll hint floats in the bottom margin band without breaking the frame */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2" aria-hidden>
        <span className="v3-mono text-[12px] text-[var(--text-muted)]">scroll ↓</span>
      </div>
    </section>
  );
}

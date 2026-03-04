import type { SEOContentBlock } from "@/lib/seo-configs";

interface SEOContentProps {
  seo: SEOContentBlock;
}

export default function SEOContent({ seo }: SEOContentProps) {
  return (
    <section className="p-9 px-8 rounded-[20px] bg-white/[0.015] border border-white/[0.04]">
      <h2 className="text-[22px] font-bold text-white/85 font-[family-name:var(--font-outfit)] mb-4 -tracking-[0.02em]">
        {seo.heading}
      </h2>
      {seo.paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={`text-sm text-white/40 font-[family-name:var(--font-outfit)] leading-[1.8]${
            i < seo.paragraphs.length - 1 ? " mb-3.5" : ""
          }`}
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}

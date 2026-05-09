import type { SEOContentBlock } from "@/lib/seo-configs";

interface SEOContentProps {
  seo: SEOContentBlock;
}

export default function SEOContent({ seo }: SEOContentProps) {
  return (
    <section className="p-9 px-8 rounded-[20px] bg-[var(--surface)] border border-[var(--border)]">
      <h2 className="text-[22px] font-bold text-[color:var(--text)] font-[family-name:var(--font-outfit)] mb-4 -tracking-[0.02em]">
        {seo.heading}
      </h2>
      {seo.paragraphs.map((paragraph, i) => (
        <p
          key={i}
          className={`text-sm text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.8]${
            i < seo.paragraphs.length - 1 ? " mb-3.5" : ""
          }`}
        >
          {paragraph}
        </p>
      ))}
    </section>
  );
}

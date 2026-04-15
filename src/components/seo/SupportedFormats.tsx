import type { SupportedFormatCard } from "@/lib/seo-configs";

interface SupportedFormatsProps {
  formats: SupportedFormatCard[];
}

export default function SupportedFormats({ formats }: SupportedFormatsProps) {
  const cols = Math.min(formats.length, 4);

  return (
    <section>
      <div className="supported-formats-grid grid grid-cols-2 gap-3 md:gap-4">
        {formats.map((f, i) => (
          <div
            key={f.ext}
            className="p-5 px-[18px] rounded-[14px] bg-white/[0.02] border border-white/[0.05] text-center transition-all duration-300 hover:border-white/15 animate-card-slide-in"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <p
              className="text-[20px] font-bold font-[family-name:var(--font-mono)] mb-1.5 -tracking-[0.02em]"
              style={{ color: f.color }}
            >
              .{f.ext.toLowerCase()}
            </p>
            <p className="text-xs text-white/45 font-[family-name:var(--font-outfit)] m-0 leading-snug">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
      <style
        dangerouslySetInnerHTML={{
          __html: `@media(min-width:768px){.supported-formats-grid{grid-template-columns:repeat(${cols},1fr)}}`,
        }}
      />
    </section>
  );
}

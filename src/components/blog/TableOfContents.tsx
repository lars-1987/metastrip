"use client";

export default function TableOfContents({
  sections,
  activeSection,
}: {
  sections: { heading: string }[];
  activeSection: number;
}) {
  return (
    <div className="sticky top-[100px] py-5">
      <div className="text-[10px] font-semibold text-white/35 font-[family-name:var(--font-mono)] tracking-[0.1em] uppercase mb-3.5">
        On this page
      </div>
      <div className="flex flex-col gap-1">
        {sections.map((section, i) => (
          <button
            key={i}
            onClick={() => {
              document
                .getElementById(`section-${i}`)
                ?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            className={`text-left px-3 py-1.5 rounded-lg border-l-2 transition-all duration-200 cursor-pointer ${
              activeSection === i
                ? "border-l-purple-light text-white/90"
                : "border-l-white/[0.05] text-white/40 hover:bg-white/[0.02]"
            }`}
            style={{ background: "none" }}
          >
            <span className="text-[13px] font-[family-name:var(--font-outfit)] font-medium">
              {section.heading}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

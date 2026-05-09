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
      <div className="text-[10px] font-semibold text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] tracking-[0.1em] uppercase mb-3.5">
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
            className="text-left px-3 py-1.5 rounded-lg border-l-2 transition-all duration-200 cursor-pointer"
            style={{
              background: "none",
              borderLeftColor:
                activeSection === i
                  ? "var(--accent-strong)"
                  : "var(--border)",
              color:
                activeSection === i
                  ? "var(--text)"
                  : "var(--text-muted)",
            }}
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

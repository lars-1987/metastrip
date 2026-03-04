export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Drop your file",
      description:
        "Drag and drop or click to select. Your file stays in your browser — nothing gets uploaded anywhere.",
      stroke: "#a78bfa",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      number: "2",
      title: "See what's hidden",
      description:
        "MetaStrip scans and displays every piece of metadata — GPS, device info, timestamps, AI tags, author data.",
      stroke: "#06b6d4",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      number: "3",
      title: "Download clean",
      description:
        "One click strips all metadata. Download your clean file instantly — no watermarks, no quality loss.",
      stroke: "#4ade80",
      icon: (
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <section>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {steps.map((step, i) => (
          <div
            key={step.number}
            className="relative p-8 px-6 rounded-[20px] bg-white/[0.02] border border-white/[0.05] hover:border-purple/[0.12] hover:-translate-y-0.5 transition-all duration-300 animate-card-slide-in"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <span className="absolute top-4 right-5 text-[72px] font-bold text-white/[0.03] leading-none font-[family-name:var(--font-outfit)]">
              {step.number}
            </span>

            <div
              className="w-[52px] h-[52px] rounded-[14px] bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5"
              style={{ color: step.stroke }}
            >
              <div style={{ stroke: step.stroke }}>{step.icon}</div>
            </div>

            <h3 className="text-[17px] font-semibold text-white/90 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-2">
              {step.title}
            </h3>

            <p className="text-sm text-white/40 font-[family-name:var(--font-outfit)] leading-[1.7] m-0">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

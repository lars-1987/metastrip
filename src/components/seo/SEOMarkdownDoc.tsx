"use client";

import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOMarkdownDocProps {
  config: SEOPageConfig;
}

export function SEOMarkdownDoc({ config }: SEOMarkdownDocProps) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0c0c0e] overflow-hidden shadow-2xl">
      {/* Title bar — looks like a file header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.03] border-b border-white/[0.06]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[12px] text-white/45 font-[family-name:var(--font-mono)]">
          📄 {config.slug}.md
        </span>
      </div>

      {/* Markdown content */}
      <div className="p-6 md:p-8 font-[family-name:var(--font-mono)] text-sm leading-relaxed">
        {/* H1 — page title */}
        <h2 className="text-xl md:text-2xl font-bold text-white/95 mb-1">
          <span className="text-purple-400 mr-2">#</span>
          {config.title}
        </h2>
        <p className="text-white/50 text-[13px] mb-6">{config.subtitle}</p>

        <hr className="border-white/[0.06] mb-6" />

        {/* Hero label as badge */}
        <div className="inline-block mb-6 px-3 py-1 rounded-md bg-emerald-500/[0.08] border border-emerald-500/[0.15]">
          <span className="text-[11px] text-emerald-400 tracking-wide">
            {config.heroLabel}
          </span>
        </div>

        {/* Explainer tabs as sections */}
        {config.explainerTabs.map((tab, i) => (
          <div key={tab.id} className="mb-6">
            <h3 className="text-base font-semibold text-white/90 mb-2">
              <span className="text-cyan mr-2">##</span>
              {tab.title}
            </h3>
            <p className="text-white/55 text-[13px] leading-[1.8] mb-3 pl-5">
              {tab.description}
            </p>
            <div className="pl-5 flex gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/[0.03] border border-white/[0.06]">
                <span className="text-[11px] text-white/40">{tab.example.label}:</span>
                <span className="text-[11px]" style={{ color: tab.color }}>
                  {tab.example.value}
                </span>
              </div>
            </div>
            <p className="text-[12px] text-red-400/60 pl-5">
              ⚠ {tab.risk}
            </p>
            {i < config.explainerTabs.length - 1 && (
              <hr className="border-white/[0.04] mt-6" />
            )}
          </div>
        ))}

        <hr className="border-white/[0.06] my-6" />

        {/* Metadata categories as a table */}
        <h3 className="text-base font-semibold text-white/90 mb-3">
          <span className="text-cyan mr-2">##</span>
          What&apos;s hidden in your files
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left py-2 text-white/50 font-medium">Category</th>
                <th className="text-left py-2 text-white/50 font-medium">Field</th>
                <th className="text-left py-2 text-white/50 font-medium">Example value</th>
              </tr>
            </thead>
            <tbody>
              {config.metadataCategories.map((cat) =>
                cat.fields.map((field, j) => (
                  <tr key={`${cat.category}-${j}`} className="border-b border-white/[0.03]">
                    {j === 0 ? (
                      <td
                        className="py-1.5 font-semibold align-top"
                        style={{ color: cat.color }}
                        rowSpan={cat.fields.length}
                      >
                        {cat.label}
                      </td>
                    ) : null}
                    <td className="py-1.5 text-white/65">{field.label}</td>
                    <td className="py-1.5 text-white/45">{field.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <hr className="border-white/[0.06] my-6" />

        {/* Supported formats */}
        <h3 className="text-base font-semibold text-white/90 mb-3">
          <span className="text-cyan mr-2">##</span>
          Supported formats
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {config.supportedFormats.map((fmt) => (
            <div
              key={fmt.ext}
              className="px-3 py-1.5 rounded-md border border-white/[0.06] bg-white/[0.02]"
            >
              <span className="font-semibold" style={{ color: fmt.color }}>
                {fmt.ext}
              </span>
              <span className="text-white/40 text-[11px] ml-2">{fmt.desc}</span>
            </div>
          ))}
        </div>

        <hr className="border-white/[0.06] my-6" />

        {/* SEO content block */}
        <h3 className="text-base font-semibold text-white/90 mb-3">
          <span className="text-cyan mr-2">##</span>
          {config.seoContent.heading}
        </h3>
        <div className="space-y-3 pl-5">
          {config.seoContent.paragraphs.map((p, i) => (
            <p key={i} className="text-white/55 text-[13px] leading-[1.8]">
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <hr className="border-white/[0.06] my-6" />
        <div className="text-[11px] text-white/30 text-center">
          metastrip v2.0 — privacy-first metadata removal — all processing happens in your browser
        </div>
      </div>
    </div>
  );
}

"use client";

import type { SEOPageConfig } from "@/lib/seo-configs";

interface SEOMarkdownDocProps {
  config: SEOPageConfig;
}

export function SEOMarkdownDoc({ config }: SEOMarkdownDocProps) {
  return (
    <div className="rounded-xl border border-[var(--border-strong)] bg-[#0c0c0e] overflow-hidden shadow-2xl">
      {/* Title bar — looks like a file header */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface)] border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[12px] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)]">
          📄 {config.slug}.md
        </span>
      </div>

      {/* Markdown content */}
      <div className="p-6 md:p-8 font-[family-name:var(--font-mono)] text-sm leading-relaxed">
        {/* H1 — page title */}
        <h2 className="text-xl md:text-2xl font-bold text-[color:var(--text)] mb-1">
          <span className="text-[color:var(--accent-strong)] mr-2">#</span>
          {config.title}
        </h2>
        <p className="text-[color:var(--text-secondary)] text-[13px] mb-6">{config.subtitle}</p>

        <hr className="border-[var(--border)] mb-6" />

        {/* Hero label as badge */}
        <div className="inline-block mb-6 px-3 py-1 rounded-md bg-[color:color-mix(in_srgb,var(--accent-2)_18%,transparent)] border border-[color:color-mix(in_srgb,var(--accent-2)_30%,transparent)]">
          <span className="text-[11px] text-[color:var(--accent-2)] tracking-wide">
            {config.heroLabel}
          </span>
        </div>

        {/* Explainer tabs as sections */}
        {config.explainerTabs.map((tab, i) => (
          <div key={tab.id} className="mb-6">
            <h3 className="text-base font-semibold text-[color:var(--text)] mb-2">
              <span className="text-[color:var(--accent-2)] mr-2">##</span>
              {tab.title}
            </h3>
            <p className="text-[color:var(--text-secondary)] text-[13px] leading-[1.8] mb-3 pl-5">
              {tab.description}
            </p>
            <div className="pl-5 flex gap-2 flex-wrap mb-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--surface)] border border-[var(--border)]">
                <span className="text-[11px] text-[color:var(--text-muted)]">{tab.example.label}:</span>
                <span className="text-[11px]" style={{ color: tab.color }}>
                  {tab.example.value}
                </span>
              </div>
            </div>
            <p className="text-[12px] text-[color:var(--accent-strong)] pl-5">
              ⚠ {tab.risk}
            </p>
            {i < config.explainerTabs.length - 1 && (
              <hr className="border-[var(--border)] mt-6" />
            )}
          </div>
        ))}

        <hr className="border-[var(--border)] my-6" />

        {/* Metadata categories as a table */}
        <h3 className="text-base font-semibold text-[color:var(--text)] mb-3">
          <span className="text-[color:var(--accent-2)] mr-2">##</span>
          What&apos;s hidden in your files
        </h3>
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="border-b border-[var(--border-strong)]">
                <th className="text-left py-2 text-[color:var(--text-secondary)] font-medium">Category</th>
                <th className="text-left py-2 text-[color:var(--text-secondary)] font-medium">Field</th>
                <th className="text-left py-2 text-[color:var(--text-secondary)] font-medium">Example value</th>
              </tr>
            </thead>
            <tbody>
              {config.metadataCategories.map((cat) =>
                cat.fields.map((field, j) => (
                  <tr key={`${cat.category}-${j}`} className="border-b border-[var(--border)]">
                    {j === 0 ? (
                      <td
                        className="py-1.5 font-semibold align-top"
                        style={{ color: cat.color }}
                        rowSpan={cat.fields.length}
                      >
                        {cat.label}
                      </td>
                    ) : null}
                    <td className="py-1.5 text-[color:var(--text-secondary)]">{field.label}</td>
                    <td className="py-1.5 text-[color:var(--text-muted)]">{field.value}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <hr className="border-[var(--border)] my-6" />

        {/* Supported formats */}
        <h3 className="text-base font-semibold text-[color:var(--text)] mb-3">
          <span className="text-[color:var(--accent-2)] mr-2">##</span>
          Supported formats
        </h3>
        <div className="flex flex-wrap gap-2 mb-6">
          {config.supportedFormats.map((fmt) => (
            <div
              key={fmt.ext}
              className="px-3 py-1.5 rounded-md border border-[var(--border)] bg-[var(--surface)]"
            >
              <span className="font-semibold" style={{ color: fmt.color }}>
                {fmt.ext}
              </span>
              <span className="text-[color:var(--text-muted)] text-[11px] ml-2">{fmt.desc}</span>
            </div>
          ))}
        </div>

        <hr className="border-[var(--border)] my-6" />

        {/* SEO content block */}
        <h3 className="text-base font-semibold text-[color:var(--text)] mb-3">
          <span className="text-[color:var(--accent-2)] mr-2">##</span>
          {config.seoContent.heading}
        </h3>
        <div className="space-y-3 pl-5">
          {config.seoContent.paragraphs.map((p, i) => (
            <p key={i} className="text-[color:var(--text-secondary)] text-[13px] leading-[1.8]">
              {p}
            </p>
          ))}
        </div>

        {/* Footer */}
        <hr className="border-[var(--border)] my-6" />
        <div className="text-[11px] text-[color:var(--text-muted)] text-center">
          metastrip v2.0 — privacy-first metadata removal — all processing happens in your browser
        </div>
      </div>
    </div>
  );
}

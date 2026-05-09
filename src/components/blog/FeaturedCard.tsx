import Link from "next/link";
import type { BlogArticle } from "@/lib/blog-data";
import { getCategoryLabel } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

export default function FeaturedCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group relative grid grid-cols-1 md:grid-cols-2 gap-0 rounded-3xl overflow-hidden transition-all duration-400 hover:-translate-y-[3px] cursor-pointer no-underline"
      style={{
        background: "var(--card-inverse-bg)",
        color: "var(--card-inverse-text)",
        boxShadow:
          "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
      }}
    >
      {/* Cover art — solid dark with cream icon, matches site visual language */}
      <div
        className="relative min-h-[280px] flex items-center justify-center overflow-hidden"
        style={{ background: "var(--accent-strong)" }}
      >
        <span
          className="opacity-50 transition-all duration-400 group-hover:scale-110"
          style={{ color: "var(--card-inverse-text)" }}
        >
          <Icon name={article.coverIcon} size={88} weight="duotone" />
        </span>
        {/* Featured badge */}
        <div
          className="absolute top-4 left-4 px-3 py-1 rounded-lg"
          style={{ background: "var(--card-inverse-bg)" }}
        >
          <span
            className="text-[10px] font-bold uppercase tracking-[0.14em] font-[family-name:var(--font-mono)]"
            style={{ color: "var(--accent-strong)" }}
          >
            Featured
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-9 px-8">
        <div className="flex items-center gap-3 mb-4">
          <span
            className="text-[11px] px-2.5 py-[3px] rounded-md font-[family-name:var(--font-mono)] font-bold uppercase tracking-[0.1em]"
            style={{
              background: "color-mix(in srgb, var(--accent-strong) 18%, transparent)",
              color: "var(--accent-strong)",
            }}
          >
            {getCategoryLabel(article.category)}
          </span>
          <span
            className="text-xs font-[family-name:var(--font-mono)]"
            style={{ color: "var(--card-inverse-muted)" }}
          >
            {article.readTime}
          </span>
        </div>
        <h2
          className="font-bold leading-[1.2] tracking-[-0.02em] mb-3"
          style={{ color: "var(--card-inverse-text)", fontSize: 26 }}
        >
          {article.title}
        </h2>
        <p
          className="text-[15px] leading-[1.65] mb-5"
          style={{ color: "var(--card-inverse-muted)" }}
        >
          {article.excerpt}
        </p>
        <div className="flex items-center gap-3">
          <span
            className="text-[14px] font-semibold"
            style={{ color: "var(--accent-strong)" }}
          >
            Read article →
          </span>
          <span
            className="text-xs font-[family-name:var(--font-mono)]"
            style={{ color: "var(--card-inverse-muted)" }}
          >
            {article.date}
          </span>
        </div>
      </div>
    </Link>
  );
}

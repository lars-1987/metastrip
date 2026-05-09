import Link from "next/link";
import type { BlogArticle } from "@/lib/blog-data";
import { getCategoryLabel } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

export default function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-[3px] cursor-pointer no-underline"
      style={{
        background: "var(--surface)",
        boxShadow:
          "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
      }}
    >
      {/* Soft cover — warm tint, terracotta icon. Lighter visual weight than dark covers. */}
      <div
        className="h-[120px] flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "color-mix(in srgb, var(--accent-strong) 10%, var(--surface))",
        }}
      >
        <span
          className="transition-transform duration-400 group-hover:scale-[1.15]"
          style={{ color: "var(--accent-strong)" }}
        >
          <Icon name={article.coverIcon} size={44} weight="duotone" />
        </span>
      </div>

      {/* Content */}
      <div className="p-5 lg:p-6">
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-[10px] px-2 py-[3px] rounded-md font-[family-name:var(--font-mono)] font-bold uppercase tracking-[0.1em]"
            style={{
              background:
                "color-mix(in srgb, var(--accent-strong) 14%, transparent)",
              color: "var(--accent-strong)",
            }}
          >
            {getCategoryLabel(article.category)}
          </span>
          <span
            className="text-[11px] font-[family-name:var(--font-mono)]"
            style={{ color: "var(--text-muted)" }}
          >
            {article.readTime}
          </span>
        </div>
        <h3
          className="font-bold leading-[1.3] tracking-[-0.01em] mb-2.5"
          style={{ color: "var(--text)", fontSize: 17 }}
        >
          {article.title}
        </h3>
        <p
          className="text-[13px] leading-[1.6] mb-4 line-clamp-3"
          style={{ color: "var(--text-secondary)" }}
        >
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span
            className="text-[12px] font-semibold"
            style={{ color: "var(--accent-strong)" }}
          >
            Read →
          </span>
          <span
            className="text-[11px] font-[family-name:var(--font-mono)]"
            style={{ color: "var(--text-muted)" }}
          >
            {article.date}
          </span>
        </div>
      </div>
    </Link>
  );
}

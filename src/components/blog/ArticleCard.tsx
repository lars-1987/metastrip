import Link from "next/link";
import type { BlogArticle } from "@/lib/blog-data";
import { getCategoryLabel } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

export default function ArticleCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block rounded-[20px] overflow-hidden bg-white/[0.02] border border-white/[0.05] transition-all duration-300 hover:border-purple/[0.15] hover:-translate-y-[3px] animate-card-slide-in cursor-pointer"
    >
      {/* Mini cover */}
      <div
        className="h-[140px] flex items-center justify-center relative overflow-hidden"
        style={{ background: article.coverGradient }}
      >
        <span className="opacity-25 transition-transform duration-400 group-hover:scale-[1.15] group-hover:rotate-[3deg]">
          <Icon name={article.coverIcon} size={48} weight="duotone" className="text-white" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/60" />
      </div>

      {/* Content */}
      <div className="p-[20px_22px_24px]">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="text-[10px] px-2 py-[2px] rounded-[5px] bg-purple/[0.08] text-purple-light font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.05em]">
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-[11px] text-white/30 font-[family-name:var(--font-mono)]">
            {article.readTime}
          </span>
        </div>
        <h3 className="text-[17px] font-semibold text-white/95 font-[family-name:var(--font-outfit)] leading-[1.35] tracking-[-0.01em] mb-2">
          {article.title}
        </h3>
        <p className="text-[13px] text-white/45 font-[family-name:var(--font-outfit)] leading-[1.6] mb-3.5 line-clamp-3">
          {article.excerpt}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-purple-light font-[family-name:var(--font-outfit)] font-semibold">
            Read &rarr;
          </span>
          <span className="text-[11px] text-white/25 font-[family-name:var(--font-mono)]">
            {article.date}
          </span>
        </div>
      </div>
    </Link>
  );
}

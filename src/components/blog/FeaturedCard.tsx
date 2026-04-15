import Link from "next/link";
import type { BlogArticle } from "@/lib/blog-data";
import { getCategoryLabel } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

export default function FeaturedCard({ article }: { article: BlogArticle }) {
  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group relative grid grid-cols-1 md:grid-cols-2 gap-0 rounded-[24px] overflow-hidden bg-white/[0.02] border border-purple/[0.12] transition-all duration-400 hover:-translate-y-[3px] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] animate-card-slide-in cursor-pointer"
    >
      {/* Cover art */}
      <div
        className="relative min-h-[280px] flex items-center justify-center overflow-hidden"
        style={{ background: article.coverGradient }}
      >
        <span className="opacity-30 blur-[1px] transition-all duration-400 group-hover:scale-110 group-hover:rotate-[5deg]">
          <Icon name={article.coverIcon} size={72} weight="duotone" className="text-white" />
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-background/80" />
        {/* Featured badge */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-lg bg-black/40 backdrop-blur-sm">
          <span className="text-[10px] font-semibold text-[#fbbf24] font-[family-name:var(--font-mono)] tracking-[0.08em]">
            FEATURED
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex flex-col justify-center p-9 px-8">
        <div className="flex items-center gap-2.5 mb-3.5">
          <span className="text-[11px] px-2.5 py-[3px] rounded-md bg-purple/10 text-purple-light font-[family-name:var(--font-mono)] font-semibold uppercase tracking-[0.05em]">
            {getCategoryLabel(article.category)}
          </span>
          <span className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            {article.readTime}
          </span>
        </div>
        <h2 className="text-2xl font-bold text-white/95 font-[family-name:var(--font-outfit)] leading-[1.3] tracking-[-0.02em] mb-3">
          {article.title}
        </h2>
        <p className="text-sm text-white/50 font-[family-name:var(--font-outfit)] leading-[1.7] mb-4">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-3">
          <span className="text-[13px] text-purple-light font-[family-name:var(--font-outfit)] font-semibold">
            Read article &rarr;
          </span>
          <span className="text-xs text-white/30 font-[family-name:var(--font-mono)]">
            {article.date}
          </span>
        </div>
      </div>
    </Link>
  );
}

import Link from "next/link";
import { getRelatedArticles, getCategoryLabel } from "@/lib/blog-data";
import { Icon } from "@/components/shared/Icon";

export default function RelatedPosts({ currentId }: { currentId: string }) {
  const related = getRelatedArticles(currentId);

  return (
    <div className="mt-16">
      <h3 className="text-xl font-bold text-white/85 font-[family-name:var(--font-outfit)] tracking-[-0.02em] mb-5">
        Keep reading
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {related.map((article) => (
          <Link
            key={article.id}
            href={`/blog/${article.slug}`}
            className="group block p-5 rounded-2xl bg-white/[0.02] border border-white/[0.05] transition-all duration-300 hover:border-purple/[0.15] hover:-translate-y-0.5 cursor-pointer"
          >
            <div className="mb-2.5"><Icon name={article.coverIcon} size={28} weight="duotone" className="text-white/80" /></div>
            <span className="text-[10px] px-2 py-[2px] rounded-[5px] bg-purple/[0.08] text-purple-light font-[family-name:var(--font-mono)] font-semibold uppercase">
              {getCategoryLabel(article.category)}
            </span>
            <h4 className="text-[15px] font-semibold text-white/80 font-[family-name:var(--font-outfit)] leading-[1.35] tracking-[-0.01em] mt-2.5">
              {article.title}
            </h4>
            <span className="block mt-2 text-[11px] text-white/20 font-[family-name:var(--font-mono)]">
              {article.date} &middot; {article.readTime}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { ARTICLES, CATEGORIES, type BlogArticle } from "@/lib/blog-data";

function ArticleView({ article, onBack }: { article: BlogArticle; onBack: () => void }) {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Prompt */}
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-3">
        <div className="font-[family-name:var(--font-mono)] text-sm text-white/55">
          <span className="text-purple-400 mr-1.5">❯</span>
          <span>cat /var/blog/{article.slug}.md</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6">
        {/* Back */}
        <button
          onClick={onBack}
          className="mb-4 text-xs text-white/40 font-[family-name:var(--font-mono)] bg-transparent border-none cursor-pointer hover:text-white/50 transition-colors p-0"
        >
          ← cd /var/blog
        </button>

        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/[0.06]">
          <div className="text-xl font-bold text-white/90 font-[family-name:var(--font-mono)] leading-tight mb-2">
            # {article.title}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs font-[family-name:var(--font-mono)]">
            <span className="text-white/35">{article.date}</span>
            <span className="text-white/10">|</span>
            <span className="text-white/35">{article.readTime}</span>
            <span className="text-white/10">|</span>
            <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400/70 font-bold">
              {article.category}
            </span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {article.tags.map((tag) => (
            <span key={tag} className="text-xs px-2 py-0.5 rounded bg-white/[0.04] text-white/40 font-[family-name:var(--font-mono)]">
              #{tag}
            </span>
          ))}
        </div>

        {/* Article body */}
        {article.content ? (
          <>
            {/* Intro */}
            <div className="mb-6 text-sm text-white/55 font-[family-name:var(--font-mono)] leading-[1.9]">
              {article.content.intro.split("\n\n").map((p, i) => (
                <p key={i} className="mb-3">{p}</p>
              ))}
            </div>

            {/* Sections */}
            {article.content.sections.map((section, i) => (
              <div key={i} className="mb-6">
                <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-white/60 mb-3">
                  ## {section.heading}
                </div>
                <div className="pl-4 border-l border-white/[0.06] text-sm text-white/50 font-[family-name:var(--font-mono)] leading-[1.9]">
                  {section.body.split("\n\n").map((p, j) => {
                    // Handle **bold** in text
                    const parts = p.split(/(\*\*[^*]+\*\*)/g);
                    return (
                      <p key={j} className="mb-3">
                        {parts.map((part, k) =>
                          part.startsWith("**") && part.endsWith("**") ? (
                            <span key={k} className="text-white/65 font-bold">
                              {part.slice(2, -2)}
                            </span>
                          ) : (
                            <span key={k}>{part}</span>
                          )
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="text-sm text-white/40 font-[family-name:var(--font-mono)]">
            {article.excerpt}
          </div>
        )}

        {/* EOF */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-xs text-white/25 font-[family-name:var(--font-mono)]">
            ─── EOF ───
          </div>
        </div>
      </div>
    </div>
  );
}

export function BlogTab() {
  const [selectedArticle, setSelectedArticle] = useState<BlogArticle | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");

  if (selectedArticle) {
    return <ArticleView article={selectedArticle} onBack={() => setSelectedArticle(null)} />;
  }

  const filtered = activeCategory === "all"
    ? ARTICLES
    : ARTICLES.filter((a) => a.category === activeCategory);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Prompt */}
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-3">
        <div className="font-[family-name:var(--font-mono)] text-sm text-white/55">
          <span className="text-purple-400 mr-1.5">❯</span>
          <span>ls /var/blog/ {activeCategory !== "all" ? `--filter=${activeCategory}` : ""}</span>
        </div>
      </div>

      {/* Category filters */}
      <div className="shrink-0 px-4 md:px-6 pb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-2.5 py-1 rounded-md text-xs font-[family-name:var(--font-mono)] font-medium border-none cursor-pointer transition-colors duration-150 ${
              activeCategory === cat.id
                ? "bg-purple-500/20 text-purple-400"
                : "bg-white/[0.04] text-white/25 hover:text-white/40"
            }`}
          >
            {cat.label.toLowerCase()}
          </button>
        ))}
      </div>

      {/* Article list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6">
        <div className="text-xs text-white/30 font-[family-name:var(--font-mono)] mb-3">
          {filtered.length} {filtered.length === 1 ? "file" : "files"} found
        </div>

        {filtered.map((article, i) => (
          <button
            key={article.id}
            onClick={() => setSelectedArticle(article)}
            className="w-full text-left mb-2 p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-purple-500/20 hover:bg-white/[0.03] transition-all duration-150 cursor-pointer block"
          >
            <div className="flex items-start gap-3">
              <div className="text-xs text-white/30 font-[family-name:var(--font-mono)] mt-0.5 shrink-0 w-5 text-right">
                {String(i + 1).padStart(2, "0")}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm text-white/70 font-[family-name:var(--font-mono)] font-bold mb-1 truncate">
                  {article.title}
                </div>
                <div className="text-xs text-white/40 font-[family-name:var(--font-mono)] leading-relaxed line-clamp-2 mb-2">
                  {article.excerpt}
                </div>
                <div className="flex items-center gap-2 text-xs font-[family-name:var(--font-mono)]">
                  <span className="text-white/30">{article.date}</span>
                  <span className="text-white/10">·</span>
                  <span className="text-white/30">{article.readTime}</span>
                  <span className="text-white/10">·</span>
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400/50 font-medium">
                    {article.category}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import FeaturedCard from "@/components/blog/FeaturedCard";
import ArticleCard from "@/components/blog/ArticleCard";
import { CATEGORIES, ARTICLES, getFeaturedArticle } from "@/lib/blog-data";

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState("all");

  const featured = getFeaturedArticle();
  const filtered = ARTICLES.filter(
    (a) =>
      !a.featured &&
      (activeCategory === "all" || a.category === activeCategory)
  );

  return (
    <>
      <AnimatedBackground />
      <Nav />

      <div className="relative z-[1] max-w-[1000px] mx-auto px-6 pt-[110px] pb-20">
        {/* Hero */}
        <div className="text-center mb-12 animate-hero-fade-in">
          <div className="inline-block mb-4 px-4 py-[5px] rounded-full bg-purple/[0.08] border border-purple/[0.15]">
            <span className="text-xs text-purple-light font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              THE METASTRIP BLOG
            </span>
          </div>
          <h1
            className="text-[44px] font-extrabold leading-[1.15] tracking-[-0.04em] font-[family-name:var(--font-outfit)] mb-3 bg-clip-text text-transparent animate-gradient-shift"
            style={{
              backgroundImage:
                "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
            }}
          >
            Privacy, metadata &<br />
            digital self-defense
          </h1>
          <p className="text-base text-white/50 max-w-[460px] mx-auto font-[family-name:var(--font-outfit)] leading-[1.7]">
            Practical guides on protecting your identity in the files you share
            every day.
          </p>
        </div>

        {/* Featured Card */}
        {featured && <FeaturedCard article={featured} />}

        {/* Category Filter */}
        <div className="flex gap-1.5 mt-12 mb-7 p-1 rounded-[14px] bg-white/[0.02] border border-white/[0.05] animate-card-slide-in">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-1 py-[9px] px-3.5 rounded-[10px] border-none cursor-pointer transition-all duration-250 ${
                activeCategory === cat.id
                  ? "bg-white/[0.05] text-white/95"
                  : "bg-transparent text-white/45 hover:bg-white/[0.03]"
              }`}
            >
              <span className="text-[13px] font-medium font-[family-name:var(--font-outfit)]">
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Article Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[18px]">
          {filtered.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>

      <Footer />
    </>
  );
}

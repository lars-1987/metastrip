"use client";

import { useState } from "react";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import FeaturedCard from "@/components/blog/FeaturedCard";
import ArticleCard from "@/components/blog/ArticleCard";
import { CATEGORIES, ARTICLES, getFeaturedArticle } from "@/lib/blog-data";
import { KOFI_URL } from "@/lib/constants";

export default function BlogIndex() {
  const [activeCategory, setActiveCategory] = useState("all");

  const featured = getFeaturedArticle();
  // Exclude only the single article shown in the featured card — NOT every
  // post with featured:true. Multiple posts can carry featured:true (it also
  // bumps sitemap priority); all of them except the one in the featured card
  // must still appear in the grid below.
  const filtered = ARTICLES.filter(
    (a) =>
      a.id !== featured?.id &&
      (activeCategory === "all" || a.category === activeCategory)
  );

  return (
    <>
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-[1100px] mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-24">
          {/* Hero */}
          <div className="text-center mb-16">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              The MetaStrip blog
            </div>
            <h1
              className="font-extrabold leading-[1.05] tracking-[-0.04em] mb-5"
              style={{
                color: "var(--text)",
                fontSize: "clamp(40px, 5.5vw, 60px)",
              }}
            >
              Privacy, metadata &amp;<br />
              digital self-defense.
            </h1>
            <p
              className="mx-auto leading-[1.6] font-medium"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(17px, 1.6vw, 19px)",
                maxWidth: 540,
              }}
            >
              Practical guides on protecting your identity in the files you share
              every day.
            </p>
          </div>

          {/* Featured Card */}
          {featured && <FeaturedCard article={featured} />}

          {/* Category Filter */}
          <div
            className="flex gap-1.5 mt-14 mb-8 p-1 rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="flex-1 py-2.5 px-3.5 rounded-xl transition-all"
                style={{
                  background:
                    activeCategory === cat.id
                      ? "var(--accent)"
                      : "transparent",
                  color:
                    activeCategory === cat.id
                      ? "var(--accent-fg)"
                      : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <span className="text-[13px] font-semibold">{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Article Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>

          {/* Quiet support nudge — not begging, just a soft "if it helped" line */}
          <div
            className="mt-20 lg:mt-24 max-w-xl mx-auto text-center"
          >
            <p
              className="leading-[1.7]"
              style={{
                color: "var(--text-secondary)",
                fontSize: 15,
              }}
            >
              MetaStrip is free, no ads, no accounts, no tracking. If
              an article helped you understand what your files were leaking,
              or you used the tool to fix it, I&apos;d genuinely
              appreciate a coffee.{" "}
              <a
                href={KOFI_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 font-semibold"
                style={{ color: "var(--accent-strong)" }}
              >
                Ko-fi link
              </a>
              . Never required.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

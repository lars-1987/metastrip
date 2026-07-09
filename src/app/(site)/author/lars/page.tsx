import { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { ARTICLES, getCategoryLabel } from "@/lib/blog-data";
import { AUTHOR, AUTHOR_ID } from "@/lib/author";

export const metadata: Metadata = {
  title: `${AUTHOR.name}, MetaStrip`,
  description: AUTHOR.bio,
  alternates: { canonical: AUTHOR.url },
  openGraph: {
    title: `${AUTHOR.name}, MetaStrip`,
    description: AUTHOR.bio,
    url: AUTHOR.url,
    siteName: "MetaStrip",
    type: "profile",
  },
};

export default function AuthorPage() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": AUTHOR_ID,
    name: AUTHOR.name,
    url: AUTHOR.url,
    jobTitle: AUTHOR.jobTitle,
    description: AUTHOR.bio,
    image: AUTHOR.imageUrl,
    sameAs: AUTHOR.sameAs,
  };
  const profileLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: AUTHOR.url,
    mainEntity: { "@id": AUTHOR_ID },
  };

  return (
    <>
      {[personLd, profileLd].map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-[760px] mx-auto px-6 pt-16 lg:pt-20 pb-24">
          <Link
            href="/blog"
            className="group mb-8 inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--card-elevated)] px-5 py-2 text-[14px] font-medium text-[var(--text)] no-underline transition-colors duration-200 hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
          >
            <span aria-hidden className="inline-block transition-transform duration-300 ease-out group-hover:-translate-x-1">&larr;</span>
            Blog
          </Link>

          {/* Author hero */}
          <div className="flex items-center gap-5 mb-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={AUTHOR.image}
              alt={AUTHOR.name}
              width={72}
              height={72}
              className="h-[72px] w-[72px] shrink-0 rounded-full object-cover"
              style={{ boxShadow: "0 0 0 1px var(--border)" }}
            />
            <div>
              <h1 className="text-[30px] font-extrabold leading-[1.15] tracking-[-0.03em] font-[family-name:var(--font-outfit)] text-[color:var(--text)]">
                {AUTHOR.name}
              </h1>
              <p className="text-[14px] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] mt-1">
                {AUTHOR.jobTitle}
              </p>
            </div>
          </div>

          <p className="text-[17px] leading-relaxed text-[color:var(--text-secondary)] max-w-[600px] mb-5">
            {AUTHOR.bio}
          </p>

          <div className="flex items-center gap-4 mb-14">
            {AUTHOR.sameAs.map((href) => {
              const label = href.includes("github") ? "GitHub" : "X";
              return (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer me"
                  className="text-[14px] font-medium text-[color:var(--accent-strong)] no-underline hover:underline underline-offset-2"
                >
                  {label}
                </a>
              );
            })}
          </div>

          {/* Articles */}
          <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] mb-5">
            Articles by {AUTHOR.firstName}
          </h2>
          <ul className="flex flex-col">
            {ARTICLES.map((article) => (
              <li key={article.id}>
                <Link
                  href={`/blog/${article.slug}`}
                  className="group flex flex-col gap-1 border-t border-[color:var(--border)] py-4 no-underline last:border-b"
                >
                  <div className="flex items-center gap-2.5 text-[11px] text-[color:var(--text-muted)] font-[family-name:var(--font-mono)] uppercase tracking-[0.05em]">
                    <span className="text-[color:var(--accent-strong)]">{getCategoryLabel(article.category)}</span>
                    <span aria-hidden>&middot;</span>
                    <span>{article.date}</span>
                  </div>
                  <span className="text-[17px] font-semibold text-[color:var(--text)] font-[family-name:var(--font-outfit)] transition-colors group-hover:text-[color:var(--accent-strong)]">
                    {article.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}

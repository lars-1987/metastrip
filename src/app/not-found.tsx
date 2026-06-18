import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { generalSans, geistMono } from "./v3-fonts";

export const metadata: Metadata = {
  title: "Page Not Found, MetaStrip",
  description:
    "The page you're looking for doesn't exist. Try the homepage or one of MetaStrip's metadata removal tools.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className={`v3-root ${generalSans.variable} ${geistMono.variable}`}>
      <TopNav />
      <main
        className="relative z-10"
        style={{ background: "var(--bg)" }}
      >
        <div className="min-h-[80vh] flex items-center justify-center px-6 py-24">
          <div className="max-w-xl text-center">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              Error 404
            </div>
            <h1
              className="font-extrabold leading-[1.05] tracking-[-0.03em] mb-5"
              style={{
                color: "var(--text)",
                fontSize: "clamp(40px, 5.5vw, 60px)",
              }}
            >
              Page not found.
            </h1>
            <p
              className="leading-[1.6] mb-10"
              style={{ color: "var(--text-secondary)", fontSize: 17 }}
            >
              The page you&apos;re looking for doesn&apos;t exist; or it was stripped
              of its metadata so thoroughly we can&apos;t find it either.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/"
                className="inline-flex items-center px-7 py-3 rounded-xl text-[14px] font-semibold no-underline transition-all hover:-translate-y-px"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                Open MetaStrip →
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center px-7 py-3 rounded-xl text-[14px] font-semibold no-underline transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--text-secondary)",
                  border: "1px solid var(--border-strong)",
                }}
              >
                Read the blog
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

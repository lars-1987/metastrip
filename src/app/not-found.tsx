import type { Metadata } from "next";
import Link from "next/link";
import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Page Not Found — MetaStrip",
  description:
    "The page you're looking for doesn't exist. Try the homepage or one of MetaStrip's metadata removal tools.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <AnimatedBackground />
      <main className="relative z-[1] min-h-screen flex items-center justify-center px-6 py-24">
        <div className="max-w-xl text-center">
          <div className="text-[14px] font-[family-name:var(--font-mono)] text-white/35 mb-3 tracking-wider">
            ERROR 404
          </div>
          <h1 className="text-[44px] md:text-[56px] font-extrabold leading-[1.1] tracking-[-0.03em] text-white/95 font-[family-name:var(--font-outfit)] mb-5">
            Page not found.
          </h1>
          <p className="text-[17px] text-white/60 leading-[1.6] font-[family-name:var(--font-outfit)] mb-10">
            The page you&apos;re looking for doesn&apos;t exist — or it was stripped
            of its metadata so thoroughly we can&apos;t find it either.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-block px-7 py-3 rounded-xl text-white text-[14px] font-semibold no-underline transition-all duration-200 hover:-translate-y-px font-[family-name:var(--font-outfit)]"
              style={{ background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)" }}
            >
              Open MetaStrip →
            </Link>
            <Link
              href="/blog"
              className="inline-block px-7 py-3 rounded-xl text-white/80 text-[14px] font-semibold no-underline border border-white/15 bg-white/[0.03] hover:bg-white/[0.06] transition-colors font-[family-name:var(--font-outfit)]"
            >
              Read the blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

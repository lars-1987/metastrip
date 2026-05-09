import Link from "next/link";
import { ARTICLES } from "@/lib/blog-data";

const TOOLS = [
  { label: "Remove metadata from photos", href: "/remove-metadata-from-photos" },
  { label: "Strip EXIF data", href: "/strip-exif-data" },
  { label: "Remove GPS from photos", href: "/remove-gps-location-from-photos" },
  { label: "Remove author from PDF", href: "/remove-author-from-pdf" },
  { label: "Strip Word document metadata", href: "/strip-metadata-from-word-document" },
  { label: "Remove AI metadata (C2PA)", href: "/remove-ai-metadata" },
  { label: "Remove metadata before sharing", href: "/remove-metadata-before-sharing" },
];

const SITE = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Pricing", href: "/pricing" },
  { label: "Privacy & Terms", href: "/privacy" },
];

export function Footer() {
  return (
    <footer className="relative z-[1] mt-16 px-6 pt-12 pb-10 border-t border-white/[0.06] bg-black/30 backdrop-blur-sm">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
        {/* Tools */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55 mb-4 font-[family-name:var(--font-outfit)]">
            Tools
          </h3>
          <ul className="space-y-2">
            {TOOLS.map((t) => (
              <li key={t.href}>
                <Link
                  href={t.href}
                  className="text-[13px] text-white/55 hover:text-white/85 transition-colors no-underline font-[family-name:var(--font-outfit)]"
                >
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Articles */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55 mb-4 font-[family-name:var(--font-outfit)]">
            Articles
          </h3>
          <ul className="space-y-2">
            {ARTICLES.map((a) => (
              <li key={a.slug}>
                <Link
                  href={`/blog/${a.slug}`}
                  className="text-[13px] text-white/55 hover:text-white/85 transition-colors no-underline font-[family-name:var(--font-outfit)] line-clamp-1"
                >
                  {a.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Site */}
        <div>
          <h3 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-white/55 mb-4 font-[family-name:var(--font-outfit)]">
            Site
          </h3>
          <ul className="space-y-2">
            {SITE.map((s) => (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className="text-[13px] text-white/55 hover:text-white/85 transition-colors no-underline font-[family-name:var(--font-outfit)]"
                >
                  {s.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href="https://github.com/lars-1987/metastrip"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[13px] text-white/55 hover:text-white/85 transition-colors no-underline font-[family-name:var(--font-outfit)]"
              >
                GitHub
              </a>
            </li>
            <li>
              <a
                href="mailto:hello@metastrip.app"
                className="text-[13px] text-white/55 hover:text-white/85 transition-colors no-underline font-[family-name:var(--font-outfit)]"
              >
                hello@metastrip.app
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="max-w-6xl mx-auto pt-6 border-t border-white/[0.05] text-center">
        <p className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
          MetaStrip — your files never leave your device. Built in Melbourne.
        </p>
      </div>
    </footer>
  );
}

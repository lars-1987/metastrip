import Link from "next/link";

const links = [
  { label: "Privacy", href: "/privacy" },
{ label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export function Footer() {
  return (
    <footer className="relative z-[1] text-center py-10 px-6 border-t border-white/[0.04]">
      <div className="flex justify-center gap-8 mb-4">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-[13px] text-white/40 font-[family-name:var(--font-outfit)] hover:text-white/70 transition-colors duration-200 no-underline"
          >
            {link.label}
          </Link>
        ))}
      </div>
      <p className="text-xs text-white/25 font-[family-name:var(--font-mono)]">
        MetaStrip — Your files never leave your device. Built in Melbourne.
      </p>
    </footer>
  );
}

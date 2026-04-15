import Link from "next/link";

export default function InlineCTA() {
  return (
    <div className="my-9 p-6 px-7 rounded-2xl bg-gradient-to-br from-purple/[0.06] to-cyan/[0.03] border border-purple/[0.1] flex flex-col sm:flex-row items-center justify-between gap-5">
      <div>
        <p className="text-[15px] font-semibold text-white/95 font-[family-name:var(--font-outfit)] mb-1">
          Try MetaStrip &mdash; it&apos;s free
        </p>
        <p className="text-[13px] text-white/50 font-[family-name:var(--font-outfit)]">
          Strip metadata from any photo in seconds. No upload, no account.
        </p>
      </div>
      <Link
        href="/"
        className="shrink-0 px-[22px] py-2.5 rounded-[10px] bg-gradient-to-br from-purple to-purple-dark text-white text-[13px] font-semibold font-[family-name:var(--font-outfit)] shadow-[0_0_12px_rgba(124,58,237,0.25)] whitespace-nowrap hover:shadow-[0_0_20px_rgba(124,58,237,0.4)] transition-shadow duration-200"
      >
        Open Tool &rarr;
      </Link>
    </div>
  );
}

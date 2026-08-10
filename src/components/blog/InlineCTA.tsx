import Link from "next/link";

interface InlineCTAProps {
  /** Contextual headline. Defaults to the generic tool pitch. */
  headline?: string;
  /** Supporting line under the headline. */
  sub?: string;
  /** Destination. Defaults to the homepage, where the tool lives. */
  href?: string;
}

/** In-article CTA. Posts can override the copy and destination so the prompt
 *  continues what the reader just read instead of pivoting to a generic pitch;
 *  see the `cta` field on BlogArticle for why. */
export default function InlineCTA({
  headline = "Try MetaStrip; it's free.",
  sub = "Strip metadata from any photo in seconds. No upload, no account.",
  href = "/",
}: InlineCTAProps = {}) {
  return (
    <div
      className="my-10 p-6 lg:p-7 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5"
      style={{
        background: "var(--card-inverse-bg)",
        color: "var(--card-inverse-text)",
        boxShadow:
          "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
      }}
    >
      <div>
        <p
          className="text-[15px] font-bold mb-1"
          style={{ color: "var(--card-inverse-text)" }}
        >
          {headline}
        </p>
        <p
          className="text-[13px]"
          style={{ color: "var(--card-inverse-muted)" }}
        >
          {sub}
        </p>
      </div>
      <Link
        href={href}
        className="shrink-0 inline-flex items-center px-5 py-2.5 rounded-xl text-[13px] font-semibold no-underline whitespace-nowrap transition-all hover:-translate-y-px"
        style={{
          background: "var(--accent)",
          color: "var(--accent-fg)",
        }}
      >
        Open MetaStrip →
      </Link>
    </div>
  );
}

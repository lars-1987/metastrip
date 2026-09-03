import { BATCH_LIMIT } from "@/lib/constants";
/**
 * Section 2 — three-up explainer of what's hidden, how the tool works,
 * and when you'd reach for it. Helio-inspired clean grid, no card chrome.
 */

interface Feature {
  eyebrow: string;
  title: string;
  body: string;
  bullets?: string[];
}

const FEATURES: Feature[] = [
  {
    eyebrow: "What's hidden",
    title: "Every file you share is talking.",
    body: "Photos carry GPS coordinates, device serial numbers, camera info, and timestamps. PDFs carry author names, edit history, and software fingerprints. AI-generated images carry C2PA content credentials identifying which tool made them.",
    bullets: [
      "GPS to within 5 metres of where you stood",
      "Device + serial number that fingerprints every photo to one phone",
      "AI generation tags from DALL·E, Midjourney, ChatGPT, Firefly",
      "Author names + tracked changes in Word, Excel, and PDF documents",
    ],
  },
  {
    eyebrow: "How it works",
    title: "Drop a file. See what's exposed. Strip it.",
    body: "MetaStrip runs entirely in your browser. There is no upload, no server, no temporary cache. You drop the file in, the tool reads its metadata locally with libraries like piexifjs and pdf-lib, shows you exactly what's embedded, and writes a clean copy back out.",
    bullets: [
      "Files never leave your device, verifiable in DevTools",
      `Batch up to ${BATCH_LIMIT} files at once`,
      "Open source under MIT. The code is on GitHub.",
      "Works on mobile and desktop, online or offline",
    ],
  },
  {
    eyebrow: "When to use it",
    title: "Before you share anything you didn't write yourself.",
    body: "Anywhere a file leaves your device is somewhere your metadata follows. Contracts to opposing counsel, photos to forums or marketplaces, AI-generated work to clients, journalism submissions, anything posted under a pseudonym.",
    bullets: [
      "Before posting photos taken at home",
      "Before sending a Word doc with revision history to a client",
      "Before submitting AI-assisted work where disclosure changes acceptance",
      "Before publishing anything anonymously; devices fingerprint themselves",
    ],
  },
];

export function HowItWorks() {
  return (
    <section className="px-6 lg:px-8 py-24 lg:py-32">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 lg:mb-20">
          <div
            className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
            style={{ color: "var(--accent-strong)" }}
          >
            How it works
          </div>
          <h2
            className="font-extrabold tracking-[-0.03em] leading-[1.05]"
            style={{
              color: "var(--text)",
              fontSize: "clamp(36px, 5vw, 60px)",
            }}
          >
            Privacy is in the details.<br />Specifically, the metadata.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">
          {FEATURES.map((f) => (
            <article
              key={f.title}
              className="rounded-3xl p-7 lg:p-8"
              style={{
                background: "var(--card-inverse-bg)",
                color: "var(--card-inverse-text)",
                boxShadow:
                  "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
              }}
            >
              <div
                className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4"
                style={{ color: "var(--accent-strong)" }}
              >
                {f.eyebrow}
              </div>
              <h3
                className="font-bold tracking-[-0.02em] leading-[1.2] mb-4"
                style={{
                  color: "var(--card-inverse-text)",
                  fontSize: "clamp(22px, 2.4vw, 28px)",
                }}
              >
                {f.title}
              </h3>
              <p
                className="leading-[1.65] mb-6"
                style={{ color: "var(--card-inverse-muted)", fontSize: 16 }}
              >
                {f.body}
              </p>
              {f.bullets && (
                <ul className="space-y-2.5 list-none p-0 m-0">
                  {f.bullets.map((b) => (
                    <li
                      key={b}
                      className="flex items-start gap-3 leading-[1.55]"
                      style={{ color: "var(--card-inverse-muted)", fontSize: 15 }}
                    >
                      <span
                        className="shrink-0 mt-[7px]"
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "var(--accent-strong)",
                        }}
                      />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

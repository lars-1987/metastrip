import { TopNav } from "@/components/shared/TopNav";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/shared/Icon";
import type { IconName } from "@/components/shared/Icon";
import { FounderPill } from "@/components/shared/FounderPill";

const stats = [
  { value: "0", unit: "bytes", label: "uploaded to any server" },
  { value: "0", unit: "", label: "accounts required" },
  { value: "0", unit: "", label: "ads, ever" },
  { value: "100%", unit: "", label: "client-side processing" },
];

const principles: { icon: IconName; title: string; body: string; tech: string }[] = [
  {
    icon: "Lock",
    title: "Your files never leave your device",
    body: "MetaStrip processes files entirely in your browser using client-side JavaScript. We don't upload, store, transmit, or even see your files. There is no server that receives your data — the processing engine runs locally in your browser tab.",
    tech: "Zero network requests during file processing",
  },
  {
    icon: "Ghost",
    title: "No accounts, no tracking, no profiles",
    body: "We don't ask for your name, email, or any identifying information. There are no accounts, no sign-ups, and no tracking. We don't build user profiles or track individual behavior.",
    tech: "PostHog Analytics — cookieless, Do Not Track respected",
  },
  {
    icon: "Prohibit",
    title: "No ads, no data selling, ever",
    body: "MetaStrip is funded by voluntary tips, not advertising. We will never sell data, show ads, or monetize through any mechanism that compromises user privacy. A privacy tool that violates privacy is worthless.",
    tech: "Free forever, supported by community tips via Ko-fi",
  },
  {
    icon: "MagnifyingGlass",
    title: "Verifiably private",
    body: "Because MetaStrip runs client-side, you can verify our privacy claims yourself. Open your browser's network inspector while using the tool — you'll see zero outbound file transfers. We don't ask you to trust us blindly; we've built the tool so trust isn't required.",
    tech: "Open DevTools → Network tab → process a file → zero outbound requests",
  },
];

const techSteps = [
  {
    label: "Your browser",
    description:
      "You drag a file into MetaStrip. It's read as an ArrayBuffer entirely within your browser tab. The file never leaves this context — it exists only in local memory.",
  },
  {
    label: "Processing engine",
    description:
      "Depending on file type, one of three open-source libraries processes the file. piexifjs strips EXIF from images, pdf-lib clears PDF properties, and JSZip modifies Office XML metadata. All processing happens in JavaScript on your device.",
  },
  {
    label: "Output",
    description:
      "A new, clean file is generated in memory. The browser triggers a download of the stripped file. Your original file is never modified, and no data is transmitted anywhere.",
  },
];

const libraries = [
  {
    name: "pdf-lib",
    description:
      "Pure JavaScript PDF manipulation. Reads and clears all standard PDF metadata fields — author, creator, producer, dates, keywords, and custom properties.",
    url: "https://github.com/Hopding/pdf-lib",
  },
  {
    name: "JSZip",
    description:
      "ZIP file reader/writer used to unpack DOCX, XLSX, and PPTX files (which are ZIP archives) and modify their internal XML metadata files directly in the browser.",
    url: "https://github.com/Stuk/jszip",
  },
  {
    name: "piexifjs",
    description:
      "Lightweight EXIF parser that reads and removes EXIF, IPTC, and GPS metadata from JPEG images without quality loss or re-encoding.",
    url: "https://github.com/hMatoba/piexifjs",
  },
];

export function AboutPage() {
  return (
    <>
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-24">
          {/* ── Hero ── */}
          <div className="text-center mb-16">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              Privacy by architecture
            </div>
            <h1
              className="font-extrabold leading-[1.05] tracking-[-0.04em] mb-5"
              style={{
                color: "var(--text)",
                fontSize: "clamp(40px, 5.5vw, 60px)",
              }}
            >
              We can&apos;t see your files.
              <br />
              By design.
            </h1>
            <p
              className="mx-auto leading-[1.6] font-medium"
              style={{
                color: "var(--text-secondary)",
                fontSize: "clamp(17px, 1.6vw, 19px)",
                maxWidth: 560,
              }}
            >
              MetaStrip is a metadata removal tool built on a simple principle: a
              privacy tool should be private. Your files are processed entirely in
              your browser. We never see, store, or transmit them.
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-20">
            {stats.map((s, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 text-center"
                style={{
                  background: "var(--surface)",
                  boxShadow: "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
                }}
              >
                <div
                  className="font-extrabold leading-none tracking-[-0.02em]"
                  style={{
                    color: "var(--accent-strong)",
                    fontSize: 36,
                  }}
                >
                  {s.value}
                  {s.unit && (
                    <span
                      className="text-sm font-medium opacity-70 ml-1"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {s.unit}
                    </span>
                  )}
                </div>
                <div
                  className="text-[12px] mt-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* ── Why MetaStrip exists / Founder bio ── */}
          <section className="mb-20">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4 text-center"
              style={{ color: "var(--accent-strong)" }}
            >
              Why MetaStrip exists
            </div>
            <FounderPill>
              <p className="mb-3">
                MetaStrip is built by Lars Holmstrom — an indie developer and
                cyber security graduate based in Melbourne, Australia.
              </p>
              <p className="mb-3">
                The cyber security background is why I care about this problem
                in the first place. Most people have no idea what&apos;s
                embedded in the files they share every day, and the tools
                meant to help them either upload your files to someone
                else&apos;s server or look like they were last updated when
                Ubuntu still shipped with Unity. I wanted something better, so
                I built it.
              </p>
              <p className="mb-3">
                I&apos;m a believer in FOSS for privacy tools — keeping big
                tech out of personal information shouldn&apos;t require
                trusting another company. The whole tool is on GitHub under
                MIT licence. Audit it, fork it, run it locally, contribute.
                The code is the proof.
              </p>
              <p>Also a fan of dogs and tacos.</p>
            </FounderPill>
          </section>

          {/* ── Principles ── */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--accent-strong)" }}
              >
                Privacy principles
              </div>
              <h2
                className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-3"
                style={{
                  color: "var(--text)",
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                }}
              >
                Not just promises — architectural guarantees.
              </h2>
            </div>
            <div className="space-y-4">
              {principles.map((p, i) => (
                <div
                  key={i}
                  className="rounded-2xl p-7"
                  style={{
                    background: "var(--surface)",
                  boxShadow: "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
                  }}
                >
                  <div className="flex gap-5">
                    <span className="shrink-0 mt-0.5">
                      <Icon
                        name={p.icon}
                        size={28}
                        weight="duotone"
                        className=""
                        color="var(--accent-strong)"
                      />
                    </span>
                    <div>
                      <h3
                        className="font-bold tracking-[-0.015em] mb-2"
                        style={{ color: "var(--text)", fontSize: 18 }}
                      >
                        {p.title}
                      </h3>
                      <p
                        className="text-[14px] leading-[1.7] mb-3.5"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        {p.body}
                      </p>
                      <div
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{
                          background:
                            "color-mix(in srgb, var(--accent-strong) 10%, transparent)",
                        }}
                      >
                        <span
                          className="text-[11px] font-[family-name:var(--font-mono)] font-medium"
                          style={{ color: "var(--accent-strong)" }}
                        >
                          {p.tech}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Tech Architecture ── */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--accent-strong)" }}
              >
                Under the hood
              </div>
              <h2
                className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-3"
                style={{
                  color: "var(--text)",
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                }}
              >
                The complete data flow.
              </h2>
              <p
                className="mx-auto leading-[1.6]"
                style={{
                  color: "var(--text-secondary)",
                  fontSize: 16,
                  maxWidth: 540,
                }}
              >
                Verify it yourself with browser DevTools.
              </p>
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {techSteps.map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full p-6 rounded-2xl flex-1"
                    style={{
                      background: "var(--surface)",
                  boxShadow: "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
                    }}
                  >
                    <div
                      className="text-[12px] font-bold uppercase tracking-[0.14em] mb-3 font-[family-name:var(--font-mono)]"
                      style={{ color: "var(--accent-strong)" }}
                    >
                      {i + 1}. {step.label}
                    </div>
                    <p
                      className="text-[13px] leading-[1.6]"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {step.description}
                    </p>
                  </div>
                  {i < techSteps.length - 1 && (
                    <div
                      className="py-2 text-lg md:hidden"
                      style={{ color: "var(--text-muted)" }}
                    >
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="mt-4 px-4 py-3 rounded-xl flex gap-2.5 items-center"
              style={{
                background:
                  "color-mix(in srgb, var(--accent-strong) 8%, transparent)",
              }}
            >
              <span className="shrink-0">
                <Icon
                  name="ShieldCheck"
                  size={16}
                  weight="fill"
                  color="var(--accent-strong)"
                />
              </span>
              <span
                className="text-[12px] font-[family-name:var(--font-mono)]"
                style={{ color: "var(--accent-strong)" }}
              >
                No server involved. No API calls. No file uploads. Verify in
                DevTools.
              </span>
            </div>
          </section>

          {/* ── Open Source Libraries ── */}
          <section className="mb-20">
            <div className="text-center mb-12">
              <div
                className="text-[12px] font-bold uppercase tracking-[0.18em] mb-3"
                style={{ color: "var(--accent-strong)" }}
              >
                Open source
              </div>
              <h2
                className="font-extrabold tracking-[-0.03em] leading-[1.1] mb-3"
                style={{
                  color: "var(--text)",
                  fontSize: "clamp(28px, 3.5vw, 40px)",
                }}
              >
                Built on trusted, auditable libraries.
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {libraries.map((lib) => (
                <div
                  key={lib.name}
                  className="rounded-2xl p-6"
                  style={{
                    background: "var(--surface)",
                  boxShadow: "0 1px 3px rgba(31,21,48,0.04), 0 8px 24px -8px rgba(31,21,48,0.08)",
                  }}
                >
                  <div
                    className="font-bold mb-3 font-[family-name:var(--font-mono)]"
                    style={{ color: "var(--accent-strong)", fontSize: 16 }}
                  >
                    {lib.name}
                  </div>
                  <p
                    className="text-[13px] leading-[1.65] mb-4"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {lib.description}
                  </p>
                  <a
                    href={lib.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[12px] font-[family-name:var(--font-mono)] no-underline transition-colors"
                    style={{ color: "var(--text-muted)" }}
                  >
                    View on GitHub →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* ── Contact CTA ── */}
          <section
            className="rounded-3xl p-10 text-center"
            style={{
              background: "var(--card-inverse-bg)",
              color: "var(--card-inverse-text)",
              boxShadow:
                "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
            }}
          >
            <h3
              className="font-extrabold tracking-[-0.025em] leading-[1.15] mb-3"
              style={{ color: "var(--card-inverse-text)", fontSize: 26 }}
            >
              Questions, feedback, or feature requests?
            </h3>
            <p
              className="leading-[1.6] mb-6"
              style={{ color: "var(--card-inverse-muted)", fontSize: 15 }}
            >
              MetaStrip is built by one person. I read every message.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="mailto:hello@metastrip.app"
                className="inline-flex items-center px-7 py-3 rounded-xl text-[14px] font-semibold no-underline transition-all hover:-translate-y-px"
                style={{
                  background: "var(--accent)",
                  color: "var(--accent-fg)",
                }}
              >
                hello@metastrip.app
              </a>
              <a
                href="https://x.com/larsitodev"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-7 py-3 rounded-xl text-[14px] font-semibold no-underline transition-colors"
                style={{
                  background: "transparent",
                  color: "var(--card-inverse-text)",
                  border: "1px solid var(--card-inverse-muted)",
                }}
              >
                @larsitodev
              </a>
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

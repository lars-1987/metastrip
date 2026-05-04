import { AnimatedBackground } from "@/components/shared/AnimatedBackground";
import { Nav } from "@/components/layout/Nav";
import { Footer } from "@/components/layout/Footer";
import { Icon } from "@/components/shared/Icon";
import type { IconName } from "@/components/shared/Icon";

const stats = [
  { value: "0", unit: "bytes", label: "uploaded to any server", color: "#4ade80" },
  { value: "0", unit: "", label: "accounts required", color: "#a78bfa" },
  { value: "0", unit: "", label: "ads, ever", color: "#06b6d4" },
  { value: "100%", unit: "", label: "client-side processing", color: "#f472b6" },
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
    color: "#4ade80",
    description:
      "You drag a file into MetaStrip. It's read as an ArrayBuffer entirely within your browser tab. The file never leaves this context — it exists only in local memory.",
  },
  {
    label: "Processing engine",
    color: "#a78bfa",
    description:
      "Depending on file type, one of three open-source libraries processes the file. piexifjs strips EXIF from images, pdf-lib clears PDF properties, and JSZip modifies Office XML metadata. All processing happens in JavaScript on your device.",
  },
  {
    label: "Output",
    color: "#06b6d4",
    description:
      "A new, clean file is generated in memory. The browser triggers a download of the stripped file. Your original file is never modified, and no data is transmitted anywhere.",
  },
];

const libraries = [
  {
    name: "pdf-lib",
    color: "#f472b6",
    description:
      "Pure JavaScript PDF manipulation. Reads and clears all standard PDF metadata fields — author, creator, producer, dates, keywords, and custom properties.",
    url: "https://github.com/Hopding/pdf-lib",
  },
  {
    name: "JSZip",
    color: "#a78bfa",
    description:
      "ZIP file reader/writer used to unpack DOCX, XLSX, and PPTX files (which are ZIP archives) and modify their internal XML metadata files directly in the browser.",
    url: "https://github.com/Stuk/jszip",
  },
  {
    name: "piexifjs",
    color: "#06b6d4",
    description:
      "Lightweight EXIF parser that reads and removes EXIF, IPTC, and GPS metadata from JPEG images without quality loss or re-encoding.",
    url: "https://github.com/hMatoba/piexifjs",
  },
];

export function AboutPage() {
  return (
    <>
      <AnimatedBackground />
      <Nav />

      <div className="relative z-[1] max-w-[880px] mx-auto px-6 pt-[110px] pb-20">
        {/* ── Hero ── */}
        <div className="text-center mb-14 animate-hero-fade-in">
          <div className="inline-block mb-4 px-4 py-[5px] rounded-full bg-success/[0.06] border border-success/[0.12]">
            <span className="text-xs text-success font-[family-name:var(--font-mono)] font-medium tracking-[0.05em]">
              PRIVACY BY ARCHITECTURE
            </span>
          </div>
          <h1
            className="text-4xl sm:text-[46px] font-extrabold leading-[1.1] -tracking-[0.04em] font-[family-name:var(--font-outfit)] mb-4 animate-gradient-shift"
            style={{
              background:
                "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
              backgroundSize: "200% 200%",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            We can&apos;t see your files.
            <br />
            By design.
          </h1>
          <p className="text-[17px] text-white/50 max-w-[520px] mx-auto font-[family-name:var(--font-outfit)] leading-[1.7]">
            MetaStrip is a metadata removal tool built on a simple principle: a
            privacy tool should be private. Your files are processed entirely in
            your browser. We never see, store, or transmit them.
          </p>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          {stats.map((s, i) => (
            <div
              key={i}
              className="p-6 rounded-2xl text-center bg-white/[0.02] border border-white/[0.05] animate-card-slide-in"
              style={{ animationDelay: `${0.3 + i * 0.08}s` }}
            >
              <div
                className="text-4xl font-extrabold font-[family-name:var(--font-outfit)] leading-none"
                style={{ color: s.color }}
              >
                {s.value}
                {s.unit && (
                  <span className="text-sm font-medium opacity-70 ml-1">
                    {s.unit}
                  </span>
                )}
              </div>
              <div className="text-xs text-white/45 font-[family-name:var(--font-outfit)] mt-1.5">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Origin Story ── */}
        <section
          className="mt-16 p-10 rounded-3xl bg-white/[0.015] border border-white/[0.04] animate-card-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="flex items-center gap-2.5 mb-5">
            <Icon name="Lightbulb" size={24} weight="duotone" className="text-white/90" />
            <h2 className="text-[22px] font-bold text-white/95 font-[family-name:var(--font-outfit)] -tracking-[0.02em]">
              Why MetaStrip exists
            </h2>
          </div>
          <div className="text-[15px] text-white/55 font-[family-name:var(--font-outfit)] leading-[1.85]">
            <p className="mb-3.5">
              It started the way most side projects do — I had a problem and
              nothing solved it properly. I needed to strip metadata from a
              batch of files and went looking for a tool. What I found was
              bleak: half-abandoned web apps plastered with ads, sketchy
              services that wanted me to upload my files to their servers, or
              CLI tools that worked fine but required a terminal and a manual.
            </p>
            <p className="mb-3.5">
              None of it felt right. A privacy tool shouldn&apos;t require
              trusting a stranger&apos;s server with your files, and it
              shouldn&apos;t look like it was last updated when Ubuntu
              still shipped with Unity.
            </p>
            <p className="mb-3.5">
              So I built the clean, modern version I actually wanted to use —
              everything runs in your browser, no uploads, no accounts, no
              nonsense. Then I looked at it and thought: this works, but
              it&apos;s boring. The best CLI tools I use every day are the ones
              that feel alive — the ones with personality.
            </p>
            <p className="mb-3.5">
              So I scrapped the generic landing page and rebuilt the whole thing
              inside a terminal. If the only good metadata tools were CLI
              programs, why not make one that lives in the browser? Same power,
              zero setup, and a bit of fun baked in.
            </p>
            <p>
              Built in Melbourne by a dev who likes privacy, terminals, and not
              uploading files to random servers.
            </p>
          </div>
        </section>

        {/* ── Principles ── */}
        <section className="mt-16">
          <h2 className="text-[28px] font-bold text-center text-white/95 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            Our privacy principles
          </h2>
          <p className="text-sm text-white/45 text-center font-[family-name:var(--font-outfit)] mb-8">
            Not just promises — architectural guarantees
          </p>
          <div className="flex flex-col gap-4">
            {principles.map((p, i) => (
              <div
                key={i}
                className="p-7 rounded-[20px] bg-white/[0.02] border border-white/[0.05] transition-all duration-300 hover:border-purple/[0.12] animate-card-slide-in"
                style={{ animationDelay: `${0.15 + i * 0.1}s` }}
              >
                <div className="flex gap-4.5">
                  <span className="shrink-0 mt-0.5"><Icon name={p.icon} size={28} weight="duotone" className="text-white/90" /></span>
                  <div>
                    <h3 className="text-lg font-bold text-white/95 font-[family-name:var(--font-outfit)] mb-2 -tracking-[0.02em]">
                      {p.title}
                    </h3>
                    <p className="text-sm text-white/55 font-[family-name:var(--font-outfit)] leading-[1.75] mb-3">
                      {p.body}
                    </p>
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-purple/[0.06] border border-purple/[0.08]">
                      <span className="text-[11px] text-purple-light font-[family-name:var(--font-mono)] font-medium">
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
        <section className="mt-16">
          <h2 className="text-[28px] font-bold text-center text-white/95 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            How it works under the hood
          </h2>
          <p className="text-sm text-white/45 text-center font-[family-name:var(--font-outfit)] mb-8">
            The complete data flow — verify it yourself with browser DevTools
          </p>
          <div
            className="p-8 rounded-[20px] border animate-card-slide-in"
            style={{
              background: "rgba(0,0,0,0.2)",
              borderColor: "rgba(255,255,255,0.06)",
              animationDelay: "0.3s",
            }}
          >
            <div className="text-[10px] font-semibold text-white/35 font-[family-name:var(--font-mono)] tracking-[0.1em] uppercase mb-5">
              Data flow diagram
            </div>
            <div className="flex flex-col md:flex-row gap-3 items-stretch">
              {techSteps.map((step, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full p-5 rounded-[14px] flex-1"
                    style={{
                      background: `${step.color}08`,
                      border: `1px solid ${step.color}18`,
                    }}
                  >
                    <div
                      className="text-xs font-bold font-[family-name:var(--font-mono)] mb-3 tracking-[0.03em]"
                      style={{ color: step.color }}
                    >
                      {step.label}
                    </div>
                    <p className="text-xs text-white/55 font-[family-name:var(--font-outfit)] leading-[1.6]">
                      {step.description}
                    </p>
                  </div>
                  {i < techSteps.length - 1 && (
                    <div className="py-2 text-white/25 text-lg md:hidden">
                      ↓
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div
              className="mt-4 px-4 py-3 rounded-[10px] flex gap-2.5"
              style={{
                background: "rgba(248,113,113,0.04)",
                border: "1px solid rgba(248,113,113,0.08)",
              }}
            >
              <span className="shrink-0"><Icon name="Warning" size={13} weight="fill" className="text-danger/60" /></span>
              <span className="text-xs text-danger/60 font-[family-name:var(--font-mono)]">
                No server involved. No API calls. No file uploads. Verify this
                yourself in DevTools.
              </span>
            </div>
          </div>
        </section>

        {/* ── Open Source Libraries ── */}
        <section className="mt-16">
          <h2 className="text-[28px] font-bold text-center text-white/95 font-[family-name:var(--font-outfit)] -tracking-[0.02em] mb-1.5">
            Built on open source
          </h2>
          <p className="text-sm text-white/45 text-center font-[family-name:var(--font-outfit)] mb-8">
            MetaStrip&apos;s processing engine uses trusted, auditable
            open-source libraries
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {libraries.map((lib, i) => (
              <div
                key={i}
                className="p-6 rounded-[18px] bg-white/[0.02] border border-white/[0.05] transition-all duration-300 animate-card-slide-in"
                style={{ animationDelay: `${0.2 + i * 0.1}s` }}
              >
                <div
                  className="text-base font-bold font-[family-name:var(--font-mono)] mb-2.5"
                  style={{ color: lib.color }}
                >
                  {lib.name}
                </div>
                <p className="text-[13px] text-white/50 font-[family-name:var(--font-outfit)] leading-[1.65] mb-3.5">
                  {lib.description}
                </p>
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-white/30 font-[family-name:var(--font-mono)] hover:text-white/50 transition-colors duration-200 no-underline"
                >
                  View on GitHub →
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── Contact CTA ── */}
        <section
          className="mt-16 p-10 rounded-3xl border text-center animate-card-slide-in"
          style={{
            background:
              "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
            borderColor: "rgba(124,58,237,0.1)",
            animationDelay: "0.3s",
          }}
        >
          <h3 className="text-2xl font-bold mb-2.5 font-[family-name:var(--font-outfit)] text-white/95 -tracking-[0.02em]">
            Questions, feedback, or feature requests?
          </h3>
          <p className="text-[15px] text-white/50 mb-6 font-[family-name:var(--font-outfit)] leading-[1.6]">
            MetaStrip is built by one person. I read every message.
          </p>
          <div className="flex justify-center gap-3">
            <a
              href="mailto:hello@metastrip.app"
              className="px-8 py-3.5 rounded-xl border-none cursor-pointer text-white text-[15px] font-semibold font-[family-name:var(--font-outfit)] transition-all duration-250 hover:-translate-y-0.5 no-underline"
              style={{
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                boxShadow:
                  "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              }}
            >
              hello@metastrip.app
            </a>
            <a
              href="https://x.com/larsitodev"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl cursor-pointer text-white/80 text-[15px] font-semibold font-[family-name:var(--font-outfit)] border border-white/10 bg-white/[0.03] transition-all duration-250 hover:bg-white/[0.06] no-underline"
            >
              @larsitodev
            </a>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

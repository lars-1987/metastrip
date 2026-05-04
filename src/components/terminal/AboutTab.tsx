"use client";

export function AboutTab() {
  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Terminal prompt */}
      <div className="shrink-0 px-4 md:px-6 pt-4 pb-3">
        <div className="font-[family-name:var(--font-mono)] text-sm text-white/65">
          <span className="text-purple-400 mr-1.5">❯</span>
          <span>cat /etc/metastrip/README.md</span>
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 md:px-6 pb-6">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-white/[0.06]">
          <div className="text-xs text-white/35 font-[family-name:var(--font-mono)] mb-2">
            ─── README.md ───
          </div>
          <div className="text-xl font-bold text-white/95 font-[family-name:var(--font-mono)]">
            # MetaStrip
          </div>
          <div className="text-sm text-white/55 font-[family-name:var(--font-mono)] mt-1">
            Privacy-first metadata removal. Client-side only.
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {[
            { value: "0 bytes", label: "uploaded", color: "text-green-400" },
            { value: "0", label: "accounts", color: "text-purple-400" },
            { value: "0", label: "ads", color: "text-cyan-400" },
            { value: "100%", label: "client-side", color: "text-pink-400" },
          ].map((stat) => (
            <div key={stat.label} className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-center">
              <div className={`text-lg font-bold font-[family-name:var(--font-mono)] ${stat.color}`}>
                {stat.value}
              </div>
              <div className="text-xs text-white/45 font-[family-name:var(--font-mono)] mt-0.5">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Origin story */}
        <div className="mb-6">
          <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-white/70 mb-3">
            ## Why MetaStrip exists
          </div>
          <div className="pl-4 border-l border-white/[0.06] text-sm text-white/60 font-[family-name:var(--font-mono)] leading-[1.9] flex flex-col gap-2.5">
            <p>
              It started the way most side projects do — I had a problem and
              nothing solved it properly. I needed to strip metadata from a
              batch of files and went looking for a tool. What I found was bleak:
              half-abandoned web apps plastered with ads, sketchy services that
              wanted me to upload my files to their servers, or CLI tools that
              worked fine but required a terminal and a manual.
            </p>
            <p>
              None of it felt right. A privacy tool shouldn&apos;t require trusting
              a stranger&apos;s server with your files, and it shouldn&apos;t look like
              it was last updated when Ubuntu still shipped with Unity.
            </p>
            <p>
              So I built the clean, modern version I actually wanted to use —
              everything runs in your browser, no uploads, no accounts, no
              nonsense. Then I looked at it and thought: this works, but it&apos;s
              boring. The best CLI tools I use every day are the ones that feel
              alive — the ones with personality.
            </p>
            <p>
              So I scrapped the generic landing page and rebuilt the whole thing
              inside a terminal. If the only good metadata tools were CLI
              programs, why not make one that lives in the browser? Same
              power, zero setup, and a bit of fun baked in.
            </p>
            <p className="text-white/50">
              Built in Melbourne by a dev who likes privacy, terminals,
              and not uploading files to random servers.
            </p>
          </div>
        </div>

        {/* Principles */}
        <div className="mb-6">
          <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-white/70 mb-3">
            ## Privacy principles
          </div>
          {[
            {
              title: "Files never leave your device",
              detail: "Zero network requests during processing. Verify in DevTools.",
              tag: "ARCHITECTURE",
            },
            {
              title: "No accounts, no tracking, no profiles",
              detail: "PostHog analytics — cookieless, Do Not Track respected.",
              tag: "PRIVACY",
            },
            {
              title: "No ads, no data selling, ever",
              detail: "Free forever, supported by community tips via Ko-fi.",
              tag: "POLICY",
            },
            {
              title: "Verifiably private",
              detail: "Open DevTools → Network tab → process a file → zero outbound requests.",
              tag: "VERIFIABLE",
            },
          ].map((p) => (
            <div key={p.title} className="mb-3 pl-4 border-l border-white/[0.06]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-400/70 font-[family-name:var(--font-mono)] font-bold">
                  {p.tag}
                </span>
                <span className="text-sm text-white/75 font-[family-name:var(--font-mono)] font-bold">
                  {p.title}
                </span>
              </div>
              <div className="text-xs text-white/50 font-[family-name:var(--font-mono)] leading-relaxed">
                {p.detail}
              </div>
            </div>
          ))}
        </div>

        {/* Data flow */}
        <div className="mb-6">
          <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-white/70 mb-3">
            ## Data flow
          </div>
          <div className="p-4 rounded-lg bg-black/30 border border-white/[0.06]">
            <div className="text-sm font-[family-name:var(--font-mono)] leading-[2]">
              <div><span className="text-green-400">1.</span> <span className="text-white/60">Your browser reads file as ArrayBuffer (local memory only)</span></div>
              <div><span className="text-purple-400">2.</span> <span className="text-white/60">Processing engine runs client-side JS library</span></div>
              <div className="text-white/45 pl-4">├─ piexifjs → JPEG EXIF removal</div>
              <div className="text-white/45 pl-4">├─ pdf-lib  → PDF metadata clearing</div>
              <div className="text-white/45 pl-4">└─ JSZip   → Office XML metadata</div>
              <div><span className="text-cyan-400">3.</span> <span className="text-white/60">Clean file generated in memory → browser download</span></div>
            </div>
            <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-red-400/50 font-[family-name:var(--font-mono)]">
              ⚠ No server. No API calls. No file uploads. Verify in DevTools.
            </div>
          </div>
        </div>

        {/* Libraries */}
        <div className="mb-6">
          <div className="text-sm font-bold font-[family-name:var(--font-mono)] text-white/70 mb-3">
            ## Dependencies
          </div>
          <div className="text-xs font-[family-name:var(--font-mono)] leading-[2]">
            {[
              { name: "piexifjs", desc: "JPEG EXIF read/remove without re-encoding", color: "text-cyan-400", url: "https://github.com/hMatoba/piexifjs" },
              { name: "pdf-lib", desc: "Pure JS PDF manipulation", color: "text-pink-400", url: "https://github.com/Hopding/pdf-lib" },
              { name: "JSZip", desc: "ZIP read/write for Office doc metadata", color: "text-purple-400", url: "https://github.com/Stuk/jszip" },
            ].map((lib) => (
              <div key={lib.name}>
                <a href={lib.url} target="_blank" rel="noopener noreferrer" className={`${lib.color} hover:underline underline-offset-2 no-underline`}>{lib.name.padEnd(10)}</a>
                <span className="text-white/50"> {lib.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div className="mt-6 pt-4 border-t border-white/[0.06]">
          <div className="text-xs text-white/35 font-[family-name:var(--font-mono)]">
            ─── EOF ───
          </div>
          <div className="text-sm text-white/50 font-[family-name:var(--font-mono)] mt-2">
            Questions? →{" "}
            <a href="mailto:hello@metastrip.app" className="text-purple-400/70 hover:text-purple-400 transition-colors no-underline">
              hello@metastrip.app
            </a>
            <span className="text-white/20 mx-2">|</span>
            <a href="https://x.com/larsitodev" target="_blank" rel="noopener noreferrer" className="text-cyan-400/50 hover:text-cyan-400 transition-colors no-underline">
              @larsitodev
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

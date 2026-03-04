import { useState } from "react";

// ============================================================
// ABOUT / PRIVACY STORY PAGE
// ============================================================

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", top: "10%", left: "-8%", animation: "orbFloat1 24s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", bottom: "0%", right: "-5%", animation: "orbFloat2 28s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
    </div>
  );
}

function Logo({ onClick }) {
  return (
    <div onClick={onClick} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: -1 }}>M</span>
      </div>
      <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Outfit', sans-serif", background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>MetaStrip</span>
    </div>
  );
}

function Nav() {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 24px", background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Tool", "Pricing", "Blog", "About"].map(link => (
          <span key={link} style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: link === "About" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s ease", position: "relative" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = link === "About" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
          >
            {link}
            {link === "About" && <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #7c3aed, #06b6d4)", borderRadius: 1 }} />}
          </span>
        ))}
        <button style={{ padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>Get Batch Pass</button>
      </div>
    </nav>
  );
}

function Footer() {
  return (
    <footer style={{ position: "relative", zIndex: 1, textAlign: "center", padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
        {["Tool", "Pricing", "Blog", "About", "Privacy", "Terms"].map(link => (
          <span key={link} style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif", cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}
          >{link}</span>
        ))}
      </div>
      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>Made with ☕ in Melbourne</p>
    </footer>
  );
}

// ============================================================
// PRINCIPLES SECTION
// ============================================================

function Principles() {
  const principles = [
    {
      icon: "🔒", title: "Your files never leave your device",
      body: "MetaStrip processes files entirely in your browser using client-side JavaScript. We don't upload, store, transmit, or even see your files. There is no server that receives your data — the processing engine runs locally in your browser tab.",
      tech: "Built with pdf-lib, JSZip, and piexifjs — open-source libraries running in your browser's JavaScript engine.",
    },
    {
      icon: "👻", title: "No accounts, no tracking, no profiles",
      body: "We don't ask for your name, email, or any identifying information to use the free tool. Batch passes are purchased through Stripe using only an email for the receipt. We don't build user profiles or track individual behavior.",
      tech: "Analytics via Plausible — privacy-first, cookieless, GDPR-compliant by default.",
    },
    {
      icon: "🚫", title: "No ads, no data selling, ever",
      body: "MetaStrip is funded by batch pass purchases, not advertising. We will never sell data, show ads, or monetize through any mechanism that compromises user privacy. A privacy tool that violates privacy is worthless.",
      tech: "Revenue comes from $2.99 image passes and $4.99 document passes. That's it.",
    },
    {
      icon: "🔍", title: "Verifiably private",
      body: "Because MetaStrip runs client-side, you can verify our privacy claims yourself. Open your browser's network inspector while using the tool — you'll see zero outbound file transfers. We don't ask you to trust us blindly; we've built the tool so trust isn't required.",
      tech: "Open your browser DevTools → Network tab → process a file → zero upload requests.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {principles.map((p, i) => (
        <div key={i} style={{
          padding: "28px 28px", borderRadius: 20,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.3s ease",
          animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.15 + i * 0.1}s both`,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.12)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; }}
        >
          <div style={{ display: "flex", gap: 18 }}>
            <span style={{ fontSize: 28, flexShrink: 0, marginTop: 2 }}>{p.icon}</span>
            <div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", marginBottom: 8, letterSpacing: "-0.02em" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.75, marginBottom: 12 }}>{p.body}</p>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 8, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.08)" }}>
                <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>{p.tech}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// HOW IT WORKS TECHNICALLY
// ============================================================

function TechArchitecture() {
  const steps = [
    { label: "Your browser", color: "#4ade80", items: ["File selected via drag & drop", "File read into memory (ArrayBuffer)", "Never leaves this box"] },
    { label: "Processing engine", color: "#a78bfa", items: ["piexifjs strips image EXIF/XMP", "pdf-lib clears PDF properties", "JSZip modifies Office XML metadata"] },
    { label: "Output", color: "#06b6d4", items: ["Clean file generated in memory", "Download triggered from browser", "Original file unchanged"] },
  ];

  return (
    <div style={{
      padding: "32px 28px", borderRadius: 20,
      background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.06)",
      animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
        Data flow diagram
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "stretch" }}>
        {steps.map((step, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
            <div style={{
              width: "100%", padding: "20px 18px", borderRadius: 14,
              background: `${step.color}08`, border: `1px solid ${step.color}18`,
              flex: 1,
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: step.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 12, letterSpacing: "0.03em" }}>{step.label}</div>
              {step.items.map((item, j) => (
                <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: step.color, flexShrink: 0, opacity: 0.5 }} />
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.4 }}>{item}</span>
                </div>
              ))}
            </div>
            {i < steps.length - 1 && (
              <div style={{ padding: "8px 0", color: "rgba(255,255,255,0.15)", fontSize: 18, transform: "rotate(0deg)" }}>→</div>
            )}
          </div>
        ))}
      </div>
      <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 10, background: "rgba(248,113,113,0.04)", border: "1px solid rgba(248,113,113,0.08)", display: "flex", gap: 10 }}>
        <span style={{ fontSize: 13, flexShrink: 0 }}>🚫</span>
        <span style={{ fontSize: 12, color: "rgba(248,113,113,0.6)", fontFamily: "'JetBrains Mono', monospace" }}>No server involved. No API calls. No file uploads. Network inspector will confirm zero outbound data.</span>
      </div>
    </div>
  );
}

// ============================================================
// STATS
// ============================================================

function Stats() {
  const stats = [
    { value: "0", unit: "bytes", label: "uploaded to our servers", color: "#4ade80" },
    { value: "0", unit: "accounts", label: "required to use MetaStrip", color: "#a78bfa" },
    { value: "0", unit: "ads", label: "now or ever", color: "#06b6d4" },
    { value: "100%", unit: "", label: "client-side processing", color: "#f472b6" },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
      {stats.map((s, i) => (
        <div key={i} style={{
          padding: "24px 20px", borderRadius: 16, textAlign: "center",
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.3 + i * 0.08}s both`,
        }}>
          <div style={{ fontSize: 36, fontWeight: 800, color: s.color, fontFamily: "'Outfit', sans-serif", lineHeight: 1 }}>
            {s.value}
            {s.unit && <span style={{ fontSize: 14, fontWeight: 500, opacity: 0.7, marginLeft: 3 }}>{s.unit}</span>}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", marginTop: 6 }}>{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN ABOUT PAGE
// ============================================================

export default function AboutPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,30px) scale(1.05); } 66% { transform: translate(-20px,-15px) scale(0.95); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(-30px,-40px) scale(1.08); } 66% { transform: translate(25px,20px) scale(0.92); } }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      <AnimatedBackground />
      <Nav />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "110px 24px 80px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 56, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{ display: "inline-block", marginBottom: 16, padding: "5px 16px", borderRadius: 100, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
            <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>PRIVACY BY ARCHITECTURE</span>
          </div>
          <h1 style={{
            fontSize: 46, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif", marginBottom: 16,
            background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
            backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            We can't see your files.<br />By design.
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>
            MetaStrip is a metadata removal tool built on a simple principle: a privacy tool should be private. Your files are processed entirely in your browser. We never see, store, or transmit them.
          </p>
        </div>

        {/* Stats bar */}
        <Stats />

        {/* Origin story */}
        <section style={{
          marginTop: 64, padding: "40px 36px", borderRadius: 24,
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
          animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>Why MetaStrip exists</h2>
          </div>
          <div style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.85 }}>
            <p style={{ marginBottom: 14 }}>
              I needed to strip metadata from a batch of photos before uploading them to a marketplace. So I did what everyone does — I Googled "remove metadata from photos online."
            </p>
            <p style={{ marginBottom: 14 }}>
              What I found was a graveyard of ad-infested tools from 2015. Most only handled images. None processed documents. Several required me to upload files to their servers — which completely defeats the purpose when you're trying to protect privacy. One site had more tracking scripts than a surveillance agency.
            </p>
            <p style={{ marginBottom: 14 }}>
              The irony was absurd: privacy tools that violate your privacy. Upload your sensitive files to our server, trust us, and oh — here are 47 ads while you wait.
            </p>
            <p style={{ marginBottom: 14 }}>
              So I built MetaStrip. The core insight was simple: modern browsers are powerful enough to do all the processing client-side. There's no technical reason to upload files to a server for metadata removal. PDF parsing, Office document manipulation, image EXIF stripping — all of it can happen in JavaScript, in your browser, in milliseconds.
            </p>
            <p>
              MetaStrip is built in Melbourne by an indie developer with a background in cybersecurity. It's the tool I wanted to exist — fast, private, modern, and honest about exactly what it does with your data (nothing).
            </p>
          </div>
        </section>

        {/* Core principles */}
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
            Our privacy principles
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>
            Not just promises — architectural guarantees
          </p>
          <Principles />
        </section>

        {/* Technical architecture */}
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
            How it works under the hood
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>
            The complete data flow — verify it yourself with browser DevTools
          </p>
          <TechArchitecture />
        </section>

        {/* Open source libraries */}
        <section style={{ marginTop: 64 }}>
          <h2 style={{ fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
            Built on open source
          </h2>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32, fontFamily: "'Outfit', sans-serif" }}>
            MetaStrip's processing engine uses trusted, auditable open-source libraries
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            {[
              { name: "pdf-lib", desc: "Pure JavaScript PDF manipulation. Reads and clears all standard PDF metadata fields — author, creator, producer, dates, keywords, and custom properties.", url: "github.com/Hopding/pdf-lib", color: "#f472b6" },
              { name: "JSZip", desc: "Reads and writes ZIP files in the browser. Since DOCX, XLSX, and PPTX are ZIP archives, JSZip lets us access and modify their internal XML metadata files.", url: "github.com/Stuk/jszip", color: "#a78bfa" },
              { name: "piexifjs", desc: "Pure JavaScript EXIF parser for JPEG images. Reads, modifies, and removes EXIF, IPTC, and GPS metadata without quality loss or re-encoding.", url: "github.com/hMatoba/piexifjs", color: "#06b6d4" },
            ].map((lib, i) => (
              <div key={i} style={{
                padding: "24px 22px", borderRadius: 18,
                background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
                transition: "all 0.3s ease",
                animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + i * 0.1}s both`,
              }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = `${lib.color}25`}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
              >
                <div style={{ fontSize: 16, fontWeight: 700, color: lib.color, fontFamily: "'JetBrains Mono', monospace", marginBottom: 10 }}>{lib.name}</div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.65, marginBottom: 14 }}>{lib.desc}</p>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{lib.url}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact / feedback */}
        <section style={{
          marginTop: 64, padding: "40px 36px", borderRadius: 24,
          background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
          border: "1px solid rgba(124,58,237,0.1)", textAlign: "center",
          animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
        }}>
          <h3 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
            Questions, feedback, or feature requests?
          </h3>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            MetaStrip is built by one person. I read every message.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
            <button style={{
              padding: "14px 32px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
              fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={(e) => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 0 35px rgba(124,58,237,0.45)"; }}
              onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.3)"; }}
            >hello@metastrip.com</button>
            <button style={{
              padding: "14px 32px", borderRadius: 12, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={(e) => e.target.style.background = "rgba(255,255,255,0.06)"}
              onMouseLeave={(e) => e.target.style.background = "rgba(255,255,255,0.03)"}
            >@metastrip</button>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}

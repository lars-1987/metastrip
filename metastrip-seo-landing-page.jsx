import { useState, useCallback, useRef, useEffect } from "react";

// ============================================================
// SEO LANDING PAGE — "Remove Metadata from Photos"
// Template: swap PAGE_CONFIG for other keyword variants
// ============================================================

const PAGE_CONFIG = {
  slug: "remove-metadata-from-photos",
  keyword: "remove metadata from photos",
  title: "Remove Metadata from Photos",
  subtitle: "Strip GPS coordinates, camera info, AI generation tags, and hidden data from your images — instantly, privately, for free.",
  heroLabel: "FREE TOOL — NO UPLOAD REQUIRED",
  acceptedTypes: ["image/jpeg", "image/png", "image/webp", "image/gif"],
  acceptedLabel: "JPEG · PNG · WebP · GIF",
  // Metadata example shown in the "what's hiding" section
  exampleDevice: "iPhone 15 Pro Max",
  exampleLocation: "Federation Square, Melbourne",
  exampleCoords: "-37.8180° S, 144.9691° E",
};

// --- Other variant configs (not rendered, just for reference) ---
// const PDF_VARIANT = {
//   slug: "remove-author-from-pdf",
//   keyword: "remove author from PDF",
//   title: "Remove Author from PDF",
//   subtitle: "Strip author names, creator apps, timestamps, and hidden properties from PDF files — client-side, no upload.",
//   heroLabel: "FREE TOOL — FILES STAY ON YOUR DEVICE",
//   acceptedTypes: ["application/pdf"],
//   acceptedLabel: "PDF",
// };
// const AI_VARIANT = {
//   slug: "remove-ai-metadata",
//   keyword: "remove AI metadata from images",
//   title: "Remove AI Metadata",
//   subtitle: "Strip C2PA content credentials, XMP AI tags, and generation markers from Midjourney, DALL-E, and Stable Diffusion images.",
//   heroLabel: "STRIP AI FINGERPRINTS — 100% CLIENT-SIDE",
//   acceptedTypes: ["image/jpeg", "image/png", "image/webp"],
//   acceptedLabel: "JPEG · PNG · WebP",
// };

const MOCK_PHOTO_METADATA = [
  { category: "gps", icon: "📍", color: "#ff4d6a", label: "GPS & Location", fields: [
    { key: "GPSLatitude", label: "Latitude", value: "-37.8180° S" },
    { key: "GPSLongitude", label: "Longitude", value: "144.9691° E" },
    { key: "GPSAltitude", label: "Altitude", value: "18m above sea level" },
    { key: "GPSMapDatum", label: "Map Datum", value: "WGS-84" },
  ]},
  { category: "device", icon: "📱", color: "#a78bfa", label: "Device & Camera", fields: [
    { key: "Make", label: "Make", value: "Apple" },
    { key: "Model", label: "Model", value: "iPhone 15 Pro Max" },
    { key: "LensModel", label: "Lens", value: "6.765mm f/1.78" },
    { key: "SerialNumber", label: "Serial №", value: "DNQXK4F..." },
    { key: "ImageWidth", label: "Resolution", value: "4032 × 3024" },
  ]},
  { category: "dates", icon: "📅", color: "#38bdf8", label: "Dates & Times", fields: [
    { key: "DateTimeOriginal", label: "Taken", value: "2025-01-15 14:23:07" },
    { key: "DateTimeDigitized", label: "Digitized", value: "2025-01-15 14:23:07" },
    { key: "DateTime", label: "Modified", value: "2025-02-20 09:11:33" },
  ]},
  { category: "software", icon: "💻", color: "#818cf8", label: "Software", fields: [
    { key: "Software", label: "OS Version", value: "17.2.1" },
    { key: "HostComputer", label: "Host", value: "iPhone 15 Pro Max" },
  ]},
  { category: "author", icon: "👤", color: "#f472b6", label: "Author", fields: [
    { key: "Artist", label: "Artist", value: "Lars K." },
    { key: "Copyright", label: "Copyright", value: "© 2025" },
  ]},
];

function formatBytes(b) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

// ============================================================
// SHARED CHROME (Background, Nav, Footer)
// ============================================================

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)" }} />
      <div style={{
        position: "absolute", width: 650, height: 650, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        top: "-5%", right: "-10%", animation: "orbFloat1 22s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 450, height: 450, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
        bottom: "5%", left: "-5%", animation: "orbFloat2 26s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.05) 0%, transparent 70%)",
        top: "55%", right: "30%", animation: "orbFloat3 18s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", inset: 0, opacity: 0.025,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10,
        background: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 0 20px rgba(124,58,237,0.3)",
      }}>
        <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: -1 }}>M</span>
      </div>
      <span style={{
        fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", fontFamily: "'Outfit', sans-serif",
        background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>MetaStrip</span>
    </div>
  );
}

function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 24px",
      background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Tool", "Pricing", "Blog", "About"].map(link => (
          <span key={link} style={{
            fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
            color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s ease",
          }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
          >{link}</span>
        ))}
        <button style={{
          padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 0 30px rgba(124,58,237,0.5)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 20px rgba(124,58,237,0.3)"; }}
        >Get Batch Pass</button>
      </div>
    </nav>
  );
}

// ============================================================
// INLINE TOOL (simplified single-file version for the landing page)
// ============================================================

function InlineTool() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | scanning | found | stripping | done
  const [isDragOver, setIsDragOver] = useState(false);
  const [visibleFields, setVisibleFields] = useState(0);
  const inputRef = useRef(null);

  const handleFile = useCallback((f) => {
    if (!PAGE_CONFIG.acceptedTypes.includes(f.type)) return;
    setFile(f);
    setStatus("scanning");
    setVisibleFields(0);

    // Simulate scan
    let count = 0;
    const totalFields = MOCK_PHOTO_METADATA.reduce((a, c) => a + c.fields.length, 0);
    const interval = setInterval(() => {
      count++;
      setVisibleFields(count);
      if (count >= totalFields) {
        clearInterval(interval);
        setStatus("found");
      }
    }, 80);
  }, []);

  const handleStrip = () => {
    setStatus("stripping");
    setTimeout(() => setStatus("done"), 1400);
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setVisibleFields(0);
  };

  // Count fields shown so far
  let fieldCounter = 0;

  return (
    <div style={{
      borderRadius: 24, overflow: "hidden",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both",
    }}>
      {/* Drop zone or file display */}
      {!file ? (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault(); setIsDragOver(false);
            const f = Array.from(e.dataTransfer.files)[0];
            if (f) handleFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          style={{
            padding: "52px 40px", textAlign: "center", cursor: "pointer",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: isDragOver ? "rgba(124,58,237,0.04)" : "transparent",
            transition: "all 0.3s ease",
          }}
        >
          <input ref={inputRef} type="file" accept={PAGE_CONFIG.acceptedTypes.join(",")} style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
          <div style={{
            width: 64, height: 64, borderRadius: 18, margin: "0 auto 18px",
            background: "linear-gradient(135deg, rgba(124,58,237,0.12), rgba(6,182,212,0.08))",
            border: "1px solid rgba(124,58,237,0.12)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: isDragOver ? "iconBounce 0.6s ease-in-out infinite" : "none",
          }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.7)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
          </div>
          <p style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 6 }}>
            Drop a photo here to try it
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif" }}>
            {PAGE_CONFIG.acceptedLabel} — max 25 MB — free, no account
          </p>
        </div>
      ) : (
        <>
          {/* File header */}
          <div style={{
            padding: "16px 24px", display: "flex", alignItems: "center", gap: 14,
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            background: status === "done" ? "rgba(34,197,94,0.03)" : "transparent",
            transition: "background 0.5s ease",
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: status === "done" ? "rgba(34,197,94,0.1)" : "rgba(124,58,237,0.08)",
              border: `1px solid ${status === "done" ? "rgba(34,197,94,0.15)" : "rgba(124,58,237,0.12)"}`,
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
              transition: "all 0.4s ease",
            }}>
              {status === "done" ? "✓" : (status === "stripping" ?
                <div style={{ width: 16, height: 16, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                : "🖼")}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {file.name}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
                {formatBytes(file.size)}
                {status === "found" && <span style={{ color: "#f87171", marginLeft: 8 }}>⚠ {MOCK_PHOTO_METADATA.reduce((a, c) => a + c.fields.length, 0)} metadata fields exposed</span>}
                {status === "done" && <span style={{ color: "#4ade80", marginLeft: 8 }}>✓ All metadata stripped</span>}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              {status === "found" && (
                <button onClick={handleStrip} style={{
                  padding: "8px 20px", borderRadius: 10, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
                  fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                  boxShadow: "0 0 15px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
                  transition: "all 0.2s ease",
                }}
                  onMouseEnter={(e) => e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.5)"}
                  onMouseLeave={(e) => e.target.style.boxShadow = "0 0 15px rgba(124,58,237,0.3)"}
                >Strip All</button>
              )}
              {status === "done" && (
                <button style={{
                  padding: "8px 20px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)",
                  background: "rgba(34,197,94,0.08)", cursor: "pointer", color: "#4ade80",
                  fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                }}>↓ Download Clean</button>
              )}
              <button onClick={handleReset} style={{
                width: 34, height: 34, borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                background: "transparent", cursor: "pointer", color: "rgba(255,255,255,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}
                onMouseEnter={(e) => { e.target.style.color = "#f87171"; e.target.style.borderColor = "rgba(248,113,113,0.2)"; }}
                onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.3)"; e.target.style.borderColor = "rgba(255,255,255,0.06)"; }}
              >×</button>
            </div>
          </div>

          {/* Metadata categories */}
          <div style={{ padding: "8px 0" }}>
            {MOCK_PHOTO_METADATA.map((cat) => {
              const catFields = cat.fields.map((f) => {
                fieldCounter++;
                return { ...f, visible: fieldCounter <= visibleFields };
              });
              const anyVisible = catFields.some(f => f.visible);
              if (!anyVisible && status === "scanning") return null;

              return (
                <div key={cat.category} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                  <div style={{ padding: "11px 24px", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14 }}>{cat.icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.6)", fontFamily: "'Outfit', sans-serif" }}>{cat.label}</span>
                    <span style={{
                      fontSize: 10, padding: "2px 8px", borderRadius: 6,
                      background: `${cat.color}12`, color: cat.color,
                      fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
                    }}>{catFields.filter(f => f.visible).length}</span>
                  </div>
                  <div style={{ padding: "0 24px 10px 48px" }}>
                    {catFields.map((field, i) => (
                      field.visible && (
                        <div key={i} style={{
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                          padding: "5px 0",
                          animation: "fieldFadeIn 0.2s ease both",
                          opacity: status === "done" ? 0.4 : 1,
                          transition: "opacity 0.5s ease",
                        }}>
                          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif" }}>{field.label}</span>
                          <span style={{
                            fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                            color: status === "done" ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.55)",
                            textDecoration: status === "done" ? "line-through" : "none",
                            transition: "all 0.4s ease",
                          }}>{field.value}</span>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Batch upsell */}
          {status === "done" && (
            <div style={{
              margin: "0 16px 16px", padding: "16px 20px", borderRadius: 14,
              background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
              border: "1px solid rgba(124,58,237,0.1)",
              display: "flex", alignItems: "center", justifyContent: "space-between",
              animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
            }}>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif" }}>
                  Need to strip more photos?
                </p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>
                  Batch pass: up to 50 images, selective removal, audit report — $2.99
                </p>
              </div>
              <button style={{
                padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
                fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif", flexShrink: 0,
                boxShadow: "0 0 12px rgba(124,58,237,0.25)",
              }}>Get Batch Pass</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================
// "WHAT'S HIDING IN YOUR PHOTOS?" — visual metadata explainer
// ============================================================

function MetadataExplainer() {
  const [activeTab, setActiveTab] = useState("location");

  const tabs = [
    {
      id: "location", label: "Location", icon: "📍", color: "#ff4d6a",
      title: "Your exact coordinates",
      description: "Every photo taken with a smartphone embeds GPS coordinates accurate to a few meters. Share a photo of your front door and anyone can extract your home address.",
      example: { label: "What's hidden", value: PAGE_CONFIG.exampleCoords },
      risk: "Someone can find your home, workplace, or daily routine from photos you share online.",
    },
    {
      id: "device", label: "Device", icon: "📱", color: "#a78bfa",
      title: "Your device identity",
      description: "Camera make, model, lens info, and sometimes serial numbers are embedded in every shot. This creates a unique fingerprint that can link anonymous photos back to your device.",
      example: { label: "What's hidden", value: PAGE_CONFIG.exampleDevice + " — S/N: DNQXK4F..." },
      risk: "Multiple 'anonymous' photos can be linked to the same device — and therefore to you.",
    },
    {
      id: "timestamps", label: "Timestamps", icon: "📅", color: "#38bdf8",
      title: "When you were there",
      description: "Creation dates, modification dates, and timezone offsets reveal not just when a photo was taken, but your patterns — when you're home, at work, or traveling.",
      example: { label: "What's hidden", value: "2025-01-15 14:23:07 +11:00 (AEDT)" },
      risk: "Combined with location data, timestamps map your daily movements with precision.",
    },
    {
      id: "ai", label: "AI Tags", icon: "🤖", color: "#c084fc",
      title: "AI generation fingerprints",
      description: "Images from Midjourney, DALL-E, Stable Diffusion, and Adobe Firefly now embed C2PA content credentials and XMP AI metadata that permanently mark them as AI-generated.",
      example: { label: "What's hidden", value: "c2pa.ai_generated: true | tool: midjourney-v6" },
      risk: "Social platforms and search engines are beginning to flag and demote AI-tagged content automatically.",
    },
  ];

  const active = tabs.find(t => t.id === activeTab);

  return (
    <div style={{ animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
      {/* Tab bar */}
      <div style={{
        display: "flex", gap: 6, marginBottom: 20,
        padding: 4, borderRadius: 14,
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.05)",
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "rgba(255,255,255,0.05)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
              transition: "all 0.25s ease",
            }}
            onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 14 }}>{tab.icon}</span>
            <span style={{
              fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
              color: activeTab === tab.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)",
              transition: "color 0.2s ease",
            }}>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {active && (
        <div key={active.id} style={{
          borderRadius: 20, overflow: "hidden",
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.06)",
          animation: "panelFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{ padding: "32px 28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 24 }}>{active.icon}</span>
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>
                {active.title}
              </h3>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7, marginBottom: 20, maxWidth: 560 }}>
              {active.description}
            </p>

            {/* Example data box */}
            <div style={{
              padding: "14px 18px", borderRadius: 12,
              background: "rgba(0,0,0,0.3)",
              border: "1px solid rgba(255,255,255,0.05)",
              marginBottom: 16,
            }}>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", marginBottom: 6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                {active.example.label}
              </div>
              <div style={{ fontSize: 14, color: active.color, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
                {active.example.value}
              </div>
            </div>

            {/* Risk callout */}
            <div style={{
              display: "flex", gap: 10, padding: "12px 16px", borderRadius: 12,
              background: "rgba(248,113,113,0.04)",
              border: "1px solid rgba(248,113,113,0.08)",
            }}>
              <span style={{ fontSize: 14, flexShrink: 0, marginTop: 1 }}>⚠️</span>
              <p style={{ fontSize: 13, color: "rgba(248,113,113,0.7)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
                {active.risk}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================
// HOW IT WORKS — 3-step visual flow
// ============================================================

function HowItWorks() {
  const steps = [
    {
      number: "01", title: "Drop your photo",
      desc: "Drag and drop or click to select. Your file stays in your browser — nothing gets uploaded anywhere.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
        </svg>
      ),
    },
    {
      number: "02", title: "See what's hidden",
      desc: "MetaStrip scans and displays every piece of metadata — GPS, device info, timestamps, AI tags, author data.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      number: "03", title: "Download clean",
      desc: "One click strips all metadata. Download your clean file instantly — no watermarks, no quality loss.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
        </svg>
      ),
    },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {steps.map((step, i) => (
        <div key={i} style={{
          position: "relative", padding: "32px 24px", borderRadius: 20,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.3s ease",
          animation: `cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.12}s both`,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          <span style={{
            position: "absolute", top: 20, right: 20,
            fontSize: 48, fontWeight: 800, fontFamily: "'Outfit', sans-serif",
            color: "rgba(255,255,255,0.03)", lineHeight: 1,
          }}>{step.number}</span>
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 20,
            background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{step.icon}</div>
          <h3 style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 8, letterSpacing: "-0.01em" }}>
            {step.title}
          </h3>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>
            {step.desc}
          </p>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// SUPPORTED FORMATS SECTION
// ============================================================

function SupportedFormats() {
  const formats = [
    { ext: "JPEG", desc: "EXIF, IPTC, XMP, GPS, thumbnails", color: "#a78bfa" },
    { ext: "PNG", desc: "tEXt, iTXt, zTXt chunks, XMP", color: "#38bdf8" },
    { ext: "WebP", desc: "EXIF, XMP metadata", color: "#4ade80" },
    { ext: "GIF", desc: "Comment blocks, XMP", color: "#fbbf24" },
  ];

  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
      {formats.map((f, i) => (
        <div key={i} style={{
          padding: "20px 18px", borderRadius: 14,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          textAlign: "center", transition: "all 0.3s ease",
          animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + i * 0.08}s both`,
        }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = `${f.color}30`}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"}
        >
          <div style={{
            fontSize: 18, fontWeight: 700, color: f.color, fontFamily: "'JetBrains Mono', monospace",
            marginBottom: 6, letterSpacing: "0.02em",
          }}>.{f.ext.toLowerCase()}</div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// MAIN PAGE
// ============================================================

export default function SEOLandingPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(40px, 30px) scale(1.05); } 66% { transform: translate(-20px, -15px) scale(0.95); } }
        @keyframes orbFloat2 { 0%, 100% { transform: translate(0, 0) scale(1); } 33% { transform: translate(-30px, -40px) scale(1.08); } 66% { transform: translate(25px, 20px) scale(0.92); } }
        @keyframes orbFloat3 { 0%, 100% { transform: translate(0, 0); } 50% { transform: translate(50px, -30px); } }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes panelFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fieldFadeIn { from { opacity: 0; transform: translateX(-8px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes iconBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      <AnimatedBackground />
      <Nav />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 880, margin: "0 auto", padding: "110px 24px 80px" }}>

        {/* ===== HERO ===== */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <div style={{
            display: "inline-block", marginBottom: 16, padding: "5px 16px", borderRadius: 100,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)",
          }}>
            <span style={{ fontSize: 12, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>
              {PAGE_CONFIG.heroLabel}
            </span>
          </div>
          <h1 style={{
            fontSize: 46, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif", marginBottom: 16,
            background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
            backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            {PAGE_CONFIG.title}
          </h1>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 540, margin: "0 auto",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.7,
          }}>
            {PAGE_CONFIG.subtitle}
          </p>
        </div>

        {/* ===== INLINE TOOL ===== */}
        <InlineTool />

        {/* ===== WHAT'S HIDING ===== */}
        <section style={{ marginTop: 80 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6,
            fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em",
          }}>
            What's hiding in your photos?
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32,
            fontFamily: "'Outfit', sans-serif",
          }}>
            More than you think. Tap each category to see real examples.
          </p>
          <MetadataExplainer />
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section style={{ marginTop: 80 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6,
            fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em",
          }}>
            How it works
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Three steps. No account. No upload. No cost.
          </p>
          <HowItWorks />
        </section>

        {/* ===== SUPPORTED FORMATS ===== */}
        <section style={{ marginTop: 80 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 6,
            fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em",
          }}>
            Supported formats
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Deep metadata scanning for all major image formats
          </p>
          <SupportedFormats />
        </section>

        {/* ===== SEO CONTENT ===== */}
        <section style={{
          marginTop: 80, maxWidth: 640, marginLeft: "auto", marginRight: "auto",
          animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
        }}>
          <div style={{
            padding: "36px 32px", borderRadius: 20,
            background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
          }}>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 16, letterSpacing: "-0.02em" }}>
              Why remove metadata from photos before sharing?
            </h2>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.8 }}>
              <p style={{ marginBottom: 14 }}>
                Every digital photo carries invisible data called EXIF metadata. This includes your exact GPS location when the photo was taken, the device you used, your name (if set in your phone's settings), and precise timestamps.
              </p>
              <p style={{ marginBottom: 14 }}>
                When you share photos on social media, send them via email, or upload them to websites, this metadata often travels with the file. While some platforms strip metadata on upload, many don't — and even those that do may retain it internally.
              </p>
              <p style={{ marginBottom: 14 }}>
                MetaStrip removes all embedded metadata from your photos before you share them. Unlike other tools, MetaStrip processes files entirely in your browser — your photos are never uploaded to any server. This makes it the most private way to strip metadata from images.
              </p>
              <p>
                For photographers, creators, and anyone sharing images online, removing metadata is an essential privacy step. MetaStrip makes it instant, free, and completely private.
              </p>
            </div>
          </div>
        </section>

        {/* ===== BOTTOM CTA ===== */}
        <div style={{
          textAlign: "center", marginTop: 64,
          padding: "48px 36px", borderRadius: 24,
          background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)",
          border: "1px solid rgba(124,58,237,0.1)",
        }}>
          <h3 style={{ fontSize: 26, fontWeight: 700, marginBottom: 10, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)", letterSpacing: "-0.02em" }}>
            Need to strip more than one photo?
          </h3>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", marginBottom: 24, fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            Batch passes let you process up to 50 images at once with selective removal and a full audit report.
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
            >Image Batch — $2.99</button>
            <button style={{
              padding: "14px 32px", borderRadius: 12, cursor: "pointer",
              border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.03)",
              color: "rgba(255,255,255,0.7)", fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              transition: "all 0.25s ease",
            }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(255,255,255,0.06)"; e.target.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.03)"; e.target.style.transform = "translateY(0)"; }}
            >View Pricing</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 1, textAlign: "center",
        padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
          {["Tool", "Pricing", "Blog", "About", "Privacy"].map(link => (
            <span key={link} style={{
              fontSize: 13, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif",
              cursor: "pointer", transition: "color 0.2s ease",
            }}
              onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.6)"}
              onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.3)"}
            >{link}</span>
          ))}
        </div>
        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.15)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          Made with ☕ in Melbourne
        </p>
      </footer>
    </>
  );
}

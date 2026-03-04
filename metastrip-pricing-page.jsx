import { useState, useEffect } from "react";

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "For quick single-file cleanup",
    price: null,
    priceLabel: "Free forever",
    accent: "rgba(255,255,255,0.5)",
    accentSolid: "#94a3b8",
    bgGradient: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
    borderColor: "rgba(255,255,255,0.06)",
    cta: "Start Stripping",
    ctaBg: "rgba(255,255,255,0.06)",
    ctaColor: "rgba(255,255,255,0.7)",
    ctaHoverBg: "rgba(255,255,255,0.1)",
    popular: false,
    features: [
      { text: "Single file at a time", included: true },
      { text: "Images only (JPEG, PNG, WebP)", included: true },
      { text: "Complete metadata removal", included: true },
      { text: "Up to 25 MB per file", included: true },
      { text: "5 files per day", included: true },
      { text: "Selective stripping options", included: false },
      { text: "Batch processing", included: false },
      { text: "Metadata audit report", included: false },
    ],
  },
  {
    id: "image",
    name: "Image Batch",
    tagline: "For photographers & creators",
    price: 2.99,
    priceLabel: "one-time",
    accent: "#a78bfa",
    accentSolid: "#a78bfa",
    bgGradient: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.03) 100%)",
    borderColor: "rgba(124,58,237,0.2)",
    cta: "Get Image Pass",
    ctaBg: "linear-gradient(135deg, #7c3aed, #6d28d9)",
    ctaColor: "#fff",
    ctaHoverBg: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    popular: true,
    features: [
      { text: "Up to 50 images per batch", included: true },
      { text: "All image formats", included: true },
      { text: "Complete or selective removal", included: true },
      { text: "Up to 50 MB per file", included: true },
      { text: "No daily limits", included: true },
      { text: "Choose what to strip", included: true },
      { text: "Batch ZIP download", included: true },
      { text: "Metadata audit report (PDF)", included: true },
    ],
  },
  {
    id: "document",
    name: "Document Batch",
    tagline: "For legal, HR & compliance",
    price: 4.99,
    priceLabel: "one-time",
    accent: "#06b6d4",
    accentSolid: "#06b6d4",
    bgGradient: "linear-gradient(135deg, rgba(6,182,212,0.06) 0%, rgba(124,58,237,0.03) 100%)",
    borderColor: "rgba(6,182,212,0.2)",
    cta: "Get Document Pass",
    ctaBg: "linear-gradient(135deg, #0891b2, #0e7490)",
    ctaColor: "#fff",
    ctaHoverBg: "linear-gradient(135deg, #06b6d4, #0891b2)",
    popular: false,
    features: [
      { text: "Up to 25 documents per batch", included: true },
      { text: "PDF, DOCX, XLSX, PPTX", included: true },
      { text: "Complete or selective removal", included: true },
      { text: "Up to 50 MB per file", included: true },
      { text: "No daily limits", included: true },
      { text: "Strip comments & tracked changes", included: true },
      { text: "Batch ZIP download", included: true },
      { text: "Metadata audit report (PDF)", included: true },
    ],
  },
];

const FAQ_ITEMS = [
  {
    q: "What's a batch pass?",
    a: "A batch pass is a one-time purchase that unlocks batch processing for a set number of files. No subscription, no account needed. Buy it, use it, done.",
  },
  {
    q: "Do I need to create an account?",
    a: "No. We use Stripe for payment — you just enter your email for the receipt. No passwords, no profiles, no tracking.",
  },
  {
    q: "Do my files get uploaded to your servers?",
    a: "Never. All processing happens in your browser using JavaScript. Your files stay on your device the entire time. We literally cannot see them.",
  },
  {
    q: "What metadata do you remove?",
    a: "GPS coordinates, camera/device info, author names, timestamps, software details, AI generation tags (C2PA, XMP), document comments, tracked changes, and custom properties. With a batch pass, you choose exactly what to strip.",
  },
  {
    q: "What's the difference between free and paid?",
    a: "Free strips everything from one image at a time — no choices, just nuke it all. Batch passes let you process many files at once, choose which metadata categories to keep or remove, and get a detailed audit report of everything that was found.",
  },
  {
    q: "Can I buy multiple batch passes?",
    a: "Absolutely. Each pass is independent. If you regularly need batch processing, we'll be launching a Pro subscription soon with unlimited monthly batches.",
  },
  {
    q: "What about video and audio files?",
    a: "Coming soon. Video and audio metadata stripping requires more processing power, so it'll be available in a future update.",
  },
];

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)",
      }} />
      <div style={{
        position: "absolute", width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 70%)",
        top: "5%", left: "50%", transform: "translateX(-50%)",
        animation: "orbFloat1 22s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 400, height: 400, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.07) 0%, transparent 70%)",
        bottom: "10%", left: "10%",
        animation: "orbFloat2 28s ease-in-out infinite",
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
        fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em",
        fontFamily: "'Outfit', sans-serif",
        background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
      }}>MetaStrip</span>
    </div>
  );
}

function Nav() {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "16px 24px",
      background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Tool", "Pricing", "Blog", "About"].map((link, i) => (
          <span key={link} style={{
            fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
            color: link === "Pricing" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)",
            cursor: "pointer", transition: "color 0.2s ease",
            position: "relative",
          }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = link === "Pricing" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
          >
            {link}
            {link === "Pricing" && <div style={{
              position: "absolute", bottom: -4, left: 0, right: 0, height: 2,
              background: "linear-gradient(90deg, #7c3aed, #06b6d4)", borderRadius: 1,
            }} />}
          </span>
        ))}
      </div>
    </nav>
  );
}

function CheckIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PricingCard({ plan, index }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 24, overflow: "hidden",
        background: plan.bgGradient,
        border: `1px solid ${hovered ? plan.borderColor : "rgba(255,255,255,0.06)"}`,
        padding: plan.popular ? "2px" : "0",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-4px)" : "translateY(0)",
        animation: `cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + index * 0.12}s both`,
      }}
    >
      {/* Popular gradient border */}
      {plan.popular && (
        <div style={{
          position: "absolute", inset: 0, borderRadius: 24, padding: 1,
          background: "linear-gradient(135deg, #7c3aed, #06b6d4, #7c3aed)",
          backgroundSize: "200% 200%",
          animation: "gradientShift 4s ease infinite",
          WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
          pointerEvents: "none",
        }} />
      )}

      <div style={{
        position: "relative",
        borderRadius: plan.popular ? 22 : 24,
        background: plan.popular
          ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(9,9,11,0.98) 30%)"
          : "transparent",
        padding: "36px 28px 32px",
      }}>
        {/* Popular badge */}
        {plan.popular && (
          <div style={{
            position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)",
            padding: "5px 20px", borderRadius: "0 0 12px 12px",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            boxShadow: "0 4px 15px rgba(124,58,237,0.3)",
          }}>
            <span style={{
              fontSize: 10, fontWeight: 700, color: "#fff",
              fontFamily: "'JetBrains Mono', monospace",
              letterSpacing: "0.1em", textTransform: "uppercase",
            }}>
              Most Popular
            </span>
          </div>
        )}

        {/* Plan name */}
        <div style={{ marginBottom: 4 }}>
          <span style={{
            fontSize: 13, fontWeight: 600, color: plan.accentSolid,
            fontFamily: "'JetBrains Mono', monospace",
            letterSpacing: "0.04em",
          }}>
            {plan.name}
          </span>
        </div>

        {/* Tagline */}
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.35)",
          fontFamily: "'Outfit', sans-serif",
          marginBottom: 24, lineHeight: 1.4,
        }}>
          {plan.tagline}
        </p>

        {/* Price */}
        <div style={{ marginBottom: 28 }}>
          {plan.price !== null ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span style={{
                fontSize: 14, color: "rgba(255,255,255,0.4)",
                fontFamily: "'Outfit', sans-serif", fontWeight: 500,
                alignSelf: "flex-start", paddingTop: 8,
              }}>$</span>
              <span style={{
                fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em",
                fontFamily: "'Outfit', sans-serif",
                color: "rgba(255,255,255,0.95)",
                lineHeight: 1,
              }}>
                {plan.price.toFixed(2).split(".")[0]}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                <span style={{
                  fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.95)",
                  fontFamily: "'Outfit', sans-serif", lineHeight: 1,
                }}>
                  .{plan.price.toFixed(2).split(".")[1]}
                </span>
                <span style={{
                  fontSize: 11, color: "rgba(255,255,255,0.3)",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {plan.priceLabel}
                </span>
              </div>
            </div>
          ) : (
            <div>
              <span style={{
                fontSize: 56, fontWeight: 800, letterSpacing: "-0.04em",
                fontFamily: "'Outfit', sans-serif",
                background: "linear-gradient(135deg, rgba(255,255,255,0.7), rgba(255,255,255,0.4))",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                lineHeight: 1,
              }}>
                $0
              </span>
              <div style={{
                fontSize: 11, color: "rgba(255,255,255,0.3)",
                fontFamily: "'JetBrains Mono', monospace", marginTop: 4,
              }}>
                {plan.priceLabel}
              </div>
            </div>
          )}
        </div>

        {/* No subscription callout */}
        {plan.price !== null && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "5px 12px", borderRadius: 8, marginBottom: 24,
            background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.1)",
          }}>
            <span style={{ fontSize: 12 }}>🚫</span>
            <span style={{
              fontSize: 11, color: "#4ade80",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
            }}>
              No subscription — pay once, use it
            </span>
          </div>
        )}

        {/* CTA button */}
        <button style={{
          width: "100%", padding: "14px 24px", borderRadius: 14,
          border: plan.price ? "none" : "1px solid rgba(255,255,255,0.1)",
          background: plan.ctaBg, color: plan.ctaColor,
          fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          cursor: "pointer", transition: "all 0.25s ease",
          boxShadow: plan.popular ? "0 0 25px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)" : "none",
          marginBottom: 28,
          letterSpacing: "0.01em",
        }}
          onMouseEnter={(e) => {
            if (plan.popular) e.target.style.boxShadow = "0 0 35px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)";
            e.target.style.transform = "translateY(-1px)";
          }}
          onMouseLeave={(e) => {
            if (plan.popular) e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          {plan.cta}
        </button>

        {/* Feature list */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {plan.features.map((feature, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                background: feature.included ? `${plan.accentSolid}12` : "rgba(255,255,255,0.02)",
                border: `1px solid ${feature.included ? `${plan.accentSolid}20` : "rgba(255,255,255,0.04)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {feature.included ? <CheckIcon color={plan.accentSolid} /> : <XIcon />}
              </div>
              <span style={{
                fontSize: 13, fontFamily: "'Outfit', sans-serif",
                color: feature.included ? "rgba(255,255,255,0.65)" : "rgba(255,255,255,0.2)",
                lineHeight: 1.3,
              }}>
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ComparisonRow({ label, free, image, doc, isHeader }) {
  if (isHeader) {
    return (
      <div style={{
        display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
        padding: "14px 20px", gap: 12,
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(255,255,255,0.02)",
        borderRadius: "14px 14px 0 0",
      }}>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: "center" }}>{free}</span>
        <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: "center" }}>{image}</span>
        <span style={{ fontSize: 12, color: "#06b6d4", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textAlign: "center" }}>{doc}</span>
      </div>
    );
  }
  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
      padding: "12px 20px", gap: 12,
      borderBottom: "1px solid rgba(255,255,255,0.03)",
    }}>
      <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", fontFamily: "'Outfit', sans-serif" }}>{label}</span>
      <div style={{ textAlign: "center" }}>{typeof free === "boolean" ? (free ? <CheckIcon color="#94a3b8" /> : <XIcon />) :
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{free}</span>
      }</div>
      <div style={{ textAlign: "center" }}>{typeof image === "boolean" ? (image ? <CheckIcon color="#a78bfa" /> : <XIcon />) :
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{image}</span>
      }</div>
      <div style={{ textAlign: "center" }}>{typeof doc === "boolean" ? (doc ? <CheckIcon color="#06b6d4" /> : <XIcon />) :
        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", fontFamily: "'JetBrains Mono', monospace" }}>{doc}</span>
      }</div>
    </div>
  );
}

function FAQItem({ item, index, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderRadius: 16, overflow: "hidden",
        background: isOpen ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)",
        border: `1px solid ${isOpen ? "rgba(124,58,237,0.12)" : "rgba(255,255,255,0.04)"}`,
        transition: "all 0.3s ease",
        animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.06}s both`,
      }}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%", padding: "18px 22px", border: "none", cursor: "pointer",
          background: "transparent",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
        }}
        onMouseEnter={(e) => e.currentTarget.parentElement.style.background = "rgba(255,255,255,0.035)"}
        onMouseLeave={(e) => e.currentTarget.parentElement.style.background = isOpen ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.015)"}
      >
        <span style={{
          fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.8)",
          fontFamily: "'Outfit', sans-serif", textAlign: "left",
        }}>
          {item.q}
        </span>
        <span style={{
          color: "#a78bfa", fontSize: 18, flexShrink: 0, lineHeight: 1,
          transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
          transition: "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>+</span>
      </button>
      <div style={{
        maxHeight: isOpen ? 200 : 0,
        opacity: isOpen ? 1 : 0,
        overflow: "hidden",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}>
        <div style={{ padding: "0 22px 20px" }}>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.4)",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.7,
          }}>
            {item.a}
          </p>
        </div>
      </div>
    </div>
  );
}

function TrustBar() {
  const items = [
    { icon: "🔒", label: "Files never uploaded" },
    { icon: "🚫", label: "No account required" },
    { icon: "💳", label: "No subscription" },
    { icon: "🛡️", label: "Stripe-secured payments" },
  ];
  return (
    <div style={{
      display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap",
      padding: "20px 0",
      animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both",
    }}>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>{item.icon}</span>
          <span style={{
            fontSize: 12, color: "rgba(255,255,255,0.35)",
            fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }
        @keyframes orbFloat1 {
          0%, 100% { transform: translateX(-50%) translate(0, 0) scale(1); }
          33% { transform: translateX(-50%) translate(40px, 30px) scale(1.05); }
          66% { transform: translateX(-50%) translate(-20px, -15px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -40px) scale(1.08); }
          66% { transform: translate(25px, 20px) scale(0.92); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes priceCountUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      <AnimatedBackground />
      <Nav />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto", padding: "110px 24px 80px",
      }}>
        {/* Hero */}
        <div style={{
          textAlign: "center", marginBottom: 20,
          animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            display: "inline-block", marginBottom: 16,
            padding: "5px 16px", borderRadius: 100,
            background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)",
          }}>
            <span style={{
              fontSize: 12, color: "#a78bfa",
              fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
              letterSpacing: "0.05em",
            }}>
              SIMPLE PRICING
            </span>
          </div>
          <h1 style={{
            fontSize: 48, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif", marginBottom: 16,
            background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 60%, #06b6d4 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            No subscriptions.<br />No gotchas.
          </h1>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 480, margin: "0 auto",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.7,
          }}>
            Free for single files. Buy a batch pass when you need more —
            use it once, no recurring charges, no account needed.
          </p>
        </div>

        {/* Trust bar */}
        <TrustBar />

        {/* Pricing cards */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: 20, marginTop: 32, alignItems: "start",
        }}>
          {PLANS.map((plan, i) => (
            <PricingCard key={plan.id} plan={plan} index={i} />
          ))}
        </div>

        {/* "Less than a coffee" callout */}
        <div style={{
          textAlign: "center", marginTop: 40,
          animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.7s both",
        }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 10,
            padding: "12px 24px", borderRadius: 14,
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.05)",
          }}>
            <span style={{ fontSize: 20 }}>☕</span>
            <span style={{
              fontSize: 14, color: "rgba(255,255,255,0.45)",
              fontFamily: "'Outfit', sans-serif",
            }}>
              Less than a flat white. Strip metadata from 50 files.
            </span>
          </div>
        </div>

        {/* Comparison table */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8,
            fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.02em",
          }}>
            Full Comparison
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Everything you get at each tier
          </p>

          <div style={{
            borderRadius: 16, overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.06)",
            background: "rgba(255,255,255,0.01)",
            animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
          }}>
            <ComparisonRow label="Feature" free="Free" image="Image Batch" doc="Doc Batch" isHeader />
            <ComparisonRow label="Price" free="$0" image="$2.99" doc="$4.99" />
            <ComparisonRow label="Files per batch" free="1" image="50" doc="25" />
            <ComparisonRow label="Max file size" free="25 MB" image="50 MB" doc="50 MB" />
            <ComparisonRow label="Images (JPEG, PNG, WebP)" free={true} image={true} doc={false} />
            <ComparisonRow label="Documents (PDF, DOCX, XLSX, PPTX)" free={false} image={false} doc={true} />
            <ComparisonRow label="Complete metadata removal" free={true} image={true} doc={true} />
            <ComparisonRow label="Selective stripping" free={false} image={true} doc={true} />
            <ComparisonRow label="GPS / location removal" free={true} image={true} doc={false} />
            <ComparisonRow label="AI tag removal (C2PA, XMP)" free={true} image={true} doc={false} />
            <ComparisonRow label="Comments & tracked changes" free={false} image={false} doc={true} />
            <ComparisonRow label="Batch ZIP download" free={false} image={true} doc={true} />
            <ComparisonRow label="Metadata audit report" free={false} image={true} doc={true} />
            <ComparisonRow label="Daily limit" free="5/day" image="None" doc="None" />
            <ComparisonRow label="Account required" free="No" image="No" doc="No" />
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginTop: 80 }}>
          <h2 style={{
            fontSize: 28, fontWeight: 700, textAlign: "center", marginBottom: 8,
            fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.9)",
            letterSpacing: "-0.02em",
          }}>
            Questions?
          </h2>
          <p style={{
            fontSize: 14, color: "rgba(255,255,255,0.35)", textAlign: "center", marginBottom: 32,
            fontFamily: "'Outfit', sans-serif",
          }}>
            Everything you need to know about MetaStrip
          </p>

          <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
            {FAQ_ITEMS.map((item, i) => (
              <FAQItem
                key={i}
                item={item}
                index={i}
                isOpen={openFaq === i}
                onToggle={() => setOpenFaq(openFaq === i ? null : i)}
              />
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div style={{
          textAlign: "center", marginTop: 80,
          padding: "56px 40px", borderRadius: 24,
          background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.04) 100%)",
          border: "1px solid rgba(124,58,237,0.1)",
          animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both",
        }}>
          <h3 style={{
            fontSize: 32, fontWeight: 700, marginBottom: 12,
            fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em",
            color: "rgba(255,255,255,0.9)",
          }}>
            Ready to clean up?
          </h3>
          <p style={{
            fontSize: 15, color: "rgba(255,255,255,0.4)", marginBottom: 28, maxWidth: 420, margin: "0 auto 28px",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.6,
          }}>
            Start with the free tier — no account, no credit card. Upgrade to a batch pass only when you need it.
          </p>
          <button style={{
            padding: "16px 40px", borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
            color: "#fff", fontSize: 16, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 0 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            transition: "all 0.25s ease", letterSpacing: "0.01em",
          }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 0 40px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 0 30px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)";
            }}
          >
            Open MetaStrip — It's Free
          </button>
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
            >
              {link}
            </span>
          ))}
        </div>
        <p style={{
          fontSize: 12, color: "rgba(255,255,255,0.15)",
          fontFamily: "'JetBrains Mono', monospace",
        }}>
          MetaStrip — Your files never leave your device. Built in Melbourne.
        </p>
      </footer>
    </>
  );
}

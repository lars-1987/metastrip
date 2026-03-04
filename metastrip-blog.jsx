import { useState, useEffect, useRef } from "react";

// ============================================================
// MOCK BLOG DATA
// ============================================================

const CATEGORIES = [
  { id: "all", label: "All Posts" },
  { id: "privacy", label: "Privacy" },
  { id: "guides", label: "Guides" },
  { id: "technical", label: "Technical" },
  { id: "news", label: "News" },
];

const ARTICLES = [
  {
    id: "metadata-privacy-risks",
    slug: "what-metadata-reveals-about-you",
    title: "What Your Photo Metadata Reveals About You (And How to Stop It)",
    excerpt: "Every photo you take carries invisible data — GPS coordinates, device serial numbers, timestamps, and more. Here's exactly what's exposed and why it matters.",
    category: "privacy",
    date: "Feb 28, 2026",
    readTime: "8 min read",
    featured: true,
    tags: ["EXIF", "GPS", "privacy", "photos"],
    coverGradient: "linear-gradient(135deg, #7c3aed 0%, #06b6d4 100%)",
    coverIcon: "📍",
    content: {
      intro: "You snapped a photo of your morning coffee, posted it to a forum, and moved on. What you didn't realize is that the image file you uploaded contained your exact home coordinates, your phone's serial number, and the precise second the photo was taken. Welcome to the world of photo metadata.",
      sections: [
        {
          heading: "What is photo metadata?",
          body: "Every digital photo contains embedded data called EXIF (Exchangeable Image File Format) metadata. Originally designed in 1995 to help photographers catalogue their work, EXIF has become one of the most significant — and least understood — privacy risks in everyday digital life.\n\nWhen your smartphone takes a photo, it automatically records dozens of data points and embeds them directly into the image file. This data is invisible when you view the photo, but trivially easy to extract with free tools or a simple right-click in most operating systems.",
        },
        {
          heading: "The data hiding in your photos",
          body: "A typical smartphone photo contains the following metadata:\n\nGPS coordinates accurate to 3-5 meters — enough to identify your exact address, workplace, or any other location. Device make, model, and sometimes serial number — creating a unique fingerprint that links all your photos to one device. Timestamps with timezone offsets — revealing not just when, but your timezone and daily patterns. Camera settings like focal length, aperture, and ISO — less sensitive, but part of the full picture. Software information — which app processed the photo and what edits were made.\n\nFor photos processed through AI tools or edited in Lightroom, additional XMP and IPTC metadata layers add creator names, editing history, keywords, and AI generation tags.",
        },
        {
          heading: "Real-world consequences",
          body: "This isn't theoretical. In 2012, tech journalist John McAfee was located by authorities in Guatemala after a Vice magazine reporter posted a photo with intact GPS metadata. In 2023, multiple real estate listing photos were found to contain agent home addresses embedded in EXIF data.\n\nMore commonly, people unknowingly share their home address every time they post a photo taken at home to forums, dating profiles, marketplace listings, or community groups. A stalker, scammer, or anyone curious needs only to download the image and check the EXIF data.",
        },
        {
          heading: "Which platforms strip metadata?",
          body: "Some platforms automatically remove EXIF data on upload. Instagram and Facebook strip most metadata (though they retain it internally). Twitter/X removes GPS data but preserves some EXIF fields.\n\nHowever, many common sharing methods preserve metadata completely: email attachments, WhatsApp (when sent as document), Google Drive and Dropbox links, forum uploads, personal websites, cloud storage, and most messaging apps when sharing original quality files.\n\nThe safest assumption: unless you've verified that a platform strips metadata, assume it doesn't.",
        },
        {
          heading: "How to protect yourself",
          body: "The most reliable approach is to strip metadata before sharing. Tools like MetaStrip process photos entirely in your browser — your files never leave your device — and remove all embedded metadata in seconds.\n\nFor ongoing protection, you can disable location services for your camera app, though this only prevents GPS data — device info, timestamps, and other metadata will still be embedded. The only way to fully clean a photo is to strip the metadata after the fact.",
        },
      ],
    },
  },
  {
    id: "ai-metadata-guide",
    slug: "ai-metadata-c2pa-explained",
    title: "C2PA and AI Image Tagging: What Creators Need to Know in 2026",
    excerpt: "AI-generated images now carry invisible content credentials. Here's how C2PA works, who's checking for it, and what it means for your content.",
    category: "technical",
    date: "Feb 22, 2026",
    readTime: "10 min read",
    featured: false,
    tags: ["AI", "C2PA", "Midjourney", "DALL-E"],
    coverGradient: "linear-gradient(135deg, #c084fc 0%, #818cf8 100%)",
    coverIcon: "🤖",
  },
  {
    id: "word-doc-metadata",
    slug: "hidden-data-word-documents",
    title: "The Hidden Data in Your Word Documents (And Why Lawyers Should Care)",
    excerpt: "Tracked changes, author names, editing time, and deleted text — Word documents carry more hidden data than most people realize.",
    category: "privacy",
    date: "Feb 15, 2026",
    readTime: "7 min read",
    featured: false,
    tags: ["DOCX", "legal", "tracked changes", "compliance"],
    coverGradient: "linear-gradient(135deg, #f472b6 0%, #a78bfa 100%)",
    coverIcon: "📝",
  },
  {
    id: "pdf-metadata-strip",
    slug: "how-to-remove-metadata-from-pdf",
    title: "How to Remove Metadata from PDFs: A Complete Guide",
    excerpt: "Step-by-step guide to stripping author names, timestamps, and hidden properties from PDF files before sharing externally.",
    category: "guides",
    date: "Feb 8, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["PDF", "how-to", "author", "metadata"],
    coverGradient: "linear-gradient(135deg, #06b6d4 0%, #4ade80 100%)",
    coverIcon: "📄",
  },
  {
    id: "gdpr-metadata",
    slug: "gdpr-metadata-compliance",
    title: "GDPR and File Metadata: What Your Organisation Needs to Know",
    excerpt: "Metadata containing personal data falls under GDPR. Here's what that means for document sharing, data minimization, and compliance.",
    category: "news",
    date: "Jan 30, 2026",
    readTime: "9 min read",
    featured: false,
    tags: ["GDPR", "compliance", "legal", "enterprise"],
    coverGradient: "linear-gradient(135deg, #4ade80 0%, #06b6d4 100%)",
    coverIcon: "⚖️",
  },
  {
    id: "exif-data-explained",
    slug: "what-is-exif-data",
    title: "What Is EXIF Data? A Plain-English Explanation",
    excerpt: "EXIF data is stored in every digital photo. Here's what it contains, where it lives, and why you should care about it.",
    category: "guides",
    date: "Jan 22, 2026",
    readTime: "5 min read",
    featured: false,
    tags: ["EXIF", "beginner", "explainer", "photos"],
    coverGradient: "linear-gradient(135deg, #fbbf24 0%, #f97316 100%)",
    coverIcon: "📸",
  },
  {
    id: "social-media-metadata",
    slug: "which-social-media-strips-metadata",
    title: "Which Social Media Platforms Strip Photo Metadata? (2026 Update)",
    excerpt: "We tested every major platform to see which ones remove EXIF data on upload and which ones don't. The results may surprise you.",
    category: "privacy",
    date: "Jan 15, 2026",
    readTime: "6 min read",
    featured: false,
    tags: ["social media", "Instagram", "Facebook", "Twitter"],
    coverGradient: "linear-gradient(135deg, #f87171 0%, #f472b6 100%)",
    coverIcon: "📱",
  },
];

// ============================================================
// SHARED CHROME
// ============================================================

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)" }} />
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)", top: "0%", right: "-8%", animation: "orbFloat1 24s ease-in-out infinite" }} />
      <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)", bottom: "10%", left: "-5%", animation: "orbFloat2 28s ease-in-out infinite" }} />
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

function Nav({ onHome }) {
  return (
    <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, padding: "16px 24px", background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <Logo onClick={onHome} />
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {["Tool", "Pricing", "Blog", "About"].map(link => (
          <span key={link} style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: link === "Blog" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s ease", position: "relative" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = link === "Blog" ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.4)"}
          >
            {link}
            {link === "Blog" && <div style={{ position: "absolute", bottom: -4, left: 0, right: 0, height: 2, background: "linear-gradient(90deg, #7c3aed, #06b6d4)", borderRadius: 1 }} />}
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
        {["Tool", "Pricing", "Blog", "About", "Privacy"].map(link => (
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
// BLOG INDEX
// ============================================================

function FeaturedCard({ article, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onClick(article.id)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 24, overflow: "hidden", cursor: "pointer",
        background: "rgba(255,255,255,0.02)", border: "1px solid rgba(124,58,237,0.12)",
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.3)" : "none",
        animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
      }}>
      {/* Cover art */}
      <div style={{ position: "relative", minHeight: 280, background: article.coverGradient, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
        <span style={{ fontSize: 80, opacity: 0.3, filter: "blur(1px)", transition: "all 0.4s ease", transform: hovered ? "scale(1.1) rotate(5deg)" : "scale(1)" }}>{article.coverIcon}</span>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, transparent 60%, rgba(9,9,11,0.8) 100%)" }} />
        {/* Featured badge */}
        <div style={{ position: "absolute", top: 16, left: 16, padding: "4px 12px", borderRadius: 8, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(8px)" }}>
          <span style={{ fontSize: 10, fontWeight: 600, color: "#fbbf24", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.08em" }}>FEATURED</span>
        </div>
      </div>
      {/* Content */}
      <div style={{ padding: "36px 32px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(124,58,237,0.1)", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {CATEGORIES.find(c => c.id === article.category)?.label}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{article.readTime}</span>
        </div>
        <h2 style={{ fontSize: 24, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.3, letterSpacing: "-0.02em", marginBottom: 12 }}>{article.title}</h2>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7, marginBottom: 16 }}>{article.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "#a78bfa", fontFamily: "'Outfit', sans-serif", fontWeight: 600, transition: "color 0.2s ease" }}>Read article →</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{article.date}</span>
        </div>
      </div>
    </div>
  );
}

function ArticleCard({ article, onClick, index }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onClick={() => onClick(article.id)} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 20, overflow: "hidden", cursor: "pointer",
        background: "rgba(255,255,255,0.02)", border: `1px solid ${hovered ? "rgba(124,58,237,0.15)" : "rgba(255,255,255,0.05)"}`,
        transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${0.2 + index * 0.08}s both`,
      }}>
      {/* Mini cover */}
      <div style={{ height: 140, background: article.coverGradient, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
        <span style={{ fontSize: 48, opacity: 0.25, transition: "transform 0.4s ease", transform: hovered ? "scale(1.15) rotate(3deg)" : "scale(1)" }}>{article.coverIcon}</span>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 50%, rgba(9,9,11,0.6) 100%)" }} />
      </div>
      <div style={{ padding: "20px 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "rgba(124,58,237,0.08)", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {CATEGORIES.find(c => c.id === article.category)?.label}
          </span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace" }}>{article.readTime}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.35, letterSpacing: "-0.01em", marginBottom: 8 }}>{article.title}</h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6, marginBottom: 14, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{article.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>Read →</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.15)", fontFamily: "'JetBrains Mono', monospace" }}>{article.date}</span>
        </div>
      </div>
    </div>
  );
}

function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <div style={{
      padding: "36px 32px", borderRadius: 20,
      background: "linear-gradient(135deg, rgba(124,58,237,0.06) 0%, rgba(6,182,212,0.03) 100%)",
      border: "1px solid rgba(124,58,237,0.1)",
      animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.5s both",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
        <span style={{ fontSize: 22 }}>📬</span>
        <h3 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>Privacy insights, no spam</h3>
      </div>
      <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6, marginBottom: 18 }}>
        Practical guides on metadata privacy, new tool features, and emerging threats. One email per month, max.
      </p>
      {!submitted ? (
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email" placeholder="you@example.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{
              flex: 1, padding: "12px 16px", borderRadius: 10,
              background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "'Outfit', sans-serif",
              outline: "none", transition: "border-color 0.2s ease",
            }}
            onFocus={(e) => e.target.style.borderColor = "rgba(124,58,237,0.3)"}
            onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.08)"}
          />
          <button onClick={() => { if (email) setSubmitted(true); }} style={{
            padding: "12px 24px", borderRadius: 10, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
            fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            boxShadow: "0 0 15px rgba(124,58,237,0.25)", transition: "all 0.2s ease", flexShrink: 0,
          }}
            onMouseEnter={(e) => e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.4)"}
            onMouseLeave={(e) => e.target.style.boxShadow = "0 0 15px rgba(124,58,237,0.25)"}
          >Subscribe</button>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
          <span style={{ fontSize: 16 }}>✓</span>
          <span style={{ fontSize: 14, color: "#4ade80", fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>You're in. Check your inbox to confirm.</span>
        </div>
      )}
    </div>
  );
}

function BlogIndex({ onArticle }) {
  const [activeCategory, setActiveCategory] = useState("all");

  const featured = ARTICLES.find(a => a.featured);
  const filtered = ARTICLES.filter(a => !a.featured && (activeCategory === "all" || a.category === activeCategory));

  return (
    <div style={{ position: "relative", zIndex: 1, maxWidth: 1000, margin: "0 auto", padding: "110px 24px 80px" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 48, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <div style={{ display: "inline-block", marginBottom: 16, padding: "5px 16px", borderRadius: 100, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
          <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>THE METASTRIP BLOG</span>
        </div>
        <h1 style={{
          fontSize: 44, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.04em",
          fontFamily: "'Outfit', sans-serif", marginBottom: 12,
          background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
          backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        }}>
          Privacy, metadata &<br />digital self-defense
        </h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.4)", maxWidth: 460, margin: "0 auto", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>
          Practical guides on protecting your identity in the files you share every day.
        </p>
      </div>

      {/* Featured article */}
      {featured && <FeaturedCard article={featured} onClick={onArticle} />}

      {/* Category filter */}
      <div style={{ display: "flex", gap: 6, marginTop: 48, marginBottom: 28, padding: 4, borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both" }}>
        {CATEGORIES.map(cat => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)} style={{
            flex: 1, padding: "9px 14px", borderRadius: 10, border: "none", cursor: "pointer",
            background: activeCategory === cat.id ? "rgba(255,255,255,0.05)" : "transparent",
            transition: "all 0.25s ease",
          }}
            onMouseEnter={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
            onMouseLeave={(e) => { if (activeCategory !== cat.id) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{ fontSize: 13, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: activeCategory === cat.id ? "rgba(255,255,255,0.85)" : "rgba(255,255,255,0.35)" }}>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Article grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18 }}>
        {filtered.map((article, i) => (
          <ArticleCard key={article.id} article={article} onClick={onArticle} index={i} />
        ))}
      </div>

      {/* Newsletter */}
      <div style={{ marginTop: 56 }}>
        <NewsletterSignup />
      </div>
    </div>
  );
}

// ============================================================
// ARTICLE PAGE
// ============================================================

function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? Math.min((scrollTop / docHeight) * 100, 100) : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ position: "fixed", top: 64, left: 0, right: 0, height: 3, zIndex: 49, background: "rgba(255,255,255,0.03)" }}>
      <div style={{
        height: "100%", width: `${progress}%`,
        background: "linear-gradient(90deg, #7c3aed, #06b6d4)",
        transition: "width 0.1s linear",
        boxShadow: progress > 0 ? "0 0 8px rgba(124,58,237,0.4)" : "none",
      }} />
    </div>
  );
}

function TableOfContents({ sections, activeSection }) {
  return (
    <div style={{
      position: "sticky", top: 100,
      padding: "20px 0",
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.1em", marginBottom: 14, textTransform: "uppercase" }}>
        On this page
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {sections.map((section, i) => (
          <button key={i} onClick={() => {
            document.getElementById(`section-${i}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
          }} style={{
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
            padding: "6px 12px", borderRadius: 8,
            borderLeft: `2px solid ${activeSection === i ? "#a78bfa" : "rgba(255,255,255,0.05)"}`,
            transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => { if (activeSection !== i) e.currentTarget.style.background = "rgba(255,255,255,0.02)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "none"; }}
          >
            <span style={{
              fontSize: 13, fontFamily: "'Outfit', sans-serif", fontWeight: 500,
              color: activeSection === i ? "rgba(255,255,255,0.8)" : "rgba(255,255,255,0.3)",
              transition: "color 0.2s ease",
            }}>{section.heading}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InlineCTA() {
  return (
    <div style={{
      margin: "36px 0", padding: "24px 28px", borderRadius: 16,
      background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
      border: "1px solid rgba(124,58,237,0.1)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
    }}>
      <div>
        <p style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 4 }}>
          Try MetaStrip — it's free
        </p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
          Strip metadata from any photo in seconds. No upload, no account.
        </p>
      </div>
      <button style={{
        padding: "10px 22px", borderRadius: 10, border: "none", cursor: "pointer",
        background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
        fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif", flexShrink: 0,
        boxShadow: "0 0 12px rgba(124,58,237,0.25)", whiteSpace: "nowrap",
      }}>Open Tool →</button>
    </div>
  );
}

function RelatedPosts({ currentId, onArticle }) {
  const related = ARTICLES.filter(a => a.id !== currentId).slice(0, 3);
  return (
    <div style={{ marginTop: 64 }}>
      <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 20, letterSpacing: "-0.02em" }}>Keep reading</h3>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
        {related.map((a, i) => (
          <div key={a.id} onClick={() => onArticle(a.id)} style={{
            padding: "20px", borderRadius: 16, cursor: "pointer",
            background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
            transition: "all 0.3s ease",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.15)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize: 28, marginBottom: 10 }}>{a.coverIcon}</div>
            <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 5, background: "rgba(124,58,237,0.08)", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase" }}>
              {CATEGORIES.find(c => c.id === a.category)?.label}
            </span>
            <h4 style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.8)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.35, marginTop: 10, letterSpacing: "-0.01em" }}>{a.title}</h4>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "'JetBrains Mono', monospace", marginTop: 8, display: "block" }}>{a.date} · {a.readTime}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ArticlePage({ article, onBack, onArticle }) {
  const [activeSection, setActiveSection] = useState(0);
  const content = article.content;

  useEffect(() => {
    if (!content) return;
    const handleScroll = () => {
      for (let i = content.sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(`section-${i}`);
        if (el && el.getBoundingClientRect().top < 150) { setActiveSection(i); break; }
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [content]);

  if (!content) {
    return (
      <div style={{ position: "relative", zIndex: 1, maxWidth: 700, margin: "0 auto", padding: "130px 24px 80px", textAlign: "center" }}>
        <span style={{ fontSize: 64, display: "block", marginBottom: 20 }}>{article.coverIcon}</span>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", marginBottom: 12, letterSpacing: "-0.02em" }}>{article.title}</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7, marginBottom: 32 }}>{article.excerpt}</p>
        <div style={{ padding: "32px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}>
          <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", fontFamily: "'Outfit', sans-serif" }}>Full article content would render here. This is a layout preview — only the featured article has full mock content.</p>
        </div>
        <button onClick={onBack} style={{ marginTop: 24, padding: "10px 24px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "transparent", color: "rgba(255,255,255,0.6)", fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif", cursor: "pointer" }}>← Back to blog</button>
        <RelatedPosts currentId={article.id} onArticle={onArticle} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      <ReadingProgress />

      {/* Article header */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "120px 24px 0", animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
        <button onClick={onBack} style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 24,
          padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
          background: "transparent", color: "rgba(255,255,255,0.4)", fontSize: 13,
          fontFamily: "'Outfit', sans-serif", cursor: "pointer", transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(124,58,237,0.2)"; e.currentTarget.style.color = "rgba(255,255,255,0.7)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.color = "rgba(255,255,255,0.4)"; }}
        >← Blog</button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(124,58,237,0.1)", color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            {CATEGORIES.find(c => c.id === article.category)?.label}
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{article.date}</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>·</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>{article.readTime}</span>
        </div>

        <h1 style={{ fontSize: 38, fontWeight: 800, lineHeight: 1.2, letterSpacing: "-0.03em", fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.95)", marginBottom: 20 }}>
          {article.title}
        </h1>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, marginBottom: 32 }}>
          {article.tags.map(tag => (
            <span key={tag} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace" }}>
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Article body with sidebar TOC */}
      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 24px 80px", display: "grid", gridTemplateColumns: "200px 1fr", gap: 48 }}>
        {/* TOC sidebar */}
        <TableOfContents sections={content.sections} activeSection={activeSection} />

        {/* Content */}
        <div style={{ maxWidth: 680 }}>
          {/* Intro */}
          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.55)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.8, marginBottom: 36, fontWeight: 400, fontStyle: "italic", borderLeft: "3px solid rgba(124,58,237,0.3)", paddingLeft: 20 }}>
            {content.intro}
          </p>

          {/* Sections */}
          {content.sections.map((section, i) => (
            <div key={i} id={`section-${i}`} style={{ marginBottom: 40, scrollMarginTop: 100 }}>
              <h2 style={{ fontSize: 22, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", marginBottom: 16, letterSpacing: "-0.02em" }}>
                {section.heading}
              </h2>
              {section.body.split("\n\n").map((para, j) => (
                <p key={j} style={{ fontSize: 15, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.85, marginBottom: 16 }}>
                  {para}
                </p>
              ))}
              {/* Inline CTA after 2nd section */}
              {i === 1 && <InlineCTA />}
            </div>
          ))}

          {/* Bottom CTA */}
          <div style={{
            padding: "32px 28px", borderRadius: 20, marginTop: 16,
            background: "linear-gradient(135deg, rgba(124,58,237,0.06), rgba(6,182,212,0.03))",
            border: "1px solid rgba(124,58,237,0.1)", textAlign: "center",
          }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "rgba(255,255,255,0.9)", fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>Strip metadata from your files now</h3>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", marginBottom: 20 }}>Free for single files. No account, no upload, no tracking.</p>
            <button style={{
              padding: "14px 36px", borderRadius: 12, border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff",
              fontSize: 15, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
              boxShadow: "0 0 25px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
            }}>Open MetaStrip →</button>
          </div>

          {/* Newsletter */}
          <div style={{ marginTop: 48 }}>
            <NewsletterSignup />
          </div>

          {/* Related */}
          <RelatedPosts currentId={article.id} onArticle={onArticle} />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// MAIN APP
// ============================================================

export default function BlogDemo() {
  const [currentArticle, setCurrentArticle] = useState(null);

  const article = currentArticle ? ARTICLES.find(a => a.id === currentArticle) : null;

  const navigate = (id) => {
    setCurrentArticle(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
      <Nav onHome={() => navigate(null)} />

      {article ? (
        <ArticlePage article={article} onBack={() => navigate(null)} onArticle={navigate} />
      ) : (
        <BlogIndex onArticle={navigate} />
      )}

      <Footer />
    </>
  );
}

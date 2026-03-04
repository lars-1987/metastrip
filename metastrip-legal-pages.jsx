import { useState } from "react";

// ============================================================
// LEGAL PAGES — Privacy Policy + Terms of Service
// ============================================================

function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)" }} />
      <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%)", top: "5%", right: "-5%", animation: "orbFloat1 26s ease-in-out infinite" }} />
      <div style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundRepeat: "repeat", backgroundSize: "128px 128px" }} />
    </div>
  );
}

function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
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
          <span key={link} style={{ fontSize: 14, fontWeight: 500, fontFamily: "'Outfit', sans-serif", color: "rgba(255,255,255,0.4)", cursor: "pointer", transition: "color 0.2s ease" }}
            onMouseEnter={(e) => e.target.style.color = "rgba(255,255,255,0.8)"}
            onMouseLeave={(e) => e.target.style.color = "rgba(255,255,255,0.4)"}
          >{link}</span>
        ))}
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
// LEGAL CONTENT SECTION RENDERER
// ============================================================

function LegalSection({ number, title, children }) {
  return (
    <div style={{ marginBottom: 36 }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 12 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>{number}.</span>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", letterSpacing: "-0.02em" }}>{title}</h2>
      </div>
      <div style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.85, paddingLeft: 28 }}>
        {children}
      </div>
    </div>
  );
}

// ============================================================
// PRIVACY POLICY CONTENT
// ============================================================

function PrivacyPolicyContent() {
  return (
    <>
      <div style={{ marginBottom: 40, padding: "20px 24px", borderRadius: 14, background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>🔒</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#4ade80", fontFamily: "'Outfit', sans-serif" }}>The short version</span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>
          Your files are processed entirely in your browser. We never see, store, or transmit your files. We don't track individual users. We collect minimal analytics data that cannot identify you. Payments are processed by Stripe — we never see your card details.
        </p>
      </div>

      <LegalSection number="1" title="Information We Do NOT Collect">
        <p style={{ marginBottom: 12 }}>MetaStrip is designed to minimize data collection. We do not collect, store, or transmit the following:</p>
        <p style={{ marginBottom: 8 }}>Your files, images, documents, or any content you process through MetaStrip. All file processing occurs entirely within your web browser using client-side JavaScript. Files are never uploaded to our servers or any third-party servers.</p>
        <p style={{ marginBottom: 8 }}>The metadata contained within your files, including but not limited to GPS coordinates, author names, timestamps, device information, and any other embedded data.</p>
        <p style={{ marginBottom: 8 }}>Personal information such as your name, address, phone number, or any identifying information beyond what is described in this policy.</p>
        <p>User accounts, profiles, or login credentials. MetaStrip does not have a user account system.</p>
      </LegalSection>

      <LegalSection number="2" title="Information We Collect">
        <p style={{ marginBottom: 12 }}>We collect the minimum information necessary to operate the service:</p>
        <p style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Analytics data:</span> We use Plausible Analytics, a privacy-focused analytics service that does not use cookies and does not collect personal data. Plausible collects aggregate page view counts, referral sources, browser type, and country-level location. This data cannot identify individual users. Plausible is compliant with GDPR, CCPA, and PECR without requiring cookie consent.</p>
        <p style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Payment information:</span> When you purchase a batch pass, payment is processed entirely by Stripe. We receive confirmation of payment and the email address you provide for your receipt. We do not receive, process, or store your credit card number, CVV, or billing address. See Stripe's privacy policy at stripe.com/privacy for details on how Stripe handles your payment data.</p>
        <p><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Free tier usage limits:</span> We use your browser's localStorage to track the number of free files processed per day. This data is stored only in your browser and is not transmitted to our servers. Clearing your browser data resets this counter.</p>
      </LegalSection>

      <LegalSection number="3" title="How We Process Your Files">
        <p style={{ marginBottom: 12 }}>MetaStrip processes files using client-side JavaScript libraries running in your web browser. Specifically:</p>
        <p style={{ marginBottom: 8 }}>Image files (JPEG, PNG, WebP) are processed using piexifjs and custom parsing code that runs entirely in your browser's JavaScript engine.</p>
        <p style={{ marginBottom: 8 }}>PDF files are processed using pdf-lib, a pure JavaScript PDF library that runs in your browser.</p>
        <p style={{ marginBottom: 12 }}>Office documents (DOCX, XLSX, PPTX) are processed using JSZip, which unpacks and modifies files entirely in browser memory.</p>
        <p style={{ marginBottom: 12 }}>At no point during processing are your files or any part of their contents transmitted over the network. You can verify this yourself by monitoring your browser's Network tab in Developer Tools while using MetaStrip.</p>
        <p>Processed files are generated in your browser's memory and downloaded directly to your device. Once you close or refresh the page, all file data in memory is discarded by your browser.</p>
      </LegalSection>

      <LegalSection number="4" title="Cookies and Local Storage">
        <p style={{ marginBottom: 12 }}>MetaStrip does not use tracking cookies. We use browser localStorage solely to track the daily free tier usage counter. This data never leaves your browser.</p>
        <p>Our analytics provider (Plausible) does not use cookies and does not require a cookie consent banner.</p>
      </LegalSection>

      <LegalSection number="5" title="Third-Party Services">
        <p style={{ marginBottom: 8 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Stripe</span> processes payments. See stripe.com/privacy.</p>
        <p style={{ marginBottom: 8 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Plausible Analytics</span> provides privacy-focused website analytics. See plausible.io/data-policy.</p>
        <p><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Vercel</span> hosts MetaStrip's website (static files and one API endpoint for Stripe checkout). See vercel.com/legal/privacy-policy.</p>
      </LegalSection>

      <LegalSection number="6" title="Data Retention">
        <p style={{ marginBottom: 12 }}>Since we do not collect personal data beyond payment receipts, there is minimal data to retain.</p>
        <p style={{ marginBottom: 8 }}>Stripe retains payment records in accordance with their data retention policy and applicable financial regulations.</p>
        <p>Plausible Analytics retains aggregate, non-identifying analytics data. No individual user data is retained.</p>
      </LegalSection>

      <LegalSection number="7" title="Your Rights">
        <p style={{ marginBottom: 12 }}>Under GDPR, CCPA, and similar privacy regulations, you have the right to access, correct, or delete your personal data. Since MetaStrip collects minimal personal data, most of these rights are satisfied by default.</p>
        <p>If you have purchased a batch pass and wish to request deletion of your email address from our Stripe records, please contact us at hello@metastrip.com.</p>
      </LegalSection>

      <LegalSection number="8" title="Children's Privacy">
        <p>MetaStrip is not directed at children under the age of 13. We do not knowingly collect personal information from children.</p>
      </LegalSection>

      <LegalSection number="9" title="Changes to This Policy">
        <p>We may update this privacy policy from time to time. Changes will be posted on this page with an updated effective date. Continued use of MetaStrip after changes constitutes acceptance of the updated policy.</p>
      </LegalSection>

      <LegalSection number="10" title="Contact">
        <p>For privacy-related questions or concerns, contact us at hello@metastrip.com.</p>
      </LegalSection>
    </>
  );
}

// ============================================================
// TERMS OF SERVICE CONTENT
// ============================================================

function TermsContent() {
  return (
    <>
      <div style={{ marginBottom: 40, padding: "20px 24px", borderRadius: 14, background: "rgba(124,58,237,0.04)", border: "1px solid rgba(124,58,237,0.1)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: 16 }}>📋</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#a78bfa", fontFamily: "'Outfit', sans-serif" }}>The short version</span>
        </div>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.7 }}>
          MetaStrip is a metadata removal tool provided as-is. Batch passes are one-time purchases, non-refundable once used, and do not require subscriptions. You're responsible for the files you process. Don't use the service for anything illegal.
        </p>
      </div>

      <LegalSection number="1" title="Acceptance of Terms">
        <p>By accessing or using MetaStrip ("the Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service. The Service is operated by MetaStrip ("we", "us", "our").</p>
      </LegalSection>

      <LegalSection number="2" title="Description of Service">
        <p style={{ marginBottom: 12 }}>MetaStrip is a web-based tool that removes metadata from digital files including images (JPEG, PNG, WebP, GIF), PDF documents, and Microsoft Office documents (DOCX, XLSX, PPTX). All file processing occurs in your web browser using client-side JavaScript. Files are not uploaded to our servers.</p>
        <p>The Service is available in a free tier (single file processing with daily limits) and through paid batch passes (multi-file processing with additional features).</p>
      </LegalSection>

      <LegalSection number="3" title="Free Tier">
        <p style={{ marginBottom: 12 }}>The free tier allows processing of single image files with complete metadata removal. Free tier usage is limited to 5 files per day, with a maximum file size of 25 MB. Free tier limits are tracked via browser localStorage.</p>
        <p>We reserve the right to modify free tier limits at any time without notice.</p>
      </LegalSection>

      <LegalSection number="4" title="Batch Passes and Payments">
        <p style={{ marginBottom: 12 }}>Batch passes are one-time purchases that unlock multi-file processing for a specified number of files. Batch passes are available in the following tiers:</p>
        <p style={{ marginBottom: 8 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Image Batch ($2.99 USD):</span> Process up to 50 image files with selective metadata removal and audit report.</p>
        <p style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Document Batch ($4.99 USD):</span> Process up to 25 document files with selective metadata removal and audit report.</p>
        <p style={{ marginBottom: 12 }}>Payments are processed by Stripe. We do not store your payment details. All prices are in US dollars and include applicable taxes where required.</p>
        <p style={{ marginBottom: 12 }}><span style={{ color: "rgba(255,255,255,0.65)", fontWeight: 600 }}>Refunds:</span> Batch passes that have been fully or partially used are non-refundable. If you experience a technical issue that prevents you from using a purchased batch pass, contact us at hello@metastrip.com within 7 days of purchase for a refund or replacement.</p>
        <p>Batch passes do not expire but are tied to a single browser session. Clearing your browser data or switching browsers will invalidate an active batch pass. We recommend using your batch pass promptly after purchase.</p>
      </LegalSection>

      <LegalSection number="5" title="Acceptable Use">
        <p style={{ marginBottom: 12 }}>You agree not to use MetaStrip to:</p>
        <p style={{ marginBottom: 8 }}>Process files that you do not own or do not have the right to modify.</p>
        <p style={{ marginBottom: 8 }}>Remove metadata for the purpose of misrepresenting the origin, authorship, or provenance of content in violation of applicable law.</p>
        <p style={{ marginBottom: 8 }}>Remove copyright management information in violation of the Digital Millennium Copyright Act (DMCA) or equivalent laws in your jurisdiction.</p>
        <p style={{ marginBottom: 8 }}>Facilitate fraud, identity theft, or any other illegal activity.</p>
        <p>Attempt to interfere with, disrupt, or exploit the Service or its infrastructure.</p>
      </LegalSection>

      <LegalSection number="6" title="Intellectual Property">
        <p style={{ marginBottom: 12 }}>MetaStrip, its logo, design, and code are the intellectual property of MetaStrip and are protected by applicable copyright and trademark laws.</p>
        <p>You retain all ownership of and rights to the files you process through MetaStrip. We claim no rights to your content.</p>
      </LegalSection>

      <LegalSection number="7" title="Disclaimer of Warranties">
        <p style={{ marginBottom: 12 }}>MetaStrip is provided "as is" and "as available" without warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, and non-infringement.</p>
        <p style={{ marginBottom: 12 }}>We do not warrant that MetaStrip will remove all metadata from all file types in all circumstances. Metadata standards and file formats are complex and evolving. While we strive for comprehensive metadata removal, some metadata may not be detected or removed, particularly in unusual or corrupted file formats.</p>
        <p>We do not warrant that the Service will be uninterrupted, error-free, or free of harmful components.</p>
      </LegalSection>

      <LegalSection number="8" title="Limitation of Liability">
        <p style={{ marginBottom: 12 }}>To the maximum extent permitted by applicable law, MetaStrip and its operator shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:</p>
        <p style={{ marginBottom: 8 }}>Your use or inability to use the Service.</p>
        <p style={{ marginBottom: 8 }}>Any failure of the Service to remove specific metadata from your files.</p>
        <p style={{ marginBottom: 8 }}>Any unauthorized access to or alteration of your files (noting that MetaStrip does not transmit or store your files).</p>
        <p style={{ marginBottom: 12 }}>Any other matter relating to the Service.</p>
        <p>Our total liability for any claims arising from or relating to the Service shall not exceed the amount you paid to MetaStrip in the 12 months preceding the claim, or $10 USD, whichever is greater.</p>
      </LegalSection>

      <LegalSection number="9" title="Governing Law">
        <p>These Terms shall be governed by and construed in accordance with the laws of Victoria, Australia, without regard to its conflict of law provisions.</p>
      </LegalSection>

      <LegalSection number="10" title="Changes to Terms">
        <p>We reserve the right to modify these Terms at any time. Changes will be posted on this page with an updated effective date. Your continued use of the Service after changes constitutes acceptance of the modified Terms.</p>
      </LegalSection>

      <LegalSection number="11" title="Contact">
        <p>For questions about these Terms, contact us at hello@metastrip.com.</p>
      </LegalSection>
    </>
  );
}

// ============================================================
// MAIN LEGAL PAGE
// ============================================================

export default function LegalPages() {
  const [activeTab, setActiveTab] = useState("privacy");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }
        @keyframes orbFloat1 { 0%, 100% { transform: translate(0,0) scale(1); } 33% { transform: translate(40px,30px) scale(1.05); } 66% { transform: translate(-20px,-15px) scale(0.95); } }
        @keyframes cardSlideIn { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes heroFadeIn { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
      `}</style>

      <AnimatedBackground />
      <Nav />

      <div style={{ position: "relative", zIndex: 1, maxWidth: 760, margin: "0 auto", padding: "110px 24px 80px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40, animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)" }}>
          <h1 style={{
            fontSize: 40, fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif", marginBottom: 12,
            background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 60%, #06b6d4 100%)",
            backgroundSize: "200% 200%", animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Legal
          </h1>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            Boring but important. We've tried to make it readable.
          </p>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: "flex", gap: 6, marginBottom: 36, padding: 4, borderRadius: 14,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both",
        }}>
          {[
            { id: "privacy", label: "Privacy Policy", icon: "🔒" },
            { id: "terms", label: "Terms of Service", icon: "📋" },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              flex: 1, padding: "12px 16px", borderRadius: 10, border: "none", cursor: "pointer",
              background: activeTab === tab.id ? "rgba(255,255,255,0.05)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              transition: "all 0.25s ease",
            }}
              onMouseEnter={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
              onMouseLeave={(e) => { if (activeTab !== tab.id) e.currentTarget.style.background = "transparent"; }}
            >
              <span style={{ fontSize: 15 }}>{tab.icon}</span>
              <span style={{ fontSize: 14, fontWeight: 600, fontFamily: "'Outfit', sans-serif", color: activeTab === tab.id ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.35)" }}>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Effective date */}
        <div style={{
          display: "flex", alignItems: "center", gap: 8, marginBottom: 32,
          animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both",
        }}>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
            Effective: March 1, 2026
          </span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.12)", fontFamily: "'JetBrains Mono', monospace" }}>|</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "'JetBrains Mono', monospace" }}>
            Last updated: March 1, 2026
          </span>
        </div>

        {/* Content */}
        <div key={activeTab} style={{
          padding: "36px 32px", borderRadius: 24,
          background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.04)",
          animation: "cardSlideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          {activeTab === "privacy" ? <PrivacyPolicyContent /> : <TermsContent />}
        </div>

        {/* Contact bar */}
        <div style={{
          marginTop: 32, padding: "20px 24px", borderRadius: 16,
          background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          animation: "cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both",
        }}>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif" }}>Questions about our policies?</p>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", marginTop: 2 }}>We're happy to clarify anything.</p>
          </div>
          <button style={{
            padding: "10px 22px", borderRadius: 10, border: "1px solid rgba(124,58,237,0.2)",
            background: "rgba(124,58,237,0.06)", cursor: "pointer",
            color: "#a78bfa", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
            transition: "all 0.2s ease",
          }}
            onMouseEnter={(e) => e.target.style.background = "rgba(124,58,237,0.12)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(124,58,237,0.06)"}
          >hello@metastrip.com</button>
        </div>
      </div>

      <Footer />
    </>
  );
}

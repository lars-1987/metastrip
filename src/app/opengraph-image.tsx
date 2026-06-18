import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MetaStrip, strip hidden metadata from files";

/**
 * 1200×630 OG card matching the V3 design system: light-silver bg, near-black
 * type, a charcoal redaction bar, and the purple→cyan brand mark as the single
 * pop of colour. Built at build time (static export). Uses system fonts, since
 * next/og can't load the self-hosted woff2.
 */
export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#e3e2de", // V3 --bg (light silver)
          fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "0 80px",
        }}
      >
        {/* Wordmark — top-left. The gradient bars are the one colour accent. */}
        <div
          style={{
            position: "absolute",
            top: "56px",
            left: "80px",
            display: "flex",
            alignItems: "center",
            gap: "14px",
          }}
        >
          <div
            style={{
              width: 46,
              height: 46,
              borderRadius: 11,
              background: "#09090b",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
            }}
          >
            <div style={{ width: 23, height: 3, borderRadius: 2, background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }} />
            <div style={{ width: 23, height: 3, borderRadius: 2, background: "linear-gradient(90deg, #a78bfa, transparent)" }} />
            <div style={{ width: 23, height: 3, borderRadius: 2, background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }} />
          </div>
          <div style={{ fontSize: 27, fontWeight: 700, letterSpacing: "-0.02em", color: "#0e0f10" }}>
            MetaStrip
          </div>
        </div>

        {/* Headline */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginTop: 30 }}>
          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#0e0f10", textAlign: "center" }}>
            Hidden in every
          </div>

          {/* Charcoal redaction bar with light text */}
          <div
            style={{
              display: "flex",
              padding: "10px 26px 14px",
              background: "#16171a",
              color: "#f3f2ef",
              borderRadius: 12,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.005em",
              marginTop: 6,
              marginBottom: 6,
            }}
          >
            gps coordinate
          </div>

          <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.02, color: "#0e0f10", textAlign: "center" }}>
            you share.
          </div>
        </div>

        {/* Subhead */}
        <div style={{ fontSize: 24, color: "#45464a", marginTop: 40, textAlign: "center", maxWidth: 880, fontWeight: 500, lineHeight: 1.4 }}>
          Strip metadata from photos, PDFs &amp; documents, 100% in your browser. Free.
        </div>

        {/* Domain footer */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            display: "flex",
            alignItems: "center",
            color: "#86868a",
            fontSize: 18,
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
          }}
        >
          metastrip.app
        </div>
      </div>
    ),
    { ...size }
  );
}

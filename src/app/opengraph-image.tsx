import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MetaStrip — Strip Hidden Metadata from Files";

/**
 * 1200×630 OG card matching the new design system:
 * eggshell bg, warm-graphite text, terracotta redaction stamp,
 * cool black for the wordmark.
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
          background: "#efe9d9", // eggshell --bg
          fontFamily: "system-ui, sans-serif",
          padding: "0 80px",
        }}
      >
        {/* Wordmark row — small, top-left ish */}
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
          {/* Logo bars — purple/cyan gradient bars (kept for brand consistency) */}
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: "#0c0c0e",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 5,
              border: "1px solid #c9bcb8",
            }}
          >
            <div
              style={{
                width: 22,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              }}
            />
            <div
              style={{
                width: 22,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(90deg, #a78bfa, transparent)",
              }}
            />
            <div
              style={{
                width: 22,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(135deg, #7c3aed, #06b6d4)",
              }}
            />
          </div>
          <div
            style={{
              fontSize: 26,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "#0c0c0e",
            }}
          >
            MetaStrip
          </div>
        </div>

        {/* Headline — same as the live hero */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            marginTop: 30,
          }}
        >
          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              color: "#0c0c0e",
              textAlign: "center",
            }}
          >
            Hidden in every
          </div>

          {/* Redaction stamp — terracotta with dark text, just like the hero */}
          <div
            style={{
              display: "flex",
              padding: "10px 26px 14px",
              background: "#d9663d",
              color: "#0c0c0e",
              borderRadius: 10,
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 56,
              fontWeight: 700,
              letterSpacing: "-0.005em",
              textTransform: "lowercase",
              marginTop: 6,
              marginBottom: 6,
            }}
          >
            GPS coordinate
          </div>

          <div
            style={{
              fontSize: 92,
              fontWeight: 800,
              letterSpacing: "-0.04em",
              lineHeight: 1.02,
              color: "#0c0c0e",
              textAlign: "center",
            }}
          >
            you share.
          </div>
        </div>

        {/* Subhead */}
        <div
          style={{
            fontSize: 24,
            color: "#5a4d49",
            marginTop: 40,
            textAlign: "center",
            maxWidth: 880,
            fontWeight: 500,
            lineHeight: 1.4,
          }}
        >
          Strip metadata from photos, PDFs &amp; documents — 100% in your browser. Free.
        </div>

        {/* Domain footer */}
        <div
          style={{
            position: "absolute",
            bottom: "44px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#8a7d79",
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

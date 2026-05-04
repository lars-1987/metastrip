import { ImageResponse } from "next/og";

export const dynamic = "force-static";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "MetaStrip — Strip Hidden Metadata from Files";

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
          background: "linear-gradient(160deg, #0f0b1f 0%, #131033 35%, #1a1442 60%, #24113d 85%, #2a0f30 100%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Glow orbs */}
        <div
          style={{
            position: "absolute",
            top: "-80px",
            left: "-60px",
            width: "500px",
            height: "500px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(217,70,239,0.25) 0%, transparent 60%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "-120px",
            right: "-40px",
            width: "600px",
            height: "600px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 60%)",
          }}
        />

        {/* Icon — 3 bars mimicking the MetaStrip logo */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            marginBottom: "36px",
          }}
        >
          <div style={{ width: "80px", height: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }} />
          <div style={{ width: "80px", height: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #a78bfa, transparent)" }} />
          <div style={{ width: "80px", height: "8px", borderRadius: "4px", background: "linear-gradient(135deg, #7c3aed, #06b6d4)" }} />
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            letterSpacing: "-2px",
            background: "linear-gradient(135deg, #e2e8f0 30%, #a78bfa 100%)",
            backgroundClip: "text",
            color: "transparent",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          MetaStrip
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: "26px",
            fontWeight: 400,
            color: "rgba(255,255,255,0.6)",
            marginTop: "16px",
            textAlign: "center",
            maxWidth: "700px",
            lineHeight: 1.4,
          }}
        >
          Strip hidden metadata from your files. 100% client-side.
        </div>

        {/* Pill tags */}
        <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
          {["EXIF", "GPS", "C2PA", "PDF", "DOCX"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "6px 16px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "16px",
                fontWeight: 600,
                letterSpacing: "0.5px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}

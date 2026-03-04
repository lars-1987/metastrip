import { useState, useCallback, useRef, useEffect } from "react";

// --- MOCK DATA ---
const MOCK_METADATA = {
  "image/jpeg": {
    gps: [
      { key: "GPSLatitude", label: "Latitude", value: "-37.8136° S" },
      { key: "GPSLongitude", label: "Longitude", value: "144.9631° E" },
      { key: "GPSAltitude", label: "Altitude", value: "32m above sea level" },
    ],
    device: [
      { key: "Make", label: "Camera Make", value: "Apple" },
      { key: "Model", label: "Camera Model", value: "iPhone 15 Pro Max" },
      { key: "LensModel", label: "Lens", value: "iPhone 15 Pro Max back triple camera 6.765mm f/1.78" },
      { key: "SerialNumber", label: "Serial Number", value: "DNQXK4..." },
    ],
    dates: [
      { key: "DateTimeOriginal", label: "Date Taken", value: "2025:01:15 14:23:07" },
      { key: "DateTimeDigitized", label: "Date Digitized", value: "2025:01:15 14:23:07" },
      { key: "DateTime", label: "Last Modified", value: "2025:02:20 09:11:33" },
    ],
    software: [
      { key: "Software", label: "Software", value: "17.2.1" },
      { key: "HostComputer", label: "Host Device", value: "iPhone 15 Pro Max" },
    ],
    author: [
      { key: "Artist", label: "Artist", value: "Lars K." },
    ],
    ai: [],
    copyright: [
      { key: "Copyright", label: "Copyright", value: "© 2025 Lars K." },
    ],
  },
  "application/pdf": {
    author: [
      { key: "Author", label: "Author", value: "Lars Karlsson" },
      { key: "Title", label: "Title", value: "Q4 Financial Review — Confidential" },
      { key: "Subject", label: "Subject", value: "Internal Finance" },
    ],
    software: [
      { key: "Creator", label: "Creator App", value: "Microsoft Word 2024" },
      { key: "Producer", label: "PDF Producer", value: "macOS 14.2 Quartz PDFContext" },
    ],
    dates: [
      { key: "CreationDate", label: "Created", value: "2025-01-10T09:14:00Z" },
      { key: "ModDate", label: "Modified", value: "2025-02-18T16:42:00Z" },
    ],
    device: [],
    gps: [],
    ai: [],
    copyright: [],
  },
  default: {
    author: [
      { key: "creator", label: "Creator", value: "John Smith" },
      { key: "lastModifiedBy", label: "Last Modified By", value: "Jane Doe" },
      { key: "company", label: "Company", value: "Acme Corp" },
    ],
    software: [
      { key: "Application", label: "Application", value: "Microsoft Office Word" },
      { key: "AppVersion", label: "Version", value: "16.0000" },
    ],
    dates: [
      { key: "created", label: "Created", value: "2024-12-05T08:30:00Z" },
      { key: "modified", label: "Modified", value: "2025-02-14T11:20:00Z" },
      { key: "TotalTime", label: "Editing Time", value: "247 minutes" },
    ],
    device: [],
    gps: [],
    ai: [],
    copyright: [],
  },
};

function getMockMetadata(mimeType) {
  if (MOCK_METADATA[mimeType]) return MOCK_METADATA[mimeType];
  if (mimeType.startsWith("image/")) return MOCK_METADATA["image/jpeg"];
  return MOCK_METADATA["default"];
}

const CATEGORY_CONFIG = {
  gps: { label: "GPS & Location", icon: "📍", color: "#ff4d6a", defaultOn: true },
  device: { label: "Device & Camera", icon: "📱", color: "#a78bfa", defaultOn: true },
  dates: { label: "Dates & Timestamps", icon: "📅", color: "#38bdf8", defaultOn: true },
  author: { label: "Author & Identity", icon: "👤", color: "#f472b6", defaultOn: true },
  software: { label: "Software & App Info", icon: "💻", color: "#818cf8", defaultOn: true },
  ai: { label: "AI Generation Tags", icon: "🤖", color: "#a78bfa", defaultOn: true },
  copyright: { label: "Copyright & Rights", icon: "©️", color: "#fbbf24", defaultOn: false },
};

const ACCEPTED_TYPES = [
  "image/jpeg", "image/png", "image/webp", "image/gif",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

function getFileTypeLabel(type) {
  const map = {
    "image/jpeg": "JPEG", "image/png": "PNG", "image/webp": "WebP", "image/gif": "GIF",
    "application/pdf": "PDF",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  };
  return map[type] || type.split("/").pop().toUpperCase();
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1048576).toFixed(1) + " MB";
}

function getFileIcon(type) {
  if (type.startsWith("image/")) return "🖼";
  if (type === "application/pdf") return "📄";
  return "📎";
}

// --- ANIMATED BACKGROUND ---
function AnimatedBackground() {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 80% at 50% -10%, #1a0533 0%, #09090b 60%)",
      }} />
      {/* Floating orbs */}
      <div style={{
        position: "absolute", width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)",
        top: "-10%", left: "-10%",
        animation: "orbFloat1 20s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)",
        bottom: "-15%", right: "-5%",
        animation: "orbFloat2 25s ease-in-out infinite",
      }} />
      <div style={{
        position: "absolute", width: 300, height: 300, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
        top: "40%", right: "20%",
        animation: "orbFloat3 18s ease-in-out infinite",
      }} />
      {/* Noise overlay */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.03,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat", backgroundSize: "128px 128px",
      }} />
      {/* Scan line effect */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.015,
        background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)",
      }} />
    </div>
  );
}

// --- LOGO ---
function Logo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 10, position: "relative",
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
      }}>
        MetaStrip
      </span>
    </div>
  );
}

// --- NAV ---
function Nav({ fileCount }) {
  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: "16px 24px",
      background: "rgba(9,9,11,0.7)", backdropFilter: "blur(20px) saturate(1.5)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between",
    }}>
      <Logo />
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <span style={{
          fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif",
          letterSpacing: "0.02em",
        }}>
          100% Client-Side Processing
        </span>
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          padding: "6px 14px", borderRadius: 8,
          background: "rgba(124,58,237,0.12)", border: "1px solid rgba(124,58,237,0.2)",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: "#22c55e", boxShadow: "0 0 6px #22c55e",
            animation: "pulse 2s ease-in-out infinite",
          }} />
          <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            {fileCount} file{fileCount !== 1 ? "s" : ""} queued
          </span>
        </div>
        <button style={{
          padding: "8px 20px", borderRadius: 8, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
          color: "#fff", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          letterSpacing: "0.01em",
          boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)",
          transition: "all 0.2s ease",
        }}
          onMouseEnter={(e) => { e.target.style.transform = "translateY(-1px)"; e.target.style.boxShadow = "0 0 30px rgba(124,58,237,0.5), inset 0 1px 0 rgba(255,255,255,0.15)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "translateY(0)"; e.target.style.boxShadow = "0 0 20px rgba(124,58,237,0.3), inset 0 1px 0 rgba(255,255,255,0.1)"; }}
        >
          Get Batch Pass
        </button>
      </div>
    </nav>
  );
}

// --- DROPZONE ---
function DropZone({ onFiles, isDragOver, setIsDragOver }) {
  const inputRef = useRef(null);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => {
        e.preventDefault(); setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files).filter(f => ACCEPTED_TYPES.includes(f.type));
        if (files.length) onFiles(files);
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        position: "relative", cursor: "pointer",
        padding: "64px 40px", borderRadius: 20, textAlign: "center",
        border: `2px dashed ${isDragOver ? "rgba(124,58,237,0.8)" : "rgba(255,255,255,0.08)"}`,
        background: isDragOver
          ? "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(6,182,212,0.04) 100%)"
          : "rgba(255,255,255,0.02)",
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
        overflow: "hidden",
      }}
    >
      {/* Glow effect on hover */}
      <div style={{
        position: "absolute", inset: 0, opacity: isDragOver ? 0.6 : 0,
        background: "radial-gradient(ellipse at center, rgba(124,58,237,0.1) 0%, transparent 70%)",
        transition: "opacity 0.4s ease",
      }} />
      <input
        ref={inputRef} type="file" multiple
        accept={ACCEPTED_TYPES.join(",")}
        style={{ display: "none" }}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length) onFiles(files);
          e.target.value = "";
        }}
      />
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Upload icon */}
        <div style={{
          width: 72, height: 72, borderRadius: 20, margin: "0 auto 20px",
          background: "linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))",
          border: "1px solid rgba(124,58,237,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center",
          animation: isDragOver ? "iconBounce 0.6s ease-in-out infinite" : "none",
        }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(167,139,250,0.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>
        <p style={{
          fontSize: 18, fontWeight: 600, color: "rgba(255,255,255,0.85)",
          fontFamily: "'Outfit', sans-serif", marginBottom: 8,
        }}>
          {isDragOver ? "Release to strip metadata" : "Drop files here or click to browse"}
        </p>
        <p style={{
          fontSize: 13, color: "rgba(255,255,255,0.35)",
          fontFamily: "'Outfit', sans-serif", lineHeight: 1.6,
        }}>
          JPEG · PNG · WebP · PDF · DOCX · XLSX · PPTX
        </p>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16,
          padding: "6px 14px", borderRadius: 100,
          background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)",
        }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
          <span style={{ fontSize: 11, color: "#4ade80", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500 }}>
            Files never leave your device
          </span>
        </div>
      </div>
    </div>
  );
}

// --- FILE CARD ---
function FileCard({ file, status, metadata, onRemove, onProcess, onDownload, index }) {
  const metaCount = metadata ? Object.values(metadata).flat().length : 0;
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative", borderRadius: 16, overflow: "hidden",
        background: hovered ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.025)",
        border: `1px solid ${status === "done" ? "rgba(34,197,94,0.2)" : status === "processing" ? "rgba(124,58,237,0.3)" : "rgba(255,255,255,0.06)"}`,
        transition: "all 0.3s ease",
        animation: `cardSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.08}s both`,
      }}
    >
      {/* Processing shimmer */}
      {status === "processing" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.06), transparent)",
          animation: "shimmer 1.5s ease-in-out infinite",
        }} />
      )}
      <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16, position: "relative" }}>
        {/* File icon */}
        <div style={{
          width: 44, height: 44, borderRadius: 12, flexShrink: 0,
          background: status === "done"
            ? "rgba(34,197,94,0.1)"
            : status === "processing"
              ? "rgba(124,58,237,0.12)"
              : "rgba(255,255,255,0.04)",
          border: `1px solid ${status === "done" ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.06)"}`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 20, transition: "all 0.3s ease",
        }}>
          {status === "done" ? "✓" : status === "processing" ? (
            <div style={{ width: 18, height: 18, border: "2px solid rgba(124,58,237,0.3)", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
          ) : getFileIcon(file.type)}
        </div>

        {/* File info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.9)",
              fontFamily: "'Outfit', sans-serif",
              overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            }}>
              {file.name}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 6,
              background: "rgba(124,58,237,0.12)", color: "#a78bfa",
              fontFamily: "'JetBrains Mono', monospace", letterSpacing: "0.05em",
              flexShrink: 0,
            }}>
              {getFileTypeLabel(file.type)}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "'JetBrains Mono', monospace" }}>
              {formatBytes(file.size)}
            </span>
            {metadata && metaCount > 0 && (
              <span style={{
                fontSize: 11, color: status === "done" ? "#4ade80" : "#f87171",
                fontFamily: "'JetBrains Mono', monospace",
              }}>
                {status === "done" ? `${metaCount} fields stripped` : `${metaCount} fields found`}
              </span>
            )}
            {status === "processing" && (
              <span style={{ fontSize: 11, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace" }}>
                Stripping metadata...
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {status === "pending" && (
            <button
              onClick={(e) => { e.stopPropagation(); onProcess(); }}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "none", cursor: "pointer",
                background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                boxShadow: "0 0 15px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => e.target.style.boxShadow = "0 0 25px rgba(124,58,237,0.4), inset 0 1px 0 rgba(255,255,255,0.15)"}
              onMouseLeave={(e) => e.target.style.boxShadow = "0 0 15px rgba(124,58,237,0.25), inset 0 1px 0 rgba(255,255,255,0.1)"}
            >
              Strip
            </button>
          )}
          {status === "done" && (
            <button
              onClick={(e) => { e.stopPropagation(); onDownload(); }}
              style={{
                padding: "8px 18px", borderRadius: 10, border: "1px solid rgba(34,197,94,0.25)",
                background: "rgba(34,197,94,0.08)", cursor: "pointer",
                color: "#4ade80", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(34,197,94,0.15)"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(34,197,94,0.08)"; }}
            >
              ↓ Download
            </button>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            style={{
              width: 32, height: 32, borderRadius: 8, border: "none", cursor: "pointer",
              background: "transparent", color: "rgba(255,255,255,0.25)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16, transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => { e.target.style.color = "#f87171"; e.target.style.background = "rgba(248,113,113,0.08)"; }}
            onMouseLeave={(e) => { e.target.style.color = "rgba(255,255,255,0.25)"; e.target.style.background = "transparent"; }}
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

// --- METADATA PANEL ---
function MetadataPanel({ metadata, status }) {
  const [expandedCats, setExpandedCats] = useState(new Set(["gps", "author"]));
  if (!metadata) return null;

  const toggle = (cat) => {
    setExpandedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });
  };

  const categories = Object.entries(metadata).filter(([_, fields]) => fields.length > 0);
  if (categories.length === 0) return null;

  return (
    <div style={{
      borderRadius: 16, overflow: "hidden",
      background: "rgba(255,255,255,0.02)",
      border: "1px solid rgba(255,255,255,0.06)",
      animation: "panelFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif" }}>
          Metadata Found
        </span>
        <span style={{
          fontSize: 11, padding: "3px 10px", borderRadius: 100,
          background: status === "done" ? "rgba(34,197,94,0.1)" : "rgba(248,113,113,0.1)",
          color: status === "done" ? "#4ade80" : "#f87171",
          fontFamily: "'JetBrains Mono', monospace", fontWeight: 500,
        }}>
          {status === "done" ? "STRIPPED" : "EXPOSED"}
        </span>
      </div>
      {categories.map(([cat, fields]) => {
        const config = CATEGORY_CONFIG[cat];
        if (!config) return null;
        const isExpanded = expandedCats.has(cat);
        return (
          <div key={cat} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
            <button
              onClick={() => toggle(cat)}
              style={{
                width: "100%", padding: "12px 20px", border: "none", cursor: "pointer",
                background: "transparent", display: "flex", alignItems: "center", gap: 10,
                transition: "background 0.2s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <span style={{ fontSize: 14 }}>{config.icon}</span>
              <span style={{ flex: 1, textAlign: "left", fontSize: 13, fontWeight: 500, color: "rgba(255,255,255,0.7)", fontFamily: "'Outfit', sans-serif" }}>
                {config.label}
              </span>
              <span style={{
                fontSize: 10, padding: "2px 8px", borderRadius: 6,
                background: `${config.color}15`, color: config.color,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: 600,
              }}>
                {fields.length}
              </span>
              <span style={{
                color: "rgba(255,255,255,0.3)", fontSize: 12,
                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}>▾</span>
            </button>
            {isExpanded && (
              <div style={{ padding: "0 20px 12px 44px" }}>
                {fields.map((field, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "6px 0",
                    borderBottom: i < fields.length - 1 ? "1px solid rgba(255,255,255,0.02)" : "none",
                  }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                      {field.label}
                    </span>
                    <span style={{
                      fontSize: 12, fontFamily: "'JetBrains Mono', monospace",
                      color: status === "done" ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.6)",
                      textDecoration: status === "done" ? "line-through" : "none",
                      maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    }}>
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// --- STATS BAR ---
function StatsBar({ files }) {
  const total = files.length;
  const done = files.filter(f => f.status === "done").length;
  const totalMeta = files.reduce((acc, f) => acc + (f.metadata ? Object.values(f.metadata).flat().length : 0), 0);

  if (total === 0) return null;

  return (
    <div style={{
      display: "flex", gap: 12,
      animation: "statsSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
    }}>
      {[
        { label: "Files", value: total, color: "#a78bfa" },
        { label: "Processed", value: done, color: "#4ade80" },
        { label: "Fields Found", value: totalMeta, color: "#f87171" },
      ].map(({ label, value, color }) => (
        <div key={label} style={{
          flex: 1, padding: "14px 18px", borderRadius: 14,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
        }}>
          <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "'Outfit', sans-serif" }}>
            {value}
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "'JetBrains Mono', monospace", marginTop: 2 }}>
            {label}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- FEATURES SECTION ---
function Features() {
  const features = [
    { icon: "🔒", title: "Zero Upload", desc: "Files are processed entirely in your browser. Nothing touches our servers." },
    { icon: "⚡", title: "Instant Strip", desc: "Client-side processing means no upload wait. Strip metadata in milliseconds." },
    { icon: "🎯", title: "Deep Scan", desc: "EXIF, XMP, IPTC, GPS, AI generation tags, document properties, comments." },
    { icon: "📊", title: "Audit Report", desc: "Batch passes include a detailed report of every field found and removed." },
  ];
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginTop: 64 }}>
      {features.map((f, i) => (
        <div key={i} style={{
          padding: "28px 24px", borderRadius: 16,
          background: "rgba(255,255,255,0.02)",
          border: "1px solid rgba(255,255,255,0.05)",
          transition: "all 0.3s ease",
          animation: `cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) ${0.6 + i * 0.1}s both`,
        }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.04)";
            e.currentTarget.style.borderColor = "rgba(124,58,237,0.15)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.02)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.85)", fontFamily: "'Outfit', sans-serif", marginBottom: 8 }}>
            {f.title}
          </div>
          <div style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.6 }}>
            {f.desc}
          </div>
        </div>
      ))}
    </div>
  );
}

// --- MAIN APP ---
export default function MetaStrip() {
  const [files, setFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const addFiles = useCallback((newFiles) => {
    const entries = newFiles.map((file) => ({
      file,
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      status: "pending",
      metadata: getMockMetadata(file.type),
    }));
    setFiles(prev => [...prev, ...entries]);
    if (entries.length > 0 && !selectedFileId) {
      setSelectedFileId(entries[0].id);
    }
  }, [selectedFileId]);

  const removeFile = useCallback((id) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    if (selectedFileId === id) setSelectedFileId(null);
  }, [selectedFileId]);

  const processFile = useCallback((id) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "processing" } : f));
    setTimeout(() => {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, status: "done" } : f));
    }, 1200 + Math.random() * 800);
  }, []);

  const processAll = useCallback(() => {
    const pending = files.filter(f => f.status === "pending");
    pending.forEach((f, i) => {
      setTimeout(() => {
        setFiles(prev => prev.map(ff => ff.id === f.id ? { ...ff, status: "processing" } : ff));
        setTimeout(() => {
          setFiles(prev => prev.map(ff => ff.id === f.id ? { ...ff, status: "done" } : ff));
        }, 800 + Math.random() * 600);
      }, i * 400);
    });
  }, [files]);

  const selectedFile = files.find(f => f.id === selectedFileId);
  const hasPending = files.some(f => f.status === "pending");
  const allDone = files.length > 0 && files.every(f => f.status === "done");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #09090b; color: #fff; overflow-x: hidden; }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(40px, 30px) scale(1.05); }
          66% { transform: translate(-20px, -15px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, -40px) scale(1.08); }
          66% { transform: translate(25px, 20px) scale(0.92); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(50px, -30px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes cardSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes panelFadeIn {
          from { opacity: 0; transform: translateX(12px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes statsSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes heroFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.15); }
      `}</style>

      <AnimatedBackground />
      <Nav fileCount={files.length} />

      <div style={{
        position: "relative", zIndex: 1,
        maxWidth: 1100, margin: "0 auto", padding: "100px 24px 80px",
      }}>
        {/* Hero */}
        <div style={{
          textAlign: "center", marginBottom: 48,
          animation: "heroFadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)",
        }}>
          <div style={{
            display: "inline-block", marginBottom: 16,
            padding: "5px 16px", borderRadius: 100,
            background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)",
          }}>
            <span style={{ fontSize: 12, color: "#a78bfa", fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, letterSpacing: "0.05em" }}>
              v1.0 — FREE FOR SINGLE FILES
            </span>
          </div>
          <h1 style={{
            fontSize: 52, fontWeight: 800, lineHeight: 1.1, letterSpacing: "-0.04em",
            fontFamily: "'Outfit', sans-serif", marginBottom: 16,
            background: "linear-gradient(135deg, #f8fafc 0%, #a78bfa 50%, #06b6d4 100%)",
            backgroundSize: "200% 200%",
            animation: "gradientShift 8s ease infinite",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          }}>
            Strip the data you<br />didn't know you shared
          </h1>
          <p style={{
            fontSize: 17, color: "rgba(255,255,255,0.4)", maxWidth: 520, margin: "0 auto",
            fontFamily: "'Outfit', sans-serif", lineHeight: 1.7, fontWeight: 400,
          }}>
            Every file carries hidden metadata — GPS coordinates, device info, author names, timestamps.
            MetaStrip removes it all, instantly, without your files ever leaving your browser.
          </p>
        </div>

        {/* Drop Zone */}
        <div style={{ animation: "cardSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}>
          <DropZone onFiles={addFiles} isDragOver={isDragOver} setIsDragOver={setIsDragOver} />
        </div>

        {/* Stats */}
        {files.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <StatsBar files={files} />
          </div>
        )}

        {/* File List + Metadata Panel */}
        {files.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: selectedFile ? "1fr 380px" : "1fr",
            gap: 20, marginTop: 20,
          }}>
            {/* File list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Batch actions bar */}
              {files.length > 1 && (
                <div style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 16px", borderRadius: 12,
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.05)",
                  animation: "statsSlideUp 0.3s ease",
                }}>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Outfit', sans-serif" }}>
                    {files.length} files queued
                  </span>
                  <div style={{ display: "flex", gap: 8 }}>
                    {hasPending && (
                      <button
                        onClick={processAll}
                        style={{
                          padding: "6px 16px", borderRadius: 8, border: "none", cursor: "pointer",
                          background: "linear-gradient(135deg, #7c3aed, #6d28d9)",
                          color: "#fff", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                          boxShadow: "0 0 12px rgba(124,58,237,0.2)",
                          transition: "all 0.2s ease",
                        }}
                      >
                        Strip All
                      </button>
                    )}
                    {allDone && (
                      <button
                        style={{
                          padding: "6px 16px", borderRadius: 8,
                          border: "1px solid rgba(34,197,94,0.25)",
                          background: "rgba(34,197,94,0.08)", cursor: "pointer",
                          color: "#4ade80", fontSize: 12, fontWeight: 600, fontFamily: "'Outfit', sans-serif",
                        }}
                      >
                        ↓ Download All (.zip)
                      </button>
                    )}
                    <button
                      onClick={() => { setFiles([]); setSelectedFileId(null); }}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.06)",
                        background: "transparent", cursor: "pointer",
                        color: "rgba(255,255,255,0.35)", fontSize: 12, fontWeight: 500, fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {files.map((f, i) => (
                <div key={f.id} onClick={() => setSelectedFileId(f.id)} style={{ cursor: "pointer" }}>
                  <FileCard
                    file={f.file}
                    status={f.status}
                    metadata={f.metadata}
                    onRemove={() => removeFile(f.id)}
                    onProcess={() => processFile(f.id)}
                    onDownload={() => {}}
                    index={i}
                  />
                </div>
              ))}
            </div>

            {/* Metadata panel */}
            {selectedFile && (
              <MetadataPanel metadata={selectedFile.metadata} status={selectedFile.status} />
            )}
          </div>
        )}

        {/* Features */}
        {files.length === 0 && <Features />}
      </div>

      {/* Footer */}
      <footer style={{
        position: "relative", zIndex: 1, textAlign: "center",
        padding: "40px 24px", borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 32, marginBottom: 16 }}>
          {["Privacy", "Pricing", "Blog", "About"].map(link => (
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

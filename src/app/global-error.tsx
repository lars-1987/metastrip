"use client";

import { useEffect } from "react";
import { isChunkLoadError, reloadForStaleChunk } from "@/lib/chunk-reload";

/**
 * App-router global error boundary — the last line of defence. Renders when
 * an error escapes every nested boundary (it replaces the root layout, so it
 * must provide its own <html>/<body> and can't rely on layout CSS — styles
 * are inlined).
 *
 * Before this existed, any unhandled client-side throw showed Next's raw
 * "Application error: a client-side exception has occurred" full-page message.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // A stale chunk after a deploy: reload once to fetch fresh hashes.
    if (isChunkLoadError(error)) reloadForStaleChunk();
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#14101f",
          color: "#e8e6f0",
          fontFamily:
            "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div style={{ fontSize: 28, marginBottom: 12 }}>⚠</div>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: "rgba(232,230,240,0.55)",
              margin: "0 0 24px",
            }}
          >
            Your files were never uploaded — all processing happens in your
            browser, so nothing left your device. Reloading the page usually
            fixes this.
          </p>
          <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "rgba(124,58,237,0.2)",
                color: "#c4b5fd",
                border: "1px solid rgba(124,58,237,0.3)",
              }}
            >
              Reload page
            </button>
            <button
              onClick={() => reset()}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                background: "rgba(255,255,255,0.04)",
                color: "rgba(232,230,240,0.6)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}

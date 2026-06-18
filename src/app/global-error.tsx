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
          background: "#1b1b21", // V3 dark --bg
          color: "#f4f3f0",
          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          padding: "24px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 30, marginBottom: 14, opacity: 0.7 }}>⚠</div>
          <h1 style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", margin: "0 0 10px" }}>
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.6,
              color: "#bdbdbf",
              margin: "0 0 28px",
            }}
          >
            Your files were never uploaded; all processing happens in your
            browser, so nothing left your device. Reloading the page usually
            fixes this.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "11px 22px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: "#e6e5e1",
                color: "#16161a",
                border: "none",
              }}
            >
              Reload page
            </button>
            <button
              onClick={() => reset()}
              style={{
                padding: "11px 22px",
                borderRadius: 999,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                background: "transparent",
                color: "#bdbdbf",
                border: "1px solid rgba(244,243,240,0.22)",
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

"use client";

import { Component, type ReactNode } from "react";
import { isChunkLoadError, reloadForStaleChunk } from "@/lib/chunk-reload";

interface Props {
  children: ReactNode;
  /** Optional custom fallback. If omitted, a themed default is shown. */
  fallback?: ReactNode;
  /** Short label for the area being protected, used in the default fallback. */
  label?: string;
}

interface State {
  hasError: boolean;
  reloading: boolean;
}

/**
 * Catches render/effect-phase throws in its subtree so one bad component
 * can't white-screen the whole app. If the error is a stale-chunk load
 * failure (common on a static export right after a deploy), it reloads the
 * page once to fetch fresh chunks instead of showing an error at all.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, reloading: false };

  static getDerivedStateFromError(error: unknown): Partial<State> {
    // If it's a stale chunk, we'll reload in componentDidCatch — render a
    // quiet "reloading" state rather than the error fallback.
    return { hasError: true, reloading: isChunkLoadError(error) };
  }

  componentDidCatch(error: unknown) {
    if (isChunkLoadError(error)) {
      const triggered = reloadForStaleChunk();
      // If the reload was suppressed (loop guard), fall back to the error UI.
      if (!triggered) this.setState({ reloading: false });
    }
  }

  private reset = () => this.setState({ hasError: false, reloading: false });

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.state.reloading) {
      return (
        <div className="p-6 text-center font-[family-name:var(--font-mono)] text-sm text-white/50">
          updating to the latest version…
        </div>
      );
    }
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="p-8 flex flex-col items-center justify-center text-center font-[family-name:var(--font-mono)]">
        <div className="text-2xl mb-3">⚠</div>
        <div className="text-white/80 text-sm mb-1">
          Something went wrong{this.props.label ? ` in ${this.props.label}` : ""}.
        </div>
        <div className="text-white/40 text-xs mb-5 max-w-sm">
          Your files were never uploaded — everything stays in your browser.
          Reloading usually fixes it.
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-1.5 rounded text-xs font-medium bg-purple/20 text-purple-light border border-purple/30 hover:bg-purple/30 transition-colors cursor-pointer"
          >
            reload page
          </button>
          <button
            onClick={this.reset}
            className="px-4 py-1.5 rounded text-xs font-medium bg-white/[0.04] text-white/50 border border-white/[0.08] hover:border-white/[0.15] transition-colors cursor-pointer"
          >
            try again
          </button>
        </div>
      </div>
    );
  }
}

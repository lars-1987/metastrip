/**
 * Stale-chunk recovery for static exports.
 *
 * MetaStrip is a static export (`output: "export"`) served from GitHub
 * Pages. Every deploy replaces the hashed JS/CSS chunk files. A user who
 * had the page open from before a deploy and then triggers a lazily-loaded
 * chunk (e.g. `import("file-saver")` on download, or any code-split route
 * chunk) will hit a `ChunkLoadError` because the old hashed file is gone.
 *
 * The fix is the standard one: detect the chunk-load failure and reload the
 * page once so the browser fetches the current HTML + current chunk hashes.
 * A short time-window guard prevents a reload loop if the reload itself
 * keeps failing (e.g. genuinely offline).
 */

/** True if the error looks like a failed dynamic import / code-split chunk fetch. */
export function isChunkLoadError(error: unknown): boolean {
  if (!error) return false;
  const err = error as { name?: string; message?: string };
  const haystack = `${err.name ?? ""} ${err.message ?? ""}`;
  return /ChunkLoadError|Loading chunk [\w-]+ failed|Loading CSS chunk|dynamically imported module|Importing a module script failed|error loading dynamically imported module|is not a valid JavaScript MIME type/i.test(
    haystack
  );
}

const RELOAD_KEY = "metastrip:lastChunkReload";
const RELOAD_WINDOW_MS = 10_000;

/**
 * Reload the page once to pick up fresh chunk hashes after a deploy.
 * Returns true if a reload was triggered, false if suppressed (already
 * reloaded recently — avoids an infinite reload loop).
 */
export function reloadForStaleChunk(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) ?? "0");
    if (Date.now() - last < RELOAD_WINDOW_MS) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch {
    // sessionStorage unavailable (private mode quota, etc.) — still reload,
    // accepting the small risk of a single extra reload.
  }
  window.location.reload();
  return true;
}

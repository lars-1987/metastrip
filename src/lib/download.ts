/**
 * iOS Safari asks "Do you want to download…?" before saving a file, and for a
 * type it can display (an image, a PDF, a WAV) it offers View next to Download.
 * View replaces the tab with the file, so the results are gone when they come
 * back. From 13 to 27 Sep, 1 in 5 iPhone Safari downloads left the page that
 * way, and nearly half of those people came back to an empty tool.
 *
 * Typed as application/octet-stream, the prompt offers Download alone and the
 * saved name keeps its extension (checked in the iOS 26 simulator). Other
 * browsers download straight away, so they keep the real type.
 */

/** iPhone and iPad, including iPadOS, which reports a Mac user agent. */
function isAppleTouch(): boolean {
  if (typeof navigator === "undefined") return false;
  if (/iPhone|iPad|iPod/.test(navigator.userAgent)) return true;
  return /Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1;
}

/** The blob to hand to saveAs: re-typed on iPhone and iPad, else unchanged. */
export function forDownload(blob: Blob): Blob {
  return isAppleTouch() ? new Blob([blob], { type: "application/octet-stream" }) : blob;
}

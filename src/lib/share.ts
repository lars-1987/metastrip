/**
 * "Save or share" on phones, through the Web Share API. On an iPhone a download
 * lands in Files, not Photos, so the share sheet ("Save Image", or straight to
 * WhatsApp or Instagram) is the shorter path. Nothing leaves the device: the
 * sheet hands the file to the OS.
 *
 * A prototype behind a per-browser flag until it is checked on a real iPhone
 * that a photo saved to Photos and then shared on stays clean. Visit any page
 * with ?share=1 to turn it on for that browser, ?share=0 to turn it off.
 */
const FLAG_KEY = "metastrip:share";

export function shareFlagOn(): boolean {
  try {
    const q = new URLSearchParams(window.location.search).get("share");
    if (q === "1") localStorage.setItem(FLAG_KEY, "1");
    if (q === "0") localStorage.removeItem(FLAG_KEY);
    return localStorage.getItem(FLAG_KEY) === "1";
  } catch {
    return false;
  }
}

/** Phones and tablets only, so desktop keeps a plain download even where the
 *  browser supports sharing (Safari on macOS, Chrome on Windows). */
export function canShareFiles(files: File[]): boolean {
  if (files.length === 0 || typeof navigator === "undefined") return false;
  try {
    if (!window.matchMedia("(pointer: coarse)").matches) return false;
    return typeof navigator.share === "function" && !!navigator.canShare?.({ files });
  } catch {
    return false;
  }
}

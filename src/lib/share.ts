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
  let q: string | null = null;
  try {
    q = new URLSearchParams(window.location.search).get("share");
  } catch {
    return false;
  }
  try {
    if (q === "1") localStorage.setItem(FLAG_KEY, "1");
    if (q === "0") localStorage.removeItem(FLAG_KEY);
    return q === "1" || (q !== "0" && localStorage.getItem(FLAG_KEY) === "1");
  } catch {
    // Storage blocked: the URL still counts. This used to return false, which
    // switched the flag off even with ?share=1 in the address bar.
    return q === "1";
  }
}

/**
 * Prototype only, shown to flag users when the button does not appear: which
 * condition failed, so a test on a phone says why instead of just saving the
 * file to Files. Goes when the flag does.
 */
export function shareSupportReport(files: File[]): string {
  const yes = (b: boolean) => (b ? "yes" : "no");
  let coarse = false;
  try {
    coarse = window.matchMedia("(pointer: coarse)").matches;
  } catch {
    // leave as "no"
  }
  let these = "missing";
  let png = "missing";
  if (typeof navigator.canShare === "function") {
    try {
      these = yes(navigator.canShare({ files }));
    } catch (e) {
      these = `threw ${e instanceof Error ? e.name : "error"}`;
    }
    try {
      png = yes(navigator.canShare({ files: [new File([new Uint8Array(8)], "test.png", { type: "image/png" })] }));
    } catch {
      png = "threw";
    }
  }
  const types = files.map((f) => f.type || "(none)").join(", ") || "(no files)";
  return `Share check: touch ${yes(coarse)}, share() ${yes(typeof navigator.share === "function")}, these files ${these}, a PNG ${png}, types ${types}`;
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

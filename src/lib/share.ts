/**
 * "Save or share" on phones, through the Web Share API. On an iPhone a download
 * lands in Files, not Photos, so the share sheet ("Save Image", or straight to
 * WhatsApp or Instagram) is the shorter path. Nothing leaves the device: the
 * sheet hands the file to the OS.
 *
 * Ran behind a ?share=1 flag until checked on an iPhone: a camera photo saved
 * to Photos through the sheet showed no location or camera details.
 */

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

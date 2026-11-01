import { CONTACT_EMAIL } from "./constants";
import { formatBytes } from "./file-utils";

interface Failure {
  reason: string;
  format: string;
  fileSize: number;
  userAgent: string;
}

/**
 * An email about a file the tool couldn't read, with the details filled in so
 * the person only has to add a sentence. It opens in their own mail app, where
 * they can read and change all of it before anything is sent.
 *
 * No file name, because that's the person's own text, and no request for the
 * file: the privacy page says we never see one. What made it is usually enough
 * to reproduce the problem.
 */
export function failureReportHref({ reason, format, fileSize, userAgent }: Failure): string {
  const subject = `MetaStrip couldn't read my file (${format})`;
  const body = [
    "Hi,",
    "",
    "What made this file, and what were you trying to do?",
    "",
    "",
    "",
    "You don't need to attach the file. Knowing what made it is usually enough.",
    "",
    "Details from the tool:",
    `Reason: ${reason}`,
    `Format: ${format}`,
    `Size: ${formatBytes(fileSize)}`,
    `Browser: ${userAgent}`,
  ].join("\r\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

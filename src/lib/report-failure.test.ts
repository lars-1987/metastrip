import { describe, expect, it } from "vitest";
import { isUnexplained } from "./processing/coordinator";
import { CONTACT_EMAIL } from "./constants";
import { failureReportHref } from "./report-failure";

const FAILURE = {
  reason: "crash: Error at info:CreationDate",
  format: "pdf",
  fileSize: 276692,
  userAgent: "Mozilla/5.0 (Macintosh) Chrome/156.0.0.0",
};

/** The address, subject and body, as a mail app would read them. */
function parts(href: string) {
  const url = new URL(href);
  return {
    to: url.pathname,
    subject: url.searchParams.get("subject") ?? "",
    body: decodeURIComponent(href.split("&body=")[1]),
  };
}

describe("failureReportHref", () => {
  it("addresses the email and names the format in the subject", () => {
    const { to, subject } = parts(failureReportHref(FAILURE));
    expect(to).toBe(CONTACT_EMAIL);
    expect(subject).toContain("pdf");
  });

  it("fills in what we'd otherwise have to ask for", () => {
    const { body } = parts(failureReportHref(FAILURE));
    expect(body).toContain("crash: Error at info:CreationDate");
    expect(body).toContain("270.2 KB");
    expect(body).toContain(FAILURE.userAgent);
  });

  it("asks what made the file, and doesn't ask for the file", () => {
    const { body } = parts(failureReportHref(FAILURE));
    expect(body).toMatch(/what made this file/i);
    expect(body).toMatch(/don't need to attach/i);
  });

  it("survives characters that would break a mailto link", () => {
    const href = failureReportHref({ ...FAILURE, userAgent: "a&b=c?d#e" });
    expect(parts(href).body).toContain("a&b=c?d#e");
  });
});

describe("isUnexplained", () => {
  it.each(["crash: Error", "crash: Error at info:Title", "unreadable: pdf", "empty_output: png"])(
    "asks about %s",
    (reason) => expect(isUnexplained(reason)).toBe(true)
  );

  it.each([
    // The browser failed the read, and the person has been told what to do.
    "crash: NotFoundError at read",
    "crash: NotReadableError",
    // A format or size we refused, which the message explains.
    "too_large",
    "unsupported_type",
    "recognised: tiff",
  ])("doesn't ask about %s", (reason) => expect(isUnexplained(reason)).toBe(false));

  it("doesn't ask when there's no reason", () => {
    expect(isUnexplained(undefined)).toBe(false);
  });
});

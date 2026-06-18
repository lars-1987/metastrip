"use client";

import { useState } from "react";
import Link from "next/link";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { Icon } from "@/components/shared/Icon";

/* ------------------------------------------------------------------ */
/*  Legal Section Component                                            */
/* ------------------------------------------------------------------ */

function LegalSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="mb-9 pb-9 last:mb-0 last:pb-0"
      style={{ borderBottom: "1px solid var(--card-inverse-muted)" }}
    >
      <div className="flex items-baseline gap-2.5 mb-3">
        <span
          className="text-xs font-bold font-[family-name:var(--font-mono)]"
          style={{ color: "var(--accent-strong)" }}
        >
          {number}.
        </span>
        <h2
          className="text-lg font-bold tracking-[-0.02em]"
          style={{ color: "var(--card-inverse-text)" }}
        >
          {title}
        </h2>
      </div>
      <div
        className="text-sm leading-[1.85] pl-7"
        style={{ color: "var(--card-inverse-muted)" }}
      >
        {children}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Privacy Policy Content                                             */
/* ------------------------------------------------------------------ */

function PrivacyPolicyContent() {
  return (
    <>
      {/* Short version box */}
      <div className="mb-10 p-5 px-6 rounded-[14px] bg-[color:color-mix(in_srgb,var(--accent-2)_15%,transparent)] border border-[color:color-mix(in_srgb,var(--accent-2)_25%,transparent)]">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="Lock" size={16} weight="duotone" className="text-[color:var(--accent-2)]" />
          <span className="text-sm font-semibold text-[color:var(--accent-2)] font-[family-name:var(--font-outfit)]">
            The short version
          </span>
        </div>
        <p className="text-sm text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.7]">
          Your files are processed entirely in your browser. We never see,
          store, or transmit your files. We don&apos;t track individual users.
          We collect minimal analytics data that cannot identify you. MetaStrip
          is completely free with no accounts required.
        </p>
      </div>

      <LegalSection number="1" title="Information We Do NOT Collect">
        <p className="mb-3">
          MetaStrip is designed to minimize data collection. We do not collect,
          store, or transmit the following:
        </p>
        <p className="mb-2">
          Your files, images, documents, or any content you process through
          MetaStrip. All file processing occurs entirely within your web browser
          using client-side JavaScript. Files are never uploaded to our servers
          or any third-party servers.
        </p>
        <p className="mb-2">
          The metadata contained within your files, including but not limited to
          GPS coordinates, author names, timestamps, device information, and any
          other embedded data.
        </p>
        <p className="mb-2">
          Personal information such as your name, address, phone number, or any
          identifying information beyond what is described in this policy.
        </p>
        <p>
          User accounts, profiles, or login credentials. MetaStrip does not have
          a user account system.
        </p>
      </LegalSection>

      <LegalSection number="2" title="Information We Collect">
        <p className="mb-3">
          We collect the minimum information necessary to operate the service:
        </p>
        <p className="mb-3">
          <span className="font-semibold">Analytics data:</span>{" "}
          We use PostHog for product analytics, configured to use localStorage
          instead of cookies and to respect the Do Not Track browser setting.
          PostHog collects page views, click interactions, referral sources,
          browser type, and country-level location. No personal profiles are
          created for anonymous visitors. This data cannot identify individual
          users.
        </p>
        <p>
          <span className="font-semibold">
            Tips via Ko-fi:
          </span>{" "}
          If you choose to leave a tip, payment is processed entirely by Ko-fi.
          We do not receive, process, or store any payment information. Tips are
          completely optional and do not unlock additional features.
        </p>
      </LegalSection>

      <LegalSection number="3" title="How We Process Your Files">
        <p className="mb-3">
          MetaStrip processes files using client-side JavaScript libraries
          running in your web browser. Specifically:
        </p>
        <p className="mb-2">
          Image files (JPEG, PNG, WebP) are processed using piexifjs and custom
          parsing code that runs entirely in your browser&apos;s JavaScript
          engine.
        </p>
        <p className="mb-2">
          PDF files are processed using pdf-lib, a pure JavaScript PDF library
          that runs in your browser.
        </p>
        <p className="mb-2">
          Office documents (DOCX, XLSX, PPTX) are processed using JSZip, which
          unpacks and modifies files entirely in browser memory.
        </p>
        <p className="mb-2">
          Video files (MP4, MOV, M4V) are processed using a custom in-browser
          MP4 atom walker that locates and overwrites metadata atoms (udta,
          meta, ©xyz, loci, and similar) without touching audio or video
          stream data.
        </p>
        <p className="mb-3">
          Audio files (MP3, M4A, FLAC, WAV) are processed using custom
          in-browser parsers for ID3v1/v2 tags, Vorbis comments, RIFF
          LIST/INFO chunks, and Broadcast Wave (bext) extensions. All parsing
          and rewriting happens in browser memory.
        </p>
        <p className="mb-3">
          At no point during processing are your files or any part of their
          contents transmitted over the network. You can verify this yourself by
          monitoring your browser&apos;s Network tab in Developer Tools while
          using MetaStrip.
        </p>
        <p>
          Processed files are generated in your browser&apos;s memory and
          downloaded directly to your device. Once you close or refresh the
          page, all file data in memory is discarded by your browser.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Cookies and Local Storage">
        <p className="mb-3">
          MetaStrip does not use tracking cookies or browser localStorage for
          any tracking purposes.
        </p>
        <p>
          Our analytics provider (PostHog) is configured to use localStorage
          instead of cookies and respects the Do Not Track browser setting.
        </p>
      </LegalSection>

      <LegalSection number="5" title="Third-Party Services">
        <p className="mb-2">
          <span className="font-semibold">Ko-fi</span> processes
          optional tips. See{" "}
          <Link
            href="https://more.ko-fi.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            ko-fi.com/privacy
          </Link>
          .
        </p>
        <p className="mb-2">
          <span className="font-semibold">
            PostHog
          </span>{" "}
          provides product analytics. See{" "}
          <Link
            href="https://posthog.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            posthog.com/privacy
          </Link>
          .
        </p>
        <p>
          <span className="font-semibold">GitHub Pages</span> hosts
          MetaStrip&apos;s website as static files. GitHub may collect
          standard server access logs (IP address, user agent) when serving
          the site. See{" "}
          <Link
            href="https://docs.github.com/en/site-policy/privacy-policies/github-general-privacy-statement"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            GitHub&apos;s privacy statement
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection number="6" title="Data Retention">
        <p className="mb-3">
          Since we do not collect personal data beyond payment receipts, there is
          minimal data to retain.
        </p>
        <p>
          PostHog retains aggregate analytics data. No personal profiles are
          created for anonymous visitors.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Your Rights">
        <p className="mb-3">
          Under GDPR, CCPA, and similar privacy regulations, you have the right
          to access, correct, or delete your personal data. Since MetaStrip
          collects minimal personal data, most of these rights are satisfied by
          default.
        </p>
        <p>
          If you have any privacy concerns, please contact us at{" "}
          <Link
            href="mailto:hello@metastrip.app"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            hello@metastrip.app
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection number="8" title="Children's Privacy">
        <p>
          MetaStrip is not directed at children under the age of 13. We do not
          knowingly collect personal information from children.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Changes to This Policy">
        <p>
          We may update this privacy policy from time to time. Changes will be
          posted on this page with an updated effective date. Continued use of
          MetaStrip after changes constitutes acceptance of the updated policy.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Contact">
        <p>
          For privacy-related questions or concerns, contact us at{" "}
          <Link
            href="mailto:hello@metastrip.app"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            hello@metastrip.app
          </Link>
          .
        </p>
      </LegalSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Terms of Service Content                                           */
/* ------------------------------------------------------------------ */

function TermsContent() {
  return (
    <>
      {/* Short version box */}
      <div className="mb-10 p-5 px-6 rounded-[14px] bg-[color:color-mix(in_srgb,var(--accent-strong)_15%,transparent)] border border-[color:color-mix(in_srgb,var(--accent-strong)_25%,transparent)]">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="ClipboardText" size={16} weight="duotone" className="text-[color:var(--accent-strong)]" />
          <span className="text-sm font-semibold text-[color:var(--accent-strong)] font-[family-name:var(--font-outfit)]">
            The short version
          </span>
        </div>
        <p className="text-sm text-[color:var(--text-secondary)] font-[family-name:var(--font-outfit)] leading-[1.7]">
          MetaStrip is a free metadata removal tool provided as-is. You&apos;re
          responsible for the files you process. Don&apos;t use the service for
          anything illegal.
        </p>
      </div>

      <LegalSection number="1" title="Acceptance of Terms">
        <p>
          By accessing or using MetaStrip (&quot;the Service&quot;), you agree
          to be bound by these Terms of Service. If you do not agree, do not use
          the Service. The Service is operated by MetaStrip (&quot;we&quot;,
          &quot;us&quot;, &quot;our&quot;).
        </p>
      </LegalSection>

      <LegalSection number="2" title="Description of Service">
        <p className="mb-3">
          MetaStrip is a web-based tool that removes metadata from digital
          files including images (JPEG, PNG, WebP), PDF documents, Microsoft
          Office documents (DOCX, XLSX, PPTX), video files (MP4, MOV, M4V),
          and audio files (MP3, M4A, FLAC, WAV). All file processing occurs
          in your web browser using client-side JavaScript. Files are not
          uploaded to any server; MetaStrip&apos;s site is served as static
          files from GitHub Pages and has no backend.
        </p>
        <p>
          The Service is completely free with support for batch processing of up
          to 20 files at a time.
        </p>
      </LegalSection>

      <LegalSection number="3" title="Usage Limits">
        <p className="mb-3">
          MetaStrip allows processing of up to 20 files per batch, supporting
          both images and documents. There are no daily limits.
        </p>
        <p>
          We reserve the right to modify usage limits at any time without
          notice.
        </p>
      </LegalSection>

      <LegalSection number="4" title="Tips and Support">
        <p>
          MetaStrip is free to use. Optional tips can be made via Ko-fi.
          Tips do not unlock additional features and are non-refundable.
          For any questions, contact us at{" "}
          <Link
            href="mailto:hello@metastrip.app"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            hello@metastrip.app
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection number="5" title="Acceptable Use">
        <p className="mb-3">You agree not to use MetaStrip to:</p>
        <p className="mb-2">
          Process files that you do not own or do not have the right to modify.
        </p>
        <p className="mb-2">
          Remove metadata for the purpose of misrepresenting the origin,
          authorship, or provenance of content in violation of applicable law.
        </p>
        <p className="mb-2">
          Remove copyright management information in violation of the Digital
          Millennium Copyright Act (DMCA) or equivalent laws in your
          jurisdiction.
        </p>
        <p className="mb-2">
          Facilitate fraud, identity theft, or any other illegal activity.
        </p>
        <p>
          Attempt to interfere with, disrupt, or exploit the Service or its
          infrastructure.
        </p>
      </LegalSection>

      <LegalSection number="6" title="Intellectual Property">
        <p className="mb-3">
          MetaStrip, its logo, design, and code are the intellectual property of
          MetaStrip and are protected by applicable copyright and trademark
          laws.
        </p>
        <p>
          You retain all ownership of and rights to the files you process
          through MetaStrip. We claim no rights to your content.
        </p>
      </LegalSection>

      <LegalSection number="7" title="Disclaimer of Warranties">
        <p className="mb-3">
          MetaStrip is provided &quot;as is&quot; and &quot;as available&quot;
          without warranties of any kind, either express or implied, including
          but not limited to implied warranties of merchantability, fitness for
          a particular purpose, and non-infringement.
        </p>
        <p className="mb-3">
          We do not warrant that MetaStrip will remove all metadata from all
          file types in all circumstances. Metadata standards and file formats
          are complex and evolving. While we strive for comprehensive metadata
          removal, some metadata may not be detected or removed, particularly in
          unusual or corrupted file formats.
        </p>
        <p>
          We do not warrant that the Service will be uninterrupted, error-free,
          or free of harmful components.
        </p>
      </LegalSection>

      <LegalSection number="8" title="Limitation of Liability">
        <p className="mb-3">
          To the maximum extent permitted by applicable law, MetaStrip and its
          operator shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, or any loss of profits or
          revenues, whether incurred directly or indirectly, or any loss of
          data, use, goodwill, or other intangible losses resulting from:
        </p>
        <p className="mb-2">
          Your use or inability to use the Service.
        </p>
        <p className="mb-2">
          Any failure of the Service to remove specific metadata from your
          files.
        </p>
        <p className="mb-2">
          Any unauthorized access to or alteration of your files (noting that
          MetaStrip does not transmit or store your files).
        </p>
        <p className="mb-3">
          Any other matter relating to the Service.
        </p>
        <p>
          Our total liability for any claims arising from or relating to the
          Service shall not exceed the amount you paid to MetaStrip in the 12
          months preceding the claim, or $10 USD, whichever is greater.
        </p>
      </LegalSection>

      <LegalSection number="9" title="Governing Law">
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of Victoria, Australia, without regard to its conflict of law
          provisions.
        </p>
      </LegalSection>

      <LegalSection number="10" title="Changes to Terms">
        <p>
          We reserve the right to modify these Terms at any time. Changes will
          be posted on this page with an updated effective date. Your continued
          use of the Service after changes constitutes acceptance of the
          modified Terms.
        </p>
      </LegalSection>

      <LegalSection number="11" title="Contact">
        <p>
          For questions about these Terms, contact us at{" "}
          <Link
            href="mailto:hello@metastrip.app"
            className="text-[color:var(--accent-strong)] hover:text-[color:var(--text-secondary)] transition-colors duration-200 underline decoration-[color:var(--accent-strong)]/40 underline-offset-2"
          >
            hello@metastrip.app
          </Link>
          .
        </p>
      </LegalSection>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Privacy/Legal Page                                            */
/* ------------------------------------------------------------------ */

const tabs = [
  { id: "privacy" as const, label: "Privacy Policy", icon: "lock" as const },
  { id: "terms" as const, label: "Terms of Service", icon: "clipboard" as const },
];

export function PrivacyPage() {
  const [activeTab, setActiveTab] = useState<"privacy" | "terms">("privacy");

  return (
    <>
      <TopNav />
      <main className="relative z-10" style={{ background: "var(--bg)" }}>
        <div className="max-w-[800px] mx-auto px-6 lg:px-8 pt-20 lg:pt-28 pb-24">
          {/* Header */}
          <div className="text-center mb-12">
            <div
              className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4"
              style={{ color: "var(--accent-strong)" }}
            >
              Legal
            </div>
            <h1
              className="font-extrabold leading-[1.05] tracking-[-0.04em] mb-4"
              style={{
                color: "var(--text)",
                fontSize: "clamp(40px, 5.5vw, 60px)",
              }}
            >
              Privacy &amp; Terms.
            </h1>
            <p
              className="leading-[1.6] mx-auto"
              style={{
                color: "var(--text-secondary)",
                fontSize: 17,
                maxWidth: 480,
              }}
            >
              Boring but important. Here&apos;s how we handle your data (spoiler:
              we don&apos;t).
            </p>
          </div>

          {/* Tab switcher */}
          <div
            className="flex gap-1.5 mb-8 p-1 rounded-2xl"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-all"
                style={{
                  background:
                    activeTab === tab.id
                      ? "var(--card-inverse-bg)"
                      : "transparent",
                  color:
                    activeTab === tab.id
                      ? "var(--card-inverse-text)"
                      : "var(--text-muted)",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                <Icon
                  name={tab.id === "privacy" ? "Lock" : "ClipboardText"}
                  size={15}
                  weight="duotone"
                />
                <span className="text-[13px] font-semibold">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Effective date */}
          <div
            className="flex items-center gap-2 mb-6 text-xs font-[family-name:var(--font-mono)]"
            style={{ color: "var(--text-muted)" }}
          >
            <span>Effective: March 1, 2026</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Last updated: March 1, 2026</span>
          </div>

          {/* Content — dark card */}
          <div
            key={activeTab}
            className="p-8 sm:p-9 rounded-3xl"
            style={{
              background: "var(--card-inverse-bg)",
              color: "var(--card-inverse-text)",
              boxShadow:
                "0 12px 32px -8px rgba(31,21,48,0.18), 0 2px 8px -2px rgba(31,21,48,0.08)",
            }}
          >
            {activeTab === "privacy" ? (
              <PrivacyPolicyContent />
            ) : (
              <TermsContent />
            )}
          </div>

          {/* Contact bar */}
          <div
            className="mt-8 py-5 px-6 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <p
                className="text-sm font-bold"
                style={{ color: "var(--text)" }}
              >
                Questions about our policies?
              </p>
              <p
                className="text-[13px] mt-0.5"
                style={{ color: "var(--text-secondary)" }}
              >
                We&apos;re happy to clarify anything.
              </p>
            </div>
            <Link
              href="mailto:hello@metastrip.app"
              className="py-2.5 px-5 rounded-xl text-[13px] font-semibold no-underline transition-all hover:-translate-y-px"
              style={{
                background: "var(--accent)",
                color: "var(--accent-fg)",
              }}
            >
              hello@metastrip.app
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

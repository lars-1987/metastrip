import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
// Order matters: globals.css defines the V2 :root tokens + Tailwind base + keyframes;
// v3-theme.css then layers the .v3-root-scoped greyscale tokens on top. Anything inside
// .v3-root gets V3; the terminal (outside .v3-root) keeps the V2 :root tokens.
import "./globals.css";
import "./v3-theme.css";
import { PostHogProviderWrapper } from "@/components/providers/PostHogProvider";

// JetBrains Mono stays the global --font-mono (used by the terminal at /terminal and the
// Tailwind font-mono utility). The V3 site overrides --font-mono with Geist inside .v3-root.
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://metastrip.app"),
  title: "MetaStrip, strip hidden metadata from files",
  description:
    "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from your files. 100% client-side; files never leave your device.",
  openGraph: {
    type: "website",
    siteName: "MetaStrip",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MetaStrip, strip hidden metadata from files" }],
  },
  twitter: {
    card: "summary_large_image",
    creator: "@larsitodev",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <PostHogProviderWrapper>{children}</PostHogProviderWrapper>
      </body>
    </html>
  );
}

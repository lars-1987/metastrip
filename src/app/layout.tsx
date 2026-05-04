import type { Metadata } from "next";
import { Outfit, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProviderWrapper } from "@/components/providers/PostHogProvider";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://metastrip.app"),
  title: {
    default: "MetaStrip — Strip Hidden Metadata from Files",
    template: "%s — MetaStrip",
  },
  description:
    "Remove GPS coordinates, camera info, author names, timestamps, and AI generation tags from your files. 100% client-side — files never leave your device.",
  openGraph: {
    type: "website",
    siteName: "MetaStrip",
    locale: "en_US",
    images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: "MetaStrip — Strip Hidden Metadata from Files" }],
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
    <html lang="en">
      <body className={`${outfit.variable} ${jetbrainsMono.variable} antialiased`}>
        <PostHogProviderWrapper>
          {children}
        </PostHogProviderWrapper>
      </body>
    </html>
  );
}

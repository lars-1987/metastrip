import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { PostHogProviderWrapper } from "@/components/providers/PostHogProvider";
import { ThemeProvider, themeInitScript } from "@/components/shared/ThemeProvider";

// Terminal stays JetBrains Mono. Body inherits system-ui via --font-sans (defined in globals.css).
const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://metastrip.app"),
  title: "MetaStrip — Strip Hidden Metadata from Files",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-theme before hydration so we don't flash the wrong theme. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${jetbrainsMono.variable} antialiased`}>
        <ThemeProvider>
          <PostHogProviderWrapper>{children}</PostHogProviderWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}

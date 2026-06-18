import { Metadata } from "next";
import { AboutPage } from "@/components/AboutPage";
import { OG_IMAGE } from "@/lib/og";

export const metadata: Metadata = {
  title: "About, MetaStrip",
  description:
    "MetaStrip is a privacy-first metadata removal tool. Files are processed entirely in your browser; we never see, store, or transmit them.",
  openGraph: {
    title: "About, MetaStrip",
    description:
      "MetaStrip is a privacy-first metadata removal tool. Files are processed entirely in your browser.",
    url: "https://metastrip.app/about",
    siteName: "MetaStrip",
    type: "website",
    images: [OG_IMAGE],
  },
  alternates: { canonical: "https://metastrip.app/about" },
};

export default function Page() {
  return <AboutPage />;
}

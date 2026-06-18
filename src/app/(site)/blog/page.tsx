import { Metadata } from "next";
import BlogIndex from "@/components/blog/BlogIndex";
import { OG_IMAGE } from "@/lib/og";

export const metadata: Metadata = {
  title: "Blog, MetaStrip",
  description:
    "Privacy guides, metadata explainers, and digital self-defense tips from MetaStrip.",
  openGraph: {
    title: "Blog, MetaStrip",
    description:
      "Privacy guides, metadata explainers, and digital self-defense tips.",
    url: "https://metastrip.app/blog",
    siteName: "MetaStrip",
    type: "website",
    images: [OG_IMAGE],
  },
  alternates: { canonical: "https://metastrip.app/blog" },
};

export default function Page() {
  return <BlogIndex />;
}

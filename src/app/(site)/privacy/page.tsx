import { Metadata } from "next";
import { PrivacyPage } from "@/components/PrivacyPage";
import { OG_IMAGE } from "@/lib/og";

export const metadata: Metadata = {
  title: "Privacy Policy & Terms, MetaStrip",
  description:
    "MetaStrip privacy policy and terms of service. Your files never leave your browser; we never see, store, or transmit them.",
  openGraph: {
    title: "Privacy Policy & Terms, MetaStrip",
    description:
      "MetaStrip privacy policy and terms of service. Your files never leave your browser.",
    url: "https://metastrip.app/privacy",
    siteName: "MetaStrip",
    type: "website",
    images: [OG_IMAGE],
  },
  alternates: { canonical: "https://metastrip.app/privacy" },
};

export default function Page() {
  return <PrivacyPage />;
}

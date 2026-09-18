import type { Metadata } from "next";
import { TerminalApp } from "@/components/terminal/TerminalApp";

export const metadata: Metadata = {
  title: "MetaStrip Terminal",
  description:
    "The original terminal interface for MetaStrip. Remove GPS, camera info, author names, and AI tags from your files, 100% client-side.",
  alternates: { canonical: "https://metastrip.app/terminal" },
};

export default function TerminalPage() {
  return <TerminalApp />;
}

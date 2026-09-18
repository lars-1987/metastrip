import type { Metadata } from "next";

// The terminal is an easter egg, kept out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TerminalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children;
}

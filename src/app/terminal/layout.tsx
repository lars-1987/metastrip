import type { Metadata } from "next";
import { ThemeProvider, themeInitScript } from "@/components/shared/ThemeProvider";

// The terminal is an easter egg, kept out of search.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function TerminalLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      {/* V2 theme bootstrap: sets data-theme on <html> before the terminal paints.
          Scoped to /terminal so the V3 site isn't affected. */}
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <ThemeProvider>{children}</ThemeProvider>
    </>
  );
}

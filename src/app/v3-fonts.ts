import localFont from "next/font/local";
import { Geist_Mono } from "next/font/google";

// Shared V3 font faces, applied on every .v3-root element (the (site) layout and
// the standalone 404). General Sans = display; Geist Mono = --font-mono, scoped to
// .v3-root so it overrides the terminal's JetBrains Mono only inside the V3 site.
export const generalSans = localFont({
  src: "./fonts/GeneralSans-Variable.woff2",
  variable: "--font-display",
  weight: "200 700",
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  display: "swap",
});

import type { Metadata } from "next";
import { HomeMain } from "@/components/home/HomeMain";
import { homeJsonLd, homeMetadata } from "@/components/home/localizedHome";

export const metadata: Metadata = homeMetadata("de");

export default function Page() {
  return <HomeMain locale="de" jsonLd={homeJsonLd("de")} />;
}

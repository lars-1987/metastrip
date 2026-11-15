import type { Metadata } from "next";
import { HomeMain } from "@/components/home/HomeMain";
import { homeJsonLd, homeMetadata } from "@/components/home/localizedHome";

export const metadata: Metadata = homeMetadata("es");

export default function Page() {
  return <HomeMain locale="es" jsonLd={homeJsonLd("es")} />;
}

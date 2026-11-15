import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ToolPageBody, toolMetadata } from "@/components/seo/toolPage";
import { TRANSLATED_TOOL_SLUGS } from "@/lib/i18n";
import { translatedToolConfig } from "@/lib/i18n/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return TRANSLATED_TOOL_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const config = translatedToolConfig("es", (await params).slug);
  return config ? toolMetadata(config, "es") : {};
}

export default async function Page({ params }: PageProps) {
  const config = translatedToolConfig("es", (await params).slug);
  if (!config) notFound();
  return <ToolPageBody config={config} locale="es" />;
}

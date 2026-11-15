import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSEOConfig, SEO_SLUGS } from "@/lib/seo-configs";
import { ToolPageBody, toolMetadata } from "@/components/seo/toolPage";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return SEO_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = getSEOConfig(slug);
  return config ? toolMetadata(config, "en") : {};
}

export default async function Page({ params }: PageProps) {
  const { slug } = await params;
  const config = getSEOConfig(slug);
  if (!config) notFound();
  return <ToolPageBody config={config} locale="en" />;
}

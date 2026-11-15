import type { Metadata } from "next";
import { OG_IMAGE } from "@/lib/og";
import { languageAlternates, localePath, messagesFor, type Locale } from "@/lib/i18n";

/* Search titles, descriptions and structured data for the Spanish and German
   homepages (MS-6). Titles lead with what people search ("eliminar
   metadatos", "Metadaten entfernen"), the way the English test (MS-5) does. */

type Translated = Exclude<Locale, "en">;

const META: Record<Translated, { title: string; description: string; og: string; app: string }> = {
  es: {
    title: "Eliminar metadatos de fotos, PDF y vídeos gratis | MetaStrip",
    description:
      "Elimina el GPS, los datos de la cámara, el autor, las etiquetas de IA y las credenciales C2PA de fotos, vídeos, PDF y documentos. Gratis, y tus archivos no salen de tu dispositivo.",
    og: "es_ES",
    app: "Elimina los metadatos ocultos de fotos, vídeos, PDF, documentos de Word y más: etiquetas de IA y credenciales de contenido C2PA, coordenadas GPS, datos de la cámara, nombres de autor y fechas, todo en tu navegador.",
  },
  de: {
    title: "Metadaten entfernen: Fotos, PDFs und Videos, kostenlos | MetaStrip",
    description:
      "Entferne GPS, Kameradaten, Autor, KI-Tags und C2PA-Inhaltsnachweise aus Fotos, Videos, PDFs und Dokumenten. Kostenlos, und deine Dateien verlassen nie dein Gerät.",
    og: "de_DE",
    app: "Entfernt versteckte Metadaten aus Fotos, Videos, PDFs, Word-Dokumenten und mehr: KI-Kennzeichnungen und C2PA-Inhaltsnachweise, GPS-Koordinaten, Kameradaten, Autorennamen und Zeitstempel, komplett in deinem Browser.",
  },
};

const url = (locale: Translated) => `https://metastrip.app${localePath(locale, "/")}`;

export function homeMetadata(locale: Translated): Metadata {
  const m = META[locale];
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url(locale), languages: languageAlternates("/") },
    openGraph: { title: m.title, description: m.description, url: url(locale), locale: m.og, images: [OG_IMAGE] },
  };
}

export function homeJsonLd(locale: Translated): object[] {
  const faq = messagesFor(locale).faq.items;
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "MetaStrip",
      url: url(locale),
      inLanguage: locale,
      description: META[locale].app,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      inLanguage: locale,
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: item.answer },
      })),
    },
  ];
}

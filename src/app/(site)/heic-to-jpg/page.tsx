import type { Metadata } from "next";
import Link from "next/link";
import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { ConverterTool } from "@/components/converter/ConverterTool";
import { BATCH_LIMIT } from "@/lib/constants";
import { OG_IMAGE } from "@/lib/og";

/* /heic-to-jpg: the converter on its own page (Duet MS-3). The homepage and
   the main tool are untouched. The FAQ below is the one source for both the
   page and its FAQPage schema. */

const PAGE_URL = "https://metastrip.app/heic-to-jpg";
const TITLE = "HEIC to JPG Converter, Free and Private | MetaStrip";
const DESCRIPTION =
  "Convert iPhone HEIC photos, and PNG, WebP or AVIF images, to JPG in your browser, in bulk. Nothing is uploaded, and location and camera details are removed.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: PAGE_URL, siteName: "MetaStrip", type: "website", images: [OG_IMAGE] },
};

const FAQ: { question: string; answer: string }[] = [
  {
    question: "Are my photos uploaded anywhere?",
    answer:
      "No. The conversion runs in your browser, on your device. The photos are read, converted and saved without leaving it, which you can check in your browser's network tools while converting. The page sends anonymous usage counts, such as how many files were converted, never names, pictures or metadata.",
  },
  {
    question: "Does converting HEIC to JPG lose quality?",
    answer:
      "A little, as any JPG does, but not so you'd see it at normal size. The converter saves at quality 90, close to what an iPhone set to Most Compatible saves. The JPG is usually larger than the HEIC, because JPG compresses less efficiently.",
  },
  {
    question: "Is the location removed from the photos?",
    answer:
      "Yes, by default. Location, date taken, camera details and every other piece of metadata are left out of the JPG. If you want to keep the location, the date or the camera details, tick them before you add the photos; everything else is still removed. Each JPG is then read again to check that only what you kept is there.",
  },
  {
    question: "How many photos can I convert at once?",
    answer: `Up to ${BATCH_LIMIT} at a time. They're converted one after another, so a phone doesn't run out of memory, and you get them back as one zip, or through the share sheet on a phone.`,
  },
  {
    question: "Will the colours change?",
    answer:
      "No, in Chrome, Edge and Safari: iPhone photos are in Display P3, a wider colour space than standard, and the JPG keeps it, with its colour profile. Firefox can't hold P3 colours, so there the converter turns them into standard sRGB, the closest match it can show.",
  },
  {
    question: "Can I convert other images to JPG?",
    answer:
      "Yes: PNG, WebP, AVIF and GIF too, and JPGs themselves if you just want a clean copy. Transparent areas become white, since JPG has no transparency, and an animated GIF or WebP gives its first frame.",
  },
  {
    question: "What about Live Photos and HDR?",
    answer:
      "The still photo converts; the moving part of a Live Photo is a separate video file and isn't touched. HDR brightness and Portrait depth data have no place in a JPG, so the JPG shows the standard picture.",
  },
];

const webAppLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "MetaStrip HEIC to JPG converter",
  url: PAGE_URL,
  description: DESCRIPTION,
  applicationCategory: "MultimediaApplication",
  operatingSystem: "Any",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "HEIC to JPG in the browser, nothing uploaded",
    `Bulk conversion, up to ${BATCH_LIMIT} photos`,
    "Location and camera metadata removed by default",
    "Display P3 colour kept where the browser supports it",
    "PNG, WebP, AVIF and GIF to JPG",
  ],
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-4 text-[clamp(22px,2.4vw,28px)] font-bold tracking-[-0.02em] text-[var(--text)]">{title}</h2>
      <div className="space-y-4 text-[17px] leading-[1.7] text-[var(--text-secondary)]">{children}</div>
    </section>
  );
}

const linkClass = "text-[var(--text)] underline decoration-[var(--border-strong)] underline-offset-2 hover:decoration-[var(--text)]";

export default function HeicToJpgPage() {
  return (
    <main className="relative min-h-screen bg-[var(--bg)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <div className="relative z-10 bg-[var(--bg)] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]">
        <TopNav />

        <section className="px-6 pt-6 text-center md:pt-7">
          <p className="v3-mono text-[12px] font-bold uppercase tracking-[0.18em] text-[var(--text-muted)]">
            HEIC, PNG AND WEBP TO JPG: FREE, NOTHING UPLOADED
          </p>
        </section>

        <section className="relative px-5 pt-4 md:px-[116px] md:pt-5">
          <div className="mx-auto w-full max-w-5xl">
            <ConverterTool />
          </div>
        </section>

        <section className="px-6 pb-4 pt-16 text-center lg:px-8 lg:pt-24">
          <div className="mx-auto max-w-3xl">
            <h1
              className="mb-5 font-extrabold leading-[1.05] tracking-[-0.04em] text-[var(--text)]"
              style={{ fontSize: "clamp(40px, 5.5vw, 64px)" }}
            >
              HEIC to JPG converter
            </h1>
            <p
              className="mx-auto font-medium leading-[1.55] text-[var(--text-secondary)]"
              style={{ fontSize: "clamp(17px, 1.6vw, 20px)", maxWidth: 600 }}
            >
              Turn iPhone photos into JPGs that open anywhere, a whole batch at once, without uploading them and without the location they were taken. PNG, WebP, AVIF and GIF images work too.
            </p>
          </div>
        </section>

        <article className="px-6 pb-24 pt-12 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <Section title="How to convert HEIC to JPG">
              <ol className="list-decimal space-y-2 pl-6">
                <li>Choose whether to keep the location, date taken or camera details. By default, nothing is kept.</li>
                <li>Drop your HEIC photos, or PNG, WebP, AVIF or GIF images, on the converter above, or tap Choose photos. On an iPhone you can pick straight from your library.</li>
                <li>Each photo converts in turn, and is checked for leftover metadata as it finishes.</li>
                <li>Download the JPG, or all of them as one zip. On a phone, Save or share puts them in Photos or sends them on.</li>
              </ol>
            </Section>

            <Section title="Why iPhone photos are HEIC">
              <p>
                Since iOS 11, iPhones save photos as HEIC (High Efficiency Image Container): up to half the size of a JPG of the same quality. Apple&apos;s devices open them without a thought; plenty of other things don&apos;t.
              </p>
              <p>
                Windows needs extra extensions from the Microsoft Store to open them, some older Android phones and photo kiosks can&apos;t open them, and many websites&apos; upload forms only take JPG or PNG. A JPG opens everywhere.
              </p>
              <p>
                To have your iPhone shoot JPGs from now on, go to Settings, Camera, Formats and choose Most Compatible. Photos you&apos;ve already taken stay HEIC, which is what the converter is for.
              </p>
            </Section>

            <Section title="Other images to JPG">
              <p>
                The converter isn&apos;t only for iPhone photos. PNG, WebP, AVIF and GIF images become JPGs the same way, and so do JPGs themselves, if you just want a clean copy without the metadata.
              </p>
              <p>
                WebP and AVIF are what many websites now serve, so an image saved from a browser often arrives in one of them, and plenty of apps and upload forms still won&apos;t take it. PNG opens almost everywhere, but a photo saved as PNG can be several times the size of the same photo as a JPG.
              </p>
              <p>
                JPG has no transparency, so transparent areas of a PNG, WebP or GIF become white. An animated GIF or WebP gives its first frame. If you need the transparency, keep the PNG.
              </p>
            </Section>

            <Section title="What happens to the metadata">
              <p>
                An iPhone photo carries more than the picture: the exact place it was taken, the date and time, the phone model and its software. Many converters copy all of that into the JPG. This one doesn&apos;t: the JPG is built from the pixels alone.
              </p>
              <p>
                If you want some of it back, tick Location, Date taken or Camera details before you add the photos, and only those are carried across. Other details, such as editing history (XMP), Content Credentials (C2PA) and the small preview copy inside the original, are always left behind.
              </p>
              <p>
                Then every JPG is read again, the way you&apos;d check by opening it in a metadata viewer, and its row says what the check found. The same check runs in MetaStrip&apos;s{" "}
                <Link href="/remove-metadata-from-photos" className={linkClass}>photo metadata remover</Link>, which cleans photos without converting them, HEIC included.
              </p>
            </Section>

            <Section title="Private by design">
              <p>
                There&apos;s no upload step to trust. The converter runs in your browser: Safari opens HEIC itself, and in Chrome, Edge and Firefox the page loads libheif, an open-source HEIC decoder, the first time it&apos;s needed. Your photos never leave your device, and closing the tab clears them.
              </p>
              <p>
                MetaStrip is open source, so you can read exactly what it does on{" "}
                <a href="https://github.com/lars-1987/metastrip" className={linkClass} target="_blank" rel="noopener noreferrer">GitHub</a>.
              </p>
            </Section>

            <Section title="Questions">
              <div className="space-y-3">
                {FAQ.map((f) => (
                  <details key={f.question} className="group rounded-[var(--radius-sm)] bg-[var(--surface)] px-5 py-4">
                    <summary className="cursor-pointer list-none text-[17px] font-semibold text-[var(--text)] [&::-webkit-details-marker]:hidden">
                      <span className="flex items-center justify-between gap-4">
                        {f.question}
                        <span aria-hidden className="text-[var(--text-muted)] transition-transform group-open:rotate-45">+</span>
                      </span>
                    </summary>
                    <p className="mt-3 text-[16px] leading-[1.7] text-[var(--text-secondary)]">{f.answer}</p>
                  </details>
                ))}
              </div>
            </Section>
          </div>
        </article>
      </div>
      <Footer />
    </main>
  );
}

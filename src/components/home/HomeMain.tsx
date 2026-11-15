import { TopNav } from "@/components/v3/ui/TopNav";
import { Footer } from "@/components/v3/ui/Footer";
import { Hero } from "@/components/v3/sections/Hero";
import { HeroIntro } from "@/components/v3/sections/HeroIntro";
import { HowItWorks } from "@/components/v3/sections/HowItWorks";
import { Faq } from "@/components/v3/sections/Faq";
import { ScrollReveals } from "@/components/v3/ScrollReveals";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n";

/** The homepage body, in any language: `/` renders it in English, `/es` and
 *  `/de` in theirs. The tool deep inside reads the language from the provider. */
export function HomeMain({ locale, jsonLd }: { locale: Locale; jsonLd: object[] }) {
  return (
    <LocaleProvider locale={locale}>
      <main className="relative min-h-screen bg-[var(--bg)]" {...(locale !== "en" && { lang: locale })}>
        {/* The root layout says lang="en" for the whole site; correct it before
            paint on a translated page, for screen readers and search engines. */}
        {locale !== "en" && <script dangerouslySetInnerHTML={{ __html: `document.documentElement.lang=${JSON.stringify(locale)}` }} />}
        {jsonLd.map((ld, i) => (
          <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
        ))}
        <ScrollReveals />
        {/* Content lifts off the footer as you scroll; the shadow on its bottom
            edge casts onto the footer being revealed underneath. */}
        <div className="relative z-10 bg-[var(--bg)] shadow-[0_40px_70px_-30px_rgba(0,0,0,0.45)]">
          <TopNav />
          <Hero locale={locale} />
          <HeroIntro locale={locale} />
          <HowItWorks locale={locale} />
          <Faq locale={locale} />
        </div>
        <Footer />
      </main>
    </LocaleProvider>
  );
}

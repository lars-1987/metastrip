import { messagesFor, type Locale } from "@/lib/i18n";
/** Recycled from V2 — three-up explainer, same copy. */

export function HowItWorks({ locale = "en" }: { locale?: Locale }) {
  const m = messagesFor(locale).how;
  return (
    <section id="how" className="px-6 lg:px-8 py-24 lg:py-32 scroll-mt-24">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16 lg:mb-20" data-reveal>
          <div className="text-[12px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "var(--accent-strong)" }}>
            {m.eyebrow}
          </div>
          <h2 className="font-extrabold tracking-[-0.03em] leading-[1.05]" style={{ color: "var(--text)", fontSize: "clamp(36px, 5vw, 60px)" }}>
            {m.title[0]}<br />{m.title[1]}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6" data-reveal-group>
          {m.features.map((f) => (
            <article
              key={f.title}
              data-reveal-item
              className="rounded-3xl p-7 lg:p-8"
              style={{
                background: "var(--card-inverse-bg)",
                color: "var(--card-inverse-text)",
                boxShadow: "0 12px 32px -8px rgba(20,15,12,0.22), 0 2px 8px -2px rgba(20,15,12,0.1)",
              }}
            >
              <div className="text-[11px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: "var(--accent-strong)" }}>
                {f.eyebrow}
              </div>
              <h3 className="font-bold tracking-[-0.02em] leading-[1.2] mb-4" style={{ color: "var(--card-inverse-text)", fontSize: "clamp(22px, 2.4vw, 28px)" }}>
                {f.title}
              </h3>
              <p className="leading-[1.65] mb-6" style={{ color: "var(--card-inverse-muted)", fontSize: 16 }}>
                {f.body}
              </p>
              {f.bullets && (
                <ul className="space-y-2.5 list-none p-0 m-0">
                  {f.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 leading-[1.55]" style={{ color: "var(--card-inverse-muted)", fontSize: 15 }}>
                      <span className="shrink-0 mt-[7px]" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-strong)" }} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

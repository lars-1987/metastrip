"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_NAMES, switchTarget } from "@/lib/i18n";
import { useLocale, useMessages } from "@/components/i18n/LocaleProvider";

/* English · Español · Deutsch, in the top bar (MS-6). Each choice goes to the
   same page in that language when there is one, else to that language's
   homepage. Plain links, so it works before the page's JavaScript loads. */

export function LanguageSwitcher() {
  const locale = useLocale();
  const label = useMessages().nav.language;
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); window.removeEventListener("keydown", onKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label={`${label}: ${LOCALE_NAMES[locale]}`}
        className="flex h-10 items-center gap-1.5 rounded-[var(--radius-pill)] bg-[var(--card-elevated)] px-3 text-[14px] font-medium uppercase text-[var(--text)] transition-colors hover:bg-[var(--primary)] hover:text-[var(--on-primary)]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
          <path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        </svg>
        {locale}
      </button>
      {open && (
        <ul className="absolute right-0 top-12 z-[70] min-w-[150px] list-none overflow-hidden rounded-[14px] bg-[var(--card-elevated)] p-1.5 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.55)]">
          {LOCALES.map((l) => (
            <li key={l}>
              <a
                href={switchTarget(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                className={`block rounded-[10px] px-3.5 py-2.5 text-[15px] no-underline transition-colors hover:bg-[var(--card)] ${
                  l === locale ? "font-semibold text-[var(--text)]" : "text-[var(--text-body)]"
                }`}
              >
                {LOCALE_NAMES[l]}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

"use client";

import { createContext, useContext, type ReactNode } from "react";
import { messagesFor, type Locale, type Messages } from "@/lib/i18n";

/* The page's language, for client components deep in the tool. Pages that
   don't set one are English, so every existing page works unchanged. */

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

export function useMessages(): Messages {
  return messagesFor(useContext(LocaleContext));
}

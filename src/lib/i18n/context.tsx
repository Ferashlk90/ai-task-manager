"use client";

import { createContext, useContext } from "react";
import { DEFAULT_LOCALE, dir, type Locale } from "./config";
import { dictionaries, type Dictionary } from "./dictionaries";

type I18n = { locale: Locale; t: Dictionary; dir: "rtl" | "ltr" };

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value: I18n = { locale, t: dictionaries[locale], dir: dir(locale) };
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// Falls back to the default locale instead of throwing, so error boundaries
// rendered outside a provider still get usable strings.
export function useI18n(): I18n {
  return (
    useContext(I18nContext) ?? {
      locale: DEFAULT_LOCALE,
      t: dictionaries[DEFAULT_LOCALE],
      dir: dir(DEFAULT_LOCALE),
    }
  );
}

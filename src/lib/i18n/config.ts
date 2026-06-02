// Locale primitives — a plain module, safe to import on server or client.

export const LOCALES = ["ar", "en"] as const;
export type Locale = (typeof LOCALES)[number];

// English by default (LTR); Arabic is available via the in-app toggle and
// persists in a cookie once chosen.
export const DEFAULT_LOCALE: Locale = "en";

// Non-httpOnly so it can be inspected client-side; set via the setLocale action.
export const LOCALE_COOKIE = "ptm_locale";

export function dir(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function isLocale(value: unknown): value is Locale {
  return (
    typeof value === "string" && (LOCALES as readonly string[]).includes(value)
  );
}

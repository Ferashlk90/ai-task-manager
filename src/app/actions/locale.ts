"use server";

import { cookies } from "next/headers";
import { LOCALE_COOKIE, DEFAULT_LOCALE, isLocale } from "@/lib/i18n/config";

// Persists the chosen UI language for a year. Not httpOnly — it's a display
// preference, not a credential. The caller refreshes the route afterwards so
// server-rendered locale (html dir/lang, server components) updates too.
export async function setLocale(locale: string): Promise<void> {
  (await cookies()).set(
    LOCALE_COOKIE,
    isLocale(locale) ? locale : DEFAULT_LOCALE,
    {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    },
  );
}

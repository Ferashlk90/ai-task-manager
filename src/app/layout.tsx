import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { dir } from "@/lib/i18n/config";
import { getLocale } from "@/lib/i18n/server";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { I18nProvider } from "@/lib/i18n/context";
import { THEME_COOKIE, THEME_INIT_SCRIPT, isTheme } from "@/lib/theme";

// Cairo carries both Arabic and Latin, so one font serves both locales.
const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const t = dictionaries[await getLocale()];
  return {
    title: t.appName,
    description: t.metaDescription,
    // Installed-PWA (iOS) presentation.
    appleWebApp: { capable: true, title: t.appName, statusBarStyle: "default" },
  };
}

// Browser address-bar color, matched to the OS light/dark preference.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f5f7" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0b0d" },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  // Render the cookie's theme when known; otherwise the init script resolves
  // it from the OS before paint. suppressHydrationWarning covers that case.
  const themeCookie = (await cookies()).get(THEME_COOKIE)?.value;
  const theme = isTheme(themeCookie) ? themeCookie : undefined;
  // CSP nonce minted in proxy.ts; the inline theme script needs it to run.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang={locale}
      dir={dir(locale)}
      data-theme={theme}
      suppressHydrationWarning
      className={`${cairo.variable} h-full`}
    >
      <body className="min-h-full antialiased">
        <script
          nonce={nonce}
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        <I18nProvider locale={locale}>{children}</I18nProvider>
      </body>
    </html>
  );
}

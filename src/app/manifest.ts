import type { MetadataRoute } from "next";
import { dir } from "@/lib/i18n/config";
import { getLocale, getDictionary } from "@/lib/i18n/server";

// Dynamic (reads the locale cookie) so the install name/label and direction
// match the user's chosen UI language.
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const locale = await getLocale();
  const t = await getDictionary();

  return {
    name: t.appName,
    short_name: t.appName,
    description: t.metaDescription,
    lang: locale,
    dir: dir(locale),
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0d",
    theme_color: "#14171a",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}

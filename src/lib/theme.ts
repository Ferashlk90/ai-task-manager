// Theme primitives — plain module, safe on server or client.

export const THEMES = ["light", "dark"] as const;
export type Theme = (typeof THEMES)[number];

// Not httpOnly — it's a display preference. Set client-side by the toggle and
// read server-side to render the right <html data-theme> (avoids a flash).
export const THEME_COOKIE = "ptm_theme";

export function isTheme(value: unknown): value is Theme {
  return value === "light" || value === "dark";
}

// Runs before paint to set data-theme from the cookie, falling back to the OS
// preference on first visit. Stringified and injected into the document head.
export const THEME_INIT_SCRIPT = `(function(){try{var m=document.cookie.match(/(?:^|;\\s*)${THEME_COOKIE}=(light|dark)/);var t=m?m[1]:(window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t;}catch(e){}})();`;

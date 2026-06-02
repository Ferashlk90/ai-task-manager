"use client";

import { useI18n } from "@/lib/i18n/context";
import { THEME_COOKIE } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Theme is pure CSS keyed off <html data-theme>, so toggling is instant and
// client-only: flip the attribute and persist a cookie for the next load.
// The icon is chosen by CSS (dark:) so there's no hydration mismatch.
export function ThemeToggle({ className }: { className?: string }) {
  const { t } = useI18n();

  function toggle() {
    const el = document.documentElement;
    const next = el.dataset.theme === "dark" ? "light" : "dark";
    el.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.common.themeToggle}
      className={cn(
        "grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-strong",
        className,
      )}
    >
      {/* Moon — shown in light mode (tap to go dark) */}
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="size-5 dark:hidden"
        aria-hidden
      >
        <path d="M9.5 2.5a.75.75 0 0 0-.9-.74A7 7 0 1 0 18.24 11.4a.75.75 0 0 0-.74-.9 5.5 5.5 0 0 1-8-8z" />
      </svg>
      {/* Sun — shown in dark mode (tap to go light) */}
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className="hidden size-5 dark:block"
        aria-hidden
      >
        <path d="M10 1.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 1.5zm0 13a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 14.5zM18.5 10a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75zm-14 0a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 4.5 10zm11.08-5.58a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.07-1.06l.71-.7a.75.75 0 0 1 1.06 0zM6.19 13.81a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 0 1-1.07-1.06l.71-.7a.75.75 0 0 1 1.06 0zm-1.77-9.39a.75.75 0 0 1 1.06 0l.7.71a.75.75 0 0 1-1.06 1.06l-.7-.71a.75.75 0 0 1 0-1.06zm9.39 9.39a.75.75 0 0 1 1.06 0l.7.7a.75.75 0 1 1-1.06 1.07l-.7-.71a.75.75 0 0 1 0-1.06zM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
      </svg>
    </button>
  );
}

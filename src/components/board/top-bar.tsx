"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { logout } from "@/app/actions/auth";
import { setLocale } from "@/app/actions/locale";
import { useI18n } from "@/lib/i18n/context";
import { THEME_COOKIE } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/logo";

export function TopBar({
  email,
  onOpenSettings,
}: {
  email: string;
  onOpenSettings: () => void;
}) {
  const { t } = useI18n();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-2.5">
          <Logo className="size-8 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold tracking-tight text-fg">
              {t.appName}
            </h1>
            <p className="truncate text-xs text-faint">{email}</p>
          </div>
        </div>
        <TopMenu onOpenSettings={onOpenSettings} />
      </div>
    </header>
  );
}

const ITEM =
  "flex w-full items-center gap-2.5 px-3 py-2 text-start text-sm text-strong transition-colors hover:bg-surface-muted";

function TopMenu({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { t, locale } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function toggleTheme() {
    const el = document.documentElement;
    const next = el.dataset.theme === "dark" ? "light" : "dark";
    el.dataset.theme = next;
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
  }

  function switchLanguage() {
    const next = locale === "ar" ? "en" : "ar";
    setOpen(false);
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.menu.open}
        aria-haspopup="menu"
        aria-expanded={open}
        className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-strong"
      >
        <MenuIcon />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute end-0 z-40 mt-1 w-52 overflow-hidden rounded-xl border border-line bg-surface py-1 shadow-lg [animation:ptmPop_.12s_ease]"
        >
          {/* Theme — icon + label swap by current theme (CSS only) */}
          <button
            type="button"
            role="menuitem"
            onClick={toggleTheme}
            className="block w-full px-3 py-2 text-start text-sm text-strong transition-colors hover:bg-surface-muted"
          >
            <span className="flex items-center gap-2.5 dark:hidden">
              <MoonIcon />
              {t.menu.darkMode}
            </span>
            <span className="hidden items-center gap-2.5 dark:flex">
              <SunIcon />
              {t.menu.lightMode}
            </span>
          </button>

          {/* Language — shows the language you'd switch TO */}
          <button
            type="button"
            role="menuitem"
            onClick={switchLanguage}
            className={ITEM}
          >
            <GlobeIcon />
            {t.common.switchToName}
          </button>

          <div className="my-1 h-px bg-line" />

          <a
            href="/api/export?format=json"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={ITEM}
          >
            <DownloadIcon />
            {t.topBar.exportJson}
          </a>
          <a
            href="/api/export?format=csv"
            role="menuitem"
            onClick={() => setOpen(false)}
            className={ITEM}
          >
            <DownloadIcon />
            {t.topBar.exportCsv}
          </a>

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              setOpen(false);
              onOpenSettings();
            }}
            className={ITEM}
          >
            <GearIcon />
            {t.topBar.settings}
          </button>

          <div className="my-1 h-px bg-line" />

          <form action={logout}>
            <button
              type="submit"
              role="menuitem"
              className={cn(
                ITEM,
                "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15",
              )}
            >
              <LogoutIcon />
              {t.topBar.logout}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5" aria-hidden>
      <path d="M10 6a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm0 5.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M9.5 2.5a.75.75 0 0 0-.9-.74A7 7 0 1 0 18.24 11.4a.75.75 0 0 0-.74-.9 5.5 5.5 0 0 1-8-8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M10 1.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 1.5zm0 13a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 14.5zM18.5 10a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1a.75.75 0 0 1 .75.75zm-14 0a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 4.5 10zm11.08-5.58a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 1 1-1.07-1.06l.71-.7a.75.75 0 0 1 1.06 0zM6.19 13.81a.75.75 0 0 1 0 1.06l-.7.7a.75.75 0 0 1-1.07-1.06l.71-.7a.75.75 0 0 1 1.06 0zm-1.77-9.39a.75.75 0 0 1 1.06 0l.7.71a.75.75 0 0 1-1.06 1.06l-.7-.71a.75.75 0 0 1 0-1.06zm9.39 9.39a.75.75 0 0 1 1.06 0l.7.7a.75.75 0 1 1-1.06 1.07l-.7-.71a.75.75 0 0 1 0-1.06zM10 6a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      className="size-4"
      aria-hidden
    >
      <circle cx="10" cy="10" r="7.25" />
      <path d="M2.75 10h14.5M10 2.75c2 2.2 2 12.3 0 14.5M10 2.75c-2 2.2-2 12.3 0 14.5" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M10 2.5a.75.75 0 01.75.75v7.19l2.22-2.22a.75.75 0 111.06 1.06l-3.5 3.5a.75.75 0 01-1.06 0l-3.5-3.5a.75.75 0 111.06-1.06l2.22 2.22V3.25A.75.75 0 0110 2.5z" />
      <path d="M3.5 13a.75.75 0 01.75.75v1.5c0 .14.11.25.25.25h11a.25.25 0 00.25-.25v-1.5a.75.75 0 011.5 0v1.5A1.75 1.75 0 0115.5 17h-11A1.75 1.75 0 012.75 15.25v-1.5A.75.75 0 013.5 13z" />
    </svg>
  );
}

function GearIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path
        fillRule="evenodd"
        d="M8.34 1.8c.2-.81 1.12-.81 1.32 0l.2.82c.06.26.27.46.53.5.46.07.9.22 1.3.43.24.13.53.1.74-.06l.66-.5c.65-.5 1.3.16 .81.8l-.5.67c-.16.2-.18.5-.06.73.21.4.36.85.43 1.3.04.27.24.48.5.54l.82.2c.81.2.81 1.12 0 1.32l-.82.2a.66.66 0 00-.5.53c-.07.46-.22.9-.43 1.3a.66.66 0 00.06.74l.5.66c.5.65-.16 1.3-.8.81l-.67-.5a.66.66 0 00-.73-.06c-.4.21-.85.36-1.3.43a.66.66 0 00-.54.5l-.2.82c-.2.81-1.12.81-1.32 0l-.2-.82a.66.66 0 00-.53-.5 4.6 4.6 0 01-1.3-.43.66.66 0 00-.74.06l-.66.5c-.65.5-1.3-.16-.81-.8l.5-.67a.66.66 0 00.06-.73 4.6 4.6 0 01-.43-1.3.66.66 0 00-.5-.54l-.82-.2c-.81-.2-.81-1.12 0-1.32l.82-.2a.66.66 0 00.5-.53c.07-.46.22-.9.43-1.3a.66.66 0 00-.06-.74l-.5-.66c-.5-.65.16-1.3.8-.81l.67.5c.2.16.5.18.73.06.4-.21.85-.36 1.3-.43a.66.66 0 00.54-.5l.2-.82zM10 13a3 3 0 100-6 3 3 0 000 6z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M3 4.75A1.75 1.75 0 014.75 3h4.5a.75.75 0 010 1.5h-4.5a.25.25 0 00-.25.25v10.5c0 .14.11.25.25.25h4.5a.75.75 0 010 1.5h-4.5A1.75 1.75 0 013 15.25V4.75z" />
      <path d="M13.03 6.22a.75.75 0 10-1.06 1.06l1.97 1.97H8.75a.75.75 0 000 1.5h5.19l-1.97 1.97a.75.75 0 101.06 1.06l3.25-3.25a.75.75 0 000-1.06l-3.25-3.25z" />
    </svg>
  );
}

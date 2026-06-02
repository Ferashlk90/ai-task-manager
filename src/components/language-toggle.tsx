"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/context";
import { setLocale } from "@/app/actions/locale";
import { cn } from "@/lib/utils";

// Flips between the two locales. Setting the cookie is a server action, then
// router.refresh() re-renders server components (incl. <html dir/lang>).
export function LanguageToggle({ className }: { className?: string }) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    const next = locale === "ar" ? "en" : "ar";
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      aria-label={t.common.languageToggle}
      className={cn(
        "grid h-9 min-w-9 place-items-center rounded-lg px-2 text-sm font-bold text-muted transition-colors hover:bg-surface-strong disabled:opacity-50",
        className,
      )}
    >
      {t.common.switchTo}
    </button>
  );
}

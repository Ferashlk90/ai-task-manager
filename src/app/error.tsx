"use client"; // Error boundaries must be Client Components.

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";

// Catches runtime errors thrown while rendering any page under the root
// layout (e.g. the DB being unreachable on "/", or a failed auth lookup).
// Does NOT cover the root layout itself — see global-error.tsx for that.
export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    // Surfaces in the Vercel function logs; error.digest below ties the
    // user-facing screen to the matching server-side log entry.
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 text-center shadow-sm">
        <div
          className="mx-auto mb-4 flex size-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400"
          aria-hidden
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-5"
          >
            <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h1 className="text-lg font-semibold text-fg">
          {t.errorPage.title}
        </h1>
        <p className="mt-1.5 text-sm text-muted">{t.errorPage.message}</p>
        <Button className="mt-5 w-full" onClick={() => unstable_retry()}>
          {t.common.retry}
        </Button>
        {error.digest && (
          <p className="mt-3 font-mono text-[11px] text-faint">
            {t.common.errorCode} {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}

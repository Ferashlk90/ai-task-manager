"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { AssistantChat } from "./assistant-chat";

// Floating support-style assistant: a corner launcher that opens a compact
// chat panel. Direction-aware (sits at the inline-end corner). The chat itself
// is ephemeral, so we mount it only while open — closing resets it.
export function AssistantWidget() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col items-end gap-3">
      {open && (
        <div
          role="dialog"
          aria-label={t.assistant.title}
          className="flex h-[70dvh] max-h-[560px] w-[calc(100vw-2rem)] max-w-96 flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl [animation:ptmPop_.14s_ease]"
        >
          <header className="flex items-center justify-between gap-2 border-b border-line-muted px-4 py-3">
            <div className="flex items-center gap-2 text-sm font-bold text-fg">
              <span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                <SparkleIcon />
              </span>
              {t.assistant.title}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={t.common.close}
              className="grid size-7 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-strong hover:text-strong"
            >
              <XIcon />
            </button>
          </header>
          <div className="min-h-0 flex-1">
            <AssistantChat />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? t.common.close : t.assistant.open}
        aria-expanded={open}
        className="grid size-14 place-items-center rounded-full bg-accent text-on-accent shadow-lg transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <XIcon className="size-6" /> : <SparkleIcon className="size-6" />}
      </button>
    </div>
  );
}

function SparkleIcon({ className = "size-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M10 1.5l1.6 4.2 4.4 1.6-4.4 1.6L10 13.5 8.4 9.3 4 7.7l4.4-1.6L10 1.5zM4.5 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </svg>
  );
}

function XIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden>
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}

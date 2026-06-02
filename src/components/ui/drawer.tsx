"use client";

import { useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";

export function Drawer({
  open,
  onClose,
  title,
  headerAccent,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: React.ReactNode;
  headerAccent?: string;
  children: React.ReactNode;
}) {
  const { t } = useI18n();
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-black/40 dark:bg-black/60 [animation:ptmFade_.15s_ease]"
        onClick={onClose}
      />
      <div className="ptm-drawer absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-surface shadow-2xl [animation:ptmDrawer_.2s_ease]">
        <div className="flex items-center justify-between gap-3 border-b border-line-muted px-5 py-4">
          <div
            className="flex min-w-0 items-center gap-2.5 text-base font-bold text-fg"
            style={headerAccent ? { borderInlineStart: "none" } : undefined}
          >
            {headerAccent && (
              <span
                className="size-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: headerAccent }}
              />
            )}
            <span dir="auto" className="truncate">
              {title}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-strong hover:text-strong"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <div className="scrollable flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

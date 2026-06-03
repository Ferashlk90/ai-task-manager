"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";

/** Small copy-to-clipboard control shown under an assistant reply. */
export function CopyMessageButton({ text }: { text: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard unavailable — ignore */
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? t.chat.copied : t.chat.copy}
      className="mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-faint transition-colors hover:bg-surface-muted hover:text-muted"
    >
      {copied ? (
        <>
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
            <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0l-3.5-3.5a1 1 0 011.4-1.4l2.8 2.79 6.8-6.79a1 1 0 011.4 0z" />
          </svg>
          {t.chat.copied}
        </>
      ) : (
        <>
          <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" className="size-3.5">
            <rect x="7" y="7" width="9" height="9" rx="2" />
            <path d="M4 13V5a2 2 0 012-2h7" />
          </svg>
          {t.chat.copy}
        </>
      )}
    </button>
  );
}

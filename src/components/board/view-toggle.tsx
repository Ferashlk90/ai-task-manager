"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import { VIEW_COOKIE, VIEW_MODES, type ViewMode } from "@/lib/view";

// Persist the choice so page.tsx can read it server-side on next load. Defined
// at module scope so the cookie write isn't a component-level global mutation.
function persistView(v: ViewMode) {
  document.cookie = `${VIEW_COOKIE}=${v}; path=/; max-age=31536000; samesite=lax`;
}

// Board ⇄ List segmented control.
export function ViewToggle({
  view,
  onChange,
}: {
  view: ViewMode;
  onChange: (v: ViewMode) => void;
}) {
  const { t } = useI18n();

  function select(v: ViewMode) {
    if (v === view) return;
    persistView(v);
    onChange(v);
  }

  return (
    <div className="inline-flex gap-1 rounded-xl bg-surface-strong p-1">
      {VIEW_MODES.map((v) => {
        const active = v === view;
        return (
          <button
            key={v}
            type="button"
            onClick={() => select(v)}
            aria-pressed={active}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-surface text-fg shadow-sm"
                : "text-muted hover:text-strong",
            )}
          >
            {v === "board" ? (
              <BoardIcon />
            ) : v === "list" ? (
              <ListIcon />
            ) : (
              <ChatIcon />
            )}
            <span>{t.view[v]}</span>
          </button>
        );
      })}
    </div>
  );
}

function BoardIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M3 4.75A1.75 1.75 0 0 1 4.75 3h3A1.75 1.75 0 0 1 9.5 4.75v10.5A1.75 1.75 0 0 1 7.75 17h-3A1.75 1.75 0 0 1 3 15.25V4.75zm7.5 0A1.75 1.75 0 0 1 12.25 3h3A1.75 1.75 0 0 1 17 4.75v5.5A1.75 1.75 0 0 1 15.25 12h-3a1.75 1.75 0 0 1-1.75-1.75v-5.5z" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M4 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.25-1.75a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9zM4 11a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.25-1.75a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9zM4 16.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3.25-1.75a.75.75 0 0 0 0 1.5h9a.75.75 0 0 0 0-1.5h-9z" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M10 2.5c-4.28 0-7.75 2.96-7.75 6.6 0 1.7.76 3.25 2 4.42-.13 1.02-.5 1.96-1.06 2.74a.5.5 0 0 0 .5.78 6.9 6.9 0 0 0 3.1-1.32c1 .33 2.08.5 3.21.5 4.28 0 7.75-2.95 7.75-6.6S14.28 2.5 10 2.5z" />
    </svg>
  );
}

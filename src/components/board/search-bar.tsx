"use client";

import { useI18n } from "@/lib/i18n/context";

// Full-width task search. Filters the board across title/description (and their
// English variants); composes with the company and status filters.
export function SearchBar({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="relative">
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        className="pointer-events-none absolute inset-y-0 start-3 my-auto size-4 text-faint"
        aria-hidden
      >
        <circle cx="9" cy="9" r="6" strokeWidth="1.6" />
        <path d="m14 14 3.5 3.5" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t.board.searchPlaceholder}
        // Hide the native (webkit) clear control; we render our own below.
        className="h-10 w-full rounded-xl border border-line bg-surface ps-9 pe-9 text-sm text-fg outline-none transition-colors placeholder:text-faint focus:border-muted focus:ring-2 focus:ring-ring-soft/70 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label={t.board.clearSearch}
          className="absolute inset-y-0 end-2 my-auto grid size-6 place-items-center rounded-md text-faint transition-colors hover:bg-surface-strong hover:text-strong"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path d="M10 8.586 6.707 5.293 5.293 6.707 8.586 10l-3.293 3.293 1.414 1.414L10 11.414l3.293 3.293 1.414-1.414L11.414 10l3.293-3.293-1.414-1.414L10 8.586Z" />
          </svg>
        </button>
      )}
    </div>
  );
}

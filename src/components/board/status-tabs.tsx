"use client";

import { cn } from "@/lib/utils";
import { STATUSES, type Status } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";

// Segmented tabs to view tasks by status (All / New / In progress / Done).
// Composes with the company filter — both narrow the same board.
export function StatusTabs({
  counts,
  active,
  onSelect,
}: {
  counts: { all: number } & Record<Status, number>;
  active: Status | null;
  onSelect: (status: Status | null) => void;
}) {
  const { t } = useI18n();
  const tabs: { value: Status | null; label: string; count: number }[] = [
    { value: null, label: t.common.all, count: counts.all },
    ...STATUSES.map((s) => ({ value: s, label: t.status[s], count: counts[s] })),
  ];

  return (
    <div className="scrollable -mx-1 overflow-x-auto px-1">
      <div className="inline-flex gap-1 rounded-xl bg-surface-strong p-1">
        {tabs.map((tab) => {
          const isActive = active === tab.value;
          return (
            <button
              key={tab.value ?? "all"}
              type="button"
              onClick={() => onSelect(tab.value)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-surface text-fg shadow-sm"
                  : "text-muted hover:text-strong",
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded-full px-1.5 text-xs tabular-nums",
                  isActive ? "bg-surface-strong text-muted" : "text-faint",
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

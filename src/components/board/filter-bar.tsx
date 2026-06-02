"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import type { Company } from "@/lib/types";

export function FilterBar({
  companies,
  counts,
  total,
  active,
  onSelect,
}: {
  companies: Company[];
  counts: Record<string, number>;
  total: number;
  active: string | null;
  onSelect: (companyId: string | null) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="scrollable -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
      <Chip
        label={t.common.all}
        count={total}
        active={active === null}
        onClick={() => onSelect(null)}
      />
      {companies.map((c) => (
        <Chip
          key={c.id}
          label={c.name}
          color={c.color}
          count={counts[c.id] ?? 0}
          active={active === c.id}
          onClick={() => onSelect(c.id)}
        />
      ))}
    </div>
  );
}

function Chip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        active
          ? color
            ? { borderColor: color, backgroundColor: `${color}14` }
            : undefined
          : undefined
      }
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-accent bg-accent text-on-accent"
          : "border-line bg-surface text-muted hover:bg-surface-muted",
        active && color && "!text-fg",
      )}
    >
      {color && (
        <span
          className="size-2.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      <span>{label}</span>
      <span
        className={cn(
          "rounded-full px-1.5 text-xs tabular-nums",
          active && !color
            ? "bg-on-accent/20 text-on-accent"
            : "bg-surface-strong text-muted",
        )}
      >
        {count}
      </span>
    </button>
  );
}

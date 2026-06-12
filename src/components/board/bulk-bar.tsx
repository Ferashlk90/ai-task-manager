"use client";

import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { PRIORITIES, STATUSES, type Priority, type Status } from "@/lib/constants";
import type { Company, Category } from "@/lib/types";

const NONE = "__none__"; // company/category cleared → null

export type BulkPatch = {
  status?: Status;
  priority?: Priority;
  companyId?: string | null;
  categoryId?: string | null;
};

// Sticky action bar for the selected tasks. Each <select> is a "command":
// it shows a placeholder, fires the action on change, then resets to placeholder
// (value is always "") so it's ready for the next batch.
export function BulkBar({
  count,
  companies,
  categories,
  pending,
  onApply,
  onDelete,
  onClear,
}: {
  count: number;
  companies: Company[];
  categories: Category[];
  pending: boolean;
  onApply: (patch: BulkPatch) => void;
  onDelete: () => void;
  onClear: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-2 px-4 py-3 sm:px-6">
        <span className="text-sm font-semibold text-strong">
          {t.bulk.selected.replace("{count}", String(count))}
        </span>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted underline-offset-2 hover:underline"
        >
          {t.bulk.clear}
        </button>

        <div className="ms-auto flex flex-wrap items-center gap-2">
          <Cmd
            label={t.bulk.setStatus}
            disabled={pending}
            onPick={(v) => onApply({ status: v as Status })}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t.status[s]}
              </option>
            ))}
          </Cmd>

          <Cmd
            label={t.bulk.setPriority}
            disabled={pending}
            onPick={(v) => onApply({ priority: v as Priority })}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t.priority[p]}
              </option>
            ))}
          </Cmd>

          <Cmd
            label={t.bulk.setCompany}
            disabled={pending}
            onPick={(v) => onApply({ companyId: v === NONE ? null : v })}
          >
            <option value={NONE}>{t.bulk.uncategorized}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Cmd>

          <Cmd
            label={t.bulk.setCategory}
            disabled={pending}
            onPick={(v) => onApply({ categoryId: v === NONE ? null : v })}
          >
            <option value={NONE}>{t.bulk.noCategory}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Cmd>

          <Button
            variant="danger"
            size="sm"
            loading={pending}
            onClick={() => {
              if (confirm(t.bulk.deleteConfirm.replace("{count}", String(count))))
                onDelete();
            }}
          >
            {t.bulk.delete}
          </Button>
        </div>
      </div>
    </div>
  );
}

// A select that always shows its placeholder: picking an option fires onPick and
// the control resets (controlled value stays "").
function Cmd({
  label,
  disabled,
  onPick,
  children,
}: {
  label: string;
  disabled: boolean;
  onPick: (value: string) => void;
  children: React.ReactNode;
}) {
  return (
    <Select
      value=""
      disabled={disabled}
      onChange={(e) => {
        if (e.target.value) onPick(e.target.value);
      }}
      className="h-8 w-auto rounded-lg text-sm"
      aria-label={label}
    >
      <option value="" disabled hidden>
        {label}
      </option>
      {children}
    </Select>
  );
}

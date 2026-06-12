"use client";

import { useEffect, useRef } from "react";
import { Badge, tintStyle } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import type { Task, Company, Category } from "@/lib/types";

const STATUS_STYLE: Record<Task["status"], string> = {
  new: "bg-surface-strong text-muted",
  in_progress:
    "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

const UNCATEGORIZED_COLOR = "#888780";

// Flat, selectable list of tasks. Checkbox toggles selection; clicking the row
// body opens the single-task drawer (same as the board's cards).
export function TaskList({
  tasks,
  companyById,
  categoryById,
  english,
  selectedIds,
  onToggle,
  onToggleAll,
  onTaskClick,
}: {
  tasks: Task[];
  companyById: Map<string, Company>;
  categoryById: Map<string, Category>;
  english: boolean;
  selectedIds: Set<string>;
  onToggle: (id: string) => void;
  onToggleAll: () => void;
  onTaskClick: (task: Task) => void;
}) {
  const { t } = useI18n();
  const headRef = useRef<HTMLInputElement>(null);

  const allSelected =
    tasks.length > 0 && tasks.every((task) => selectedIds.has(task.id));
  const someSelected = tasks.some((task) => selectedIds.has(task.id));

  useEffect(() => {
    if (headRef.current) headRef.current.indeterminate = someSelected && !allSelected;
  }, [someSelected, allSelected]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <label className="flex cursor-pointer items-center gap-3 border-b border-line bg-surface-muted px-4 py-2.5">
        <input
          ref={headRef}
          type="checkbox"
          checked={allSelected}
          onChange={onToggleAll}
          className="size-4 shrink-0 rounded border-line accent-fg"
        />
        <span className="text-xs font-semibold text-muted">
          {t.list.selectAll}
        </span>
      </label>

      <ul className="divide-y divide-line">
        {tasks.map((task) => {
          const selected = selectedIds.has(task.id);
          const done = task.status === "done";
          const showEn = english && !!task.titleEn;
          const title = showEn ? task.titleEn! : task.title;
          const company = task.companyId
            ? companyById.get(task.companyId)
            : undefined;
          const category = task.categoryId
            ? categoryById.get(task.categoryId)
            : undefined;

          return (
            <li
              key={task.id}
              className={cn(
                "flex items-center gap-3 px-4 py-2.5 transition-colors hover:bg-surface-muted",
                selected && "bg-accent-muted/40",
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => onToggle(task.id)}
                aria-label={title}
                className="size-4 shrink-0 rounded border-line accent-fg"
              />
              <button
                type="button"
                onClick={() => onTaskClick(task)}
                className="flex min-w-0 flex-1 items-center gap-3 text-start"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: company?.color ?? UNCATEGORIZED_COLOR }}
                  aria-hidden
                />
                <span
                  dir="auto"
                  className={cn(
                    "min-w-0 flex-1 truncate text-sm font-medium text-fg",
                    done && "text-muted line-through",
                  )}
                >
                  {title}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  <Badge style={tintStyle(PRIORITY_COLORS[task.priority])}>
                    {t.priority[task.priority]}
                  </Badge>
                  {category && (
                    <Badge
                      style={tintStyle(category.color)}
                      className="hidden sm:inline-flex"
                    >
                      {category.name}
                    </Badge>
                  )}
                  <Badge className={STATUS_STYLE[task.status]}>
                    {t.status[task.status]}
                  </Badge>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

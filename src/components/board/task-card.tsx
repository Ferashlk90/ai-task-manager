"use client";

import { Badge, tintStyle } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { PRIORITY_COLORS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import type { Task, Category } from "@/lib/types";

const STATUS_STYLE: Record<Task["status"], string> = {
  new: "bg-surface-strong text-muted",
  in_progress: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  done: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function TaskCard({
  task,
  accent,
  category,
  english,
  onClick,
}: {
  task: Task;
  accent: string;
  category?: Category;
  english: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  const done = task.status === "done";
  // English-forward when the feature is on and a translation exists.
  const showEn = english && !!task.titleEn;
  const title = showEn ? task.titleEn! : task.title;
  const description = showEn ? (task.descriptionEn ?? "") : task.description;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ borderInlineStartColor: accent }}
      className={cn(
        "group w-full rounded-xl border border-line border-s-4 bg-surface p-3.5 text-start shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        done && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3
          dir="auto"
          className={cn(
            "text-sm font-semibold leading-6 text-fg",
            done && "line-through",
          )}
        >
          {title}
        </h3>
        {task.aiAssist && (
          <Badge className="shrink-0 bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            <SparkIcon /> AI
          </Badge>
        )}
      </div>

      {description && (
        <p
          dir="auto"
          className={cn(
            "mt-1 line-clamp-2 text-xs leading-5 text-muted",
            done && "line-through",
          )}
        >
          {description}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <Badge style={tintStyle(PRIORITY_COLORS[task.priority])}>
          {t.priority[task.priority]}
        </Badge>
        {category && <Badge style={tintStyle(category.color)}>{category.name}</Badge>}
        <Badge className={STATUS_STYLE[task.status]}>
          {t.status[task.status]}
        </Badge>
      </div>
    </button>
  );
}

function SparkIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-3" aria-hidden>
      <path d="M10 1.5l1.6 4.2 4.4 1.6-4.4 1.6L10 13.5 8.4 9.3 4 7.7l4.4-1.6L10 1.5zM4.5 13l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8.8-2z" />
    </svg>
  );
}

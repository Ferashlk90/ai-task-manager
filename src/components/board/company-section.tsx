"use client";

import { TaskCard } from "./task-card";
import { useI18n } from "@/lib/i18n/context";
import type { Task, Category } from "@/lib/types";

export function CompanySection({
  name,
  color,
  tasks,
  categoryById,
  english,
  onTaskClick,
}: {
  name: string;
  color: string;
  tasks: Task[];
  categoryById: Map<string, Category>;
  english: boolean;
  onTaskClick: (task: Task) => void;
}) {
  const { t } = useI18n();
  return (
    <section className="space-y-3">
      <div className="flex items-center gap-2.5">
        <span
          className="size-3 rounded-full"
          style={{ backgroundColor: color }}
        />
        <h2 className="text-sm font-bold text-strong">{name}</h2>
        <span className="rounded-full bg-surface-strong px-2 py-0.5 text-xs font-medium tabular-nums text-muted">
          {tasks.length}
        </span>
        <span
          className="ms-1 h-px flex-1"
          style={{ backgroundColor: `${color}33` }}
        />
      </div>

      {tasks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-6 text-center text-xs text-faint">
          {t.board.sectionEmpty}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              accent={color}
              category={task.categoryId ? categoryById.get(task.categoryId) : undefined}
              english={english}
              onClick={() => onTaskClick(task)}
            />
          ))}
        </div>
      )}
    </section>
  );
}

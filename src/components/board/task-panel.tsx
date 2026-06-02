"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge, tintStyle } from "@/components/ui/badge";
import { TaskChat } from "./task-chat";
import { cn } from "@/lib/utils";
import { PRIORITIES, STATUSES, PRIORITY_COLORS } from "@/lib/constants";
import { useI18n } from "@/lib/i18n/context";
import type { Company, Category, Task } from "@/lib/types";
import { updateTask, updateTaskStatus, deleteTask } from "@/app/actions/tasks";

export function TaskPanel({
  task,
  companies,
  categories,
  english,
  onClose,
}: {
  task: Task;
  companies: Company[];
  categories: Category[];
  english: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [pending, startTransition] = useTransition();

  const company = companies.find((c) => c.id === task.companyId);
  const category = categories.find((c) => c.id === task.categoryId);
  // English-forward when the feature is on and a translation exists.
  const showEn = english && !!task.titleEn;
  const description = showEn ? (task.descriptionEn ?? "") : task.description;

  function copyEnglish() {
    const text = [task.titleEn, task.descriptionEn].filter(Boolean).join("\n\n");
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function setStatus(status: Task["status"]) {
    if (status === task.status) return;
    startTransition(async () => {
      await updateTaskStatus(task.id, status);
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await deleteTask(task.id);
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="flex flex-col">
      <div className="space-y-5 px-5 py-5">
        {/* Status control */}
        <div>
          <Label>{t.taskPanel.status}</Label>
          <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-xl bg-surface-strong p-1">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                disabled={pending}
                onClick={() => setStatus(s)}
                className={cn(
                  "rounded-lg py-1.5 text-xs font-semibold transition-colors",
                  task.status === s
                    ? "bg-surface text-fg shadow-sm"
                    : "text-muted hover:text-strong",
                )}
              >
                {t.status[s]}
              </button>
            ))}
          </div>
        </div>

        {editing ? (
          <EditForm
            task={task}
            companies={companies}
            categories={categories}
            pending={pending}
            onCancel={() => setEditing(false)}
            onSave={(patch) =>
              startTransition(async () => {
                await updateTask(task.id, patch);
                router.refresh();
                setEditing(false);
              })
            }
          />
        ) : (
          <>
            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              {company && (
                <Badge style={tintStyle(company.color)}>{company.name}</Badge>
              )}
              <Badge style={tintStyle(PRIORITY_COLORS[task.priority])}>
                {t.priority[task.priority]}
              </Badge>
              {category && (
                <Badge style={tintStyle(category.color)}>{category.name}</Badge>
              )}
              {task.aiAssist && (
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                AI
              </Badge>
              )}
            </div>

            {description ? (
              <p
                dir="auto"
                className="whitespace-pre-wrap text-sm leading-7 text-strong"
              >
                {description}
              </p>
            ) : (
              <p className="text-sm text-faint">{t.taskPanel.noDescription}</p>
            )}

            {showEn && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5">
                <button
                  type="button"
                  onClick={copyEnglish}
                  className="text-xs font-medium text-muted transition-colors hover:text-strong"
                >
                  {copied ? t.taskPanel.copied : t.taskPanel.copyEnglish}
                </button>
                <button
                  type="button"
                  onClick={() => setShowOriginal((v) => !v)}
                  className="text-xs font-medium text-muted transition-colors hover:text-strong"
                >
                  {showOriginal ? t.taskPanel.hideOriginal : t.taskPanel.showOriginal}
                </button>
              </div>
            )}

            {showEn && showOriginal && (
              <div
                dir="auto"
                className="rounded-xl bg-surface-muted px-3 py-2.5 text-sm leading-7"
              >
                <p className="font-semibold text-strong">{task.title}</p>
                {task.description && (
                  <p className="mt-1 whitespace-pre-wrap text-muted">
                    {task.description}
                  </p>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button size="sm" variant="subtle" onClick={() => setEditing(true)}>
                {t.common.edit}
              </Button>
              {confirmDelete ? (
                <>
                  <Button
                    size="sm"
                    variant="danger"
                    loading={pending}
                    onClick={remove}
                  >
                    {t.taskPanel.confirmDelete}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setConfirmDelete(false)}
                  >
                    {t.common.cancel}
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/15"
                  onClick={() => setConfirmDelete(true)}
                >
                  {t.common.delete}
                </Button>
              )}
            </div>
          </>
        )}
      </div>

      <div className="border-t border-line-muted px-5 py-5">
        <TaskChat task={task} />
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold uppercase tracking-wide text-faint">
      {children}
    </span>
  );
}

function EditForm({
  task,
  companies,
  categories,
  pending,
  onCancel,
  onSave,
}: {
  task: Task;
  companies: Company[];
  categories: Category[];
  pending: boolean;
  onCancel: () => void;
  onSave: (patch: {
    title: string;
    description: string;
    companyId: string | null;
    categoryId: string | null;
    priority: Task["priority"];
    aiAssist: boolean;
  }) => void;
}) {
  const { t } = useI18n();
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [companyId, setCompanyId] = useState(task.companyId ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [categoryId, setCategoryId] = useState(task.categoryId ?? "");
  const [aiAssist, setAiAssist] = useState(task.aiAssist);

  return (
    <div className="space-y-3">
      <div>
        <Label>{t.taskPanel.title}</Label>
        <Input
          className="mt-1.5"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div>
        <Label>{t.taskPanel.description}</Label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface p-3 text-sm leading-6 text-fg outline-none transition-colors focus:border-muted focus:ring-2 focus:ring-ring-soft/70"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <Label>{t.taskPanel.company}</Label>
          <Select
            className="mt-1.5"
            value={companyId}
            onChange={(e) => setCompanyId(e.target.value)}
          >
            <option value="">{t.common.uncategorized}</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>{t.taskPanel.priority}</Label>
          <Select
            className="mt-1.5"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task["priority"])}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {t.priority[p]}
              </option>
            ))}
          </Select>
        </div>
        <div className="col-span-2">
          <Label>{t.taskPanel.category}</Label>
          <Select
            className="mt-1.5"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
          >
            <option value="">{t.taskPanel.noCategory}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm text-strong">
        <input
          type="checkbox"
          checked={aiAssist}
          onChange={(e) => setAiAssist(e.target.checked)}
          className="size-4 rounded border-line accent-fg"
        />
        {t.taskPanel.aiAssistLabel}
      </label>

      <div className="flex items-center gap-2 pt-1">
        <Button
          size="sm"
          loading={pending}
          onClick={() =>
            onSave({
              title,
              description,
              companyId: companyId || null,
              categoryId: categoryId || null,
              priority,
              aiAssist,
            })
          }
        >
          {t.common.save}
        </Button>
        <Button size="sm" variant="ghost" onClick={onCancel}>
          {t.common.cancel}
        </Button>
      </div>
    </div>
  );
}

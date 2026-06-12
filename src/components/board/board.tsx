"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Drawer } from "@/components/ui/drawer";
import { FilterBar } from "./filter-bar";
import { SearchBar } from "./search-bar";
import { StatusTabs } from "./status-tabs";
import { CompanySection } from "./company-section";
import { OrganizeComposer } from "./organize-composer";
import { TaskPanel } from "./task-panel";
import { SettingsPanel } from "./settings-panel";
import { AssistantWidget } from "./assistant-widget";
import { TopBar } from "./top-bar";
import { ViewToggle } from "./view-toggle";
import { TaskList } from "./task-list";
import { ChatView } from "./chat-view";
import { BulkBar, type BulkPatch } from "./bulk-bar";
import { bulkUpdateTasks, bulkDeleteTasks } from "@/app/actions/tasks";
import { useI18n } from "@/lib/i18n/context";
import type { ViewMode } from "@/lib/view";
import type { Status } from "@/lib/constants";
import type { Company, Category, Task } from "@/lib/types";

const UNCATEGORIZED_COLOR = "#888780";

export function Board({
  companies,
  categories,
  tasks,
  email,
  englishEnabled,
  models,
  currentModel,
  initialView,
}: {
  companies: Company[];
  categories: Category[];
  tasks: Task[];
  email: string;
  englishEnabled: boolean;
  models: { id: string; label: string }[];
  currentModel: string;
  initialView: ViewMode;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [filter, setFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Status | null>(null);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [view, setView] = useState<ViewMode>(initialView);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkPending, startBulk] = useTransition();

  const q = query.trim().toLowerCase();

  // Search is the top-level narrow: it feeds every count and the shown tasks,
  // so the numbers always match what's on screen. Matches title/description and
  // their English variants, regardless of the language toggle.
  const base = useMemo(() => {
    if (!q) return tasks;
    return tasks.filter((t) =>
      [t.title, t.description, t.titleEn, t.descriptionEn]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [tasks, q]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {};
    for (const t of base) {
      if (t.companyId) map[t.companyId] = (map[t.companyId] ?? 0) + 1;
    }
    return map;
  }, [base]);

  // Status tab counts reflect the current company scope, so they match what
  // you'd actually see when you switch tabs.
  const statusCounts = useMemo(() => {
    const scope = filter ? base.filter((t) => t.companyId === filter) : base;
    const m = { all: scope.length, new: 0, in_progress: 0, done: 0 } as {
      all: number;
    } & Record<Status, number>;
    for (const t of scope) m[t.status] += 1;
    return m;
  }, [base, filter]);

  const shownTasks = useMemo(
    () => (statusFilter ? base.filter((t) => t.status === statusFilter) : base),
    [base, statusFilter],
  );

  const tasksByCompany = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of shownTasks) {
      const key = t.companyId ?? "__none__";
      const list = map.get(key) ?? [];
      list.push(t);
      map.set(key, list);
    }
    return map;
  }, [shownTasks]);

  const categoryById = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories],
  );

  const companyById = useMemo(
    () => new Map(companies.map((c) => [c.id, c])),
    [companies],
  );

  // The list is flat, so it also applies the company filter (the board applies
  // that only at section level). Search + status already fed shownTasks.
  const listTasks = useMemo(
    () => (filter ? shownTasks.filter((task) => task.companyId === filter) : shownTasks),
    [shownTasks, filter],
  );

  // Effective selection = chosen ids that still exist (a task can vanish via a
  // single delete in the drawer while it's selected here). Derived rather than
  // stored, so we avoid setState-in-effect churn.
  const taskIds = useMemo(() => new Set(tasks.map((task) => task.id)), [tasks]);
  const selectedCount = useMemo(() => {
    let n = 0;
    for (const id of selectedIds) if (taskIds.has(id)) n++;
    return n;
  }, [selectedIds, taskIds]);

  function toggleSelected(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setSelectedIds((prev) =>
      listTasks.every((task) => prev.has(task.id))
        ? new Set()
        : new Set(listTasks.map((task) => task.id)),
    );
  }

  function applyBulk(patch: BulkPatch) {
    const ids = [...selectedIds].filter((id) => taskIds.has(id));
    if (ids.length === 0) return;
    startBulk(async () => {
      await bulkUpdateTasks(ids, patch);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  function deleteBulk() {
    const ids = [...selectedIds].filter((id) => taskIds.has(id));
    if (ids.length === 0) return;
    startBulk(async () => {
      await bulkDeleteTasks(ids);
      setSelectedIds(new Set());
      router.refresh();
    });
  }

  const selectedTask = selectedId
    ? (tasks.find((t) => t.id === selectedId) ?? null)
    : null;
  const selectedCompany = selectedTask
    ? companies.find((c) => c.id === selectedTask.companyId)
    : undefined;
  const selectedTitle =
    selectedTask && englishEnabled && selectedTask.titleEn
      ? selectedTask.titleEn
      : (selectedTask?.title ?? "");

  // A search query or status tab narrows the view; hide companies with no
  // matching tasks so the board isn't cluttered with empty sections.
  const narrowed = !!statusFilter || q.length > 0;
  const visibleCompanies = (
    filter ? companies.filter((c) => c.id === filter) : companies
  ).filter((c) => !narrowed || (tasksByCompany.get(c.id)?.length ?? 0) > 0);
  const uncategorized = tasksByCompany.get("__none__") ?? [];
  const showUncategorized = filter === null && uncategorized.length > 0;
  const isEmpty = tasks.length === 0;
  // Tasks exist, but the active filters match none of them.
  const noMatches =
    !isEmpty && visibleCompanies.length === 0 && !showUncategorized;

  return (
    <div className="min-h-dvh">
      <TopBar email={email} onOpenSettings={() => setSettingsOpen(true)} />

      <div className="mx-auto max-w-6xl space-y-5 px-4 py-5 sm:px-6">
        {view !== "chat" && (
          <OrganizeComposer hasCompanies={companies.length > 0} />
        )}

        {/* Toggle is always available (so Chat is reachable even with no tasks);
            search is task-board only. */}
        <div className="flex items-center gap-2">
          {view !== "chat" && !isEmpty && (
            <div className="flex-1">
              <SearchBar value={query} onChange={setQuery} />
            </div>
          )}
          <div className="ms-auto">
            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>

        {view !== "chat" && (
          <FilterBar
            companies={companies}
            counts={counts}
            total={base.length}
            active={filter}
            onSelect={setFilter}
          />
        )}

        {view !== "chat" && !isEmpty && (
          <StatusTabs
            counts={statusCounts}
            active={statusFilter}
            onSelect={setStatusFilter}
          />
        )}

        {view === "chat" ? (
          <ChatView tasks={tasks} english={englishEnabled} />
        ) : isEmpty ? (
          <div className="rounded-2xl border border-dashed border-line bg-surface/50 px-6 py-16 text-center">
            <p className="text-sm font-medium text-muted">
              {t.board.noTasksYet}
            </p>
            <p className="mt-1 text-xs text-faint">{t.board.noTasksHint}</p>
          </div>
        ) : view === "list" ? (
          listTasks.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-faint">
              {t.board.sectionEmpty}
            </p>
          ) : (
            <div className={selectedCount > 0 ? "pb-24" : "pb-8"}>
              <TaskList
                tasks={listTasks}
                companyById={companyById}
                categoryById={categoryById}
                english={englishEnabled}
                selectedIds={selectedIds}
                onToggle={toggleSelected}
                onToggleAll={toggleSelectAll}
                onTaskClick={(task) => setSelectedId(task.id)}
              />
            </div>
          )
        ) : noMatches ? (
          <p className="rounded-2xl border border-dashed border-line px-6 py-12 text-center text-sm text-faint">
            {t.board.sectionEmpty}
          </p>
        ) : (
          <div className="space-y-8 pb-8">
            {visibleCompanies.map((c) => (
              <CompanySection
                key={c.id}
                name={c.name}
                color={c.color}
                tasks={tasksByCompany.get(c.id) ?? []}
                categoryById={categoryById}
                english={englishEnabled}
                onTaskClick={(task) => setSelectedId(task.id)}
              />
            ))}
            {showUncategorized && (
              <CompanySection
                name={t.common.uncategorized}
                color={UNCATEGORIZED_COLOR}
                tasks={uncategorized}
                categoryById={categoryById}
                english={englishEnabled}
                onTaskClick={(task) => setSelectedId(task.id)}
              />
            )}
          </div>
        )}
      </div>

      <Drawer
        open={!!selectedTask}
        onClose={() => setSelectedId(null)}
        title={selectedTitle}
        headerAccent={selectedCompany?.color}
      >
        {selectedTask && (
          <TaskPanel
            key={selectedTask.id}
            task={selectedTask}
            companies={companies}
            categories={categories}
            english={englishEnabled}
            onClose={() => setSelectedId(null)}
          />
        )}
      </Drawer>

      <Drawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title={t.board.manageCompanies}
      >
        <SettingsPanel
          companies={companies}
          categories={categories}
          englishEnabled={englishEnabled}
          models={models}
          currentModel={currentModel}
        />
      </Drawer>

      <AssistantWidget />

      {view === "list" && selectedCount > 0 && (
        <BulkBar
          count={selectedCount}
          companies={companies}
          categories={categories}
          pending={bulkPending}
          onApply={applyBulk}
          onDelete={deleteBulk}
          onClear={() => setSelectedIds(new Set())}
        />
      )}
    </div>
  );
}

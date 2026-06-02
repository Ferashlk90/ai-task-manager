"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useI18n } from "@/lib/i18n/context";
import type { Company, Category } from "@/lib/types";
import {
  createCompany,
  updateCompany,
  deleteCompany,
  reorderCompanies,
} from "@/app/actions/companies";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "@/app/actions/categories";
import { setEnglishTasks, backfillEnglish, setModel } from "@/app/actions/settings";

// Companies (groups) and categories share the same shape and management UI.
type Bucket = { id: string; name: string; color: string; sortOrder: number };

type BucketActions = {
  create: (input: {
    name: string;
    color: string;
  }) => Promise<{ ok: boolean; error?: string }>;
  update: (
    id: string,
    patch: { name?: string; color?: string },
  ) => Promise<{ ok: boolean; error?: string }>;
  remove: (id: string) => Promise<{ ok: boolean }>;
  reorder: (ids: string[]) => Promise<{ ok: boolean }>;
};

type BucketLabels = {
  heading: string;
  helper: string;
  placeholder: string;
  emptyText: string;
  deleteLabel: string;
};

const companyActions: BucketActions = {
  create: createCompany,
  update: updateCompany,
  remove: deleteCompany,
  reorder: reorderCompanies,
};

const categoryActions: BucketActions = {
  create: createCategory,
  update: updateCategory,
  remove: deleteCategory,
  reorder: reorderCategories,
};

export function SettingsPanel({
  companies,
  categories,
  englishEnabled,
  models,
  currentModel,
}: {
  companies: Company[];
  categories: Category[];
  englishEnabled: boolean;
  models: { id: string; label: string }[];
  currentModel: string;
}) {
  const { t } = useI18n();

  return (
    <div className="space-y-5 px-5 py-5">
      <BucketManager
        items={companies}
        actions={companyActions}
        defaultColor="#378ADD"
        labels={{
          heading: t.settings.groupsHeading,
          helper: t.settings.groupsHelper,
          placeholder: t.settings.groupNamePlaceholder,
          emptyText: t.settings.noGroupsYet,
          deleteLabel: t.settings.deleteGroup,
        }}
      />

      <BucketManager
        items={categories}
        actions={categoryActions}
        defaultColor="#D85A30"
        labels={{
          heading: t.settings.categoriesHeading,
          helper: t.settings.categoriesHelper,
          placeholder: t.settings.categoryNamePlaceholder,
          emptyText: t.settings.noCategoriesYet,
          deleteLabel: t.settings.deleteCategory,
        }}
      />

      <EnglishSettings enabled={englishEnabled} />

      {models.length > 1 && (
        <ModelSettings models={models} current={currentModel} />
      )}
    </div>
  );
}

function BucketManager({
  items,
  actions,
  defaultColor,
  labels,
}: {
  items: Bucket[];
  actions: BucketActions;
  defaultColor: string;
  labels: BucketLabels;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= items.length) return;
    const ids = items.map((c) => c.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    startTransition(async () => {
      await actions.reorder(ids);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <div className="px-0.5">
        <p className="text-xs font-semibold text-strong">{labels.heading}</p>
        <p className="mt-0.5 text-xs text-faint">{labels.helper}</p>
      </div>

      <AddBucket actions={actions} defaultColor={defaultColor} labels={labels} />

      {items.map((item, i) => (
        <BucketRow
          key={item.id}
          item={item}
          actions={actions}
          deleteLabel={labels.deleteLabel}
          isFirst={i === 0}
          isLast={i === items.length - 1}
          disabled={pending}
          onMoveUp={() => move(i, -1)}
          onMoveDown={() => move(i, 1)}
        />
      ))}
      {items.length === 0 && (
        <p className="py-4 text-center text-xs text-faint">{labels.emptyText}</p>
      )}
    </div>
  );
}

function ModelSettings({
  models,
  current,
}: {
  models: { id: string; label: string }[];
  current: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function change(id: string) {
    if (id === current) return;
    startTransition(async () => {
      await setModel(id);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-3">
      <p className="mb-1 text-xs font-semibold text-muted">
        {t.modelSettings.heading}
      </p>
      <p className="mb-2 text-xs text-faint">{t.modelSettings.description}</p>
      <Select
        value={current}
        disabled={pending}
        onChange={(e) => change(e.target.value)}
      >
        {models.map((m) => (
          <option key={m.id} value={m.id}>
            {m.label}
          </option>
        ))}
      </Select>
    </div>
  );
}

function EnglishSettings({ enabled }: { enabled: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState<number | null>(null);

  function toggle(next: boolean) {
    startTransition(async () => {
      await setEnglishTasks(next);
      router.refresh();
    });
  }

  function backfill() {
    setDone(null);
    startTransition(async () => {
      const res = await backfillEnglish();
      setDone(res.count);
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-3">
      <p className="mb-2 text-xs font-semibold text-muted">
        {t.taskSettings.heading}
      </p>
      <label className="flex cursor-pointer items-start gap-2 text-sm leading-6 text-strong">
        <input
          type="checkbox"
          checked={enabled}
          disabled={pending}
          onChange={(e) => toggle(e.target.checked)}
          className="mt-1 size-4 shrink-0 rounded border-line accent-fg"
        />
        {t.taskSettings.toggleLabel}
      </label>
      {enabled && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button size="sm" variant="subtle" onClick={backfill} loading={pending}>
            {pending ? t.taskSettings.backfilling : t.taskSettings.backfill}
          </Button>
          {done !== null && (
            <span className="text-xs text-muted">
              {t.taskSettings.backfillDone.replace("{count}", String(done))}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

function AddBucket({
  actions,
  defaultColor,
  labels,
}: {
  actions: BucketActions;
  defaultColor: string;
  labels: BucketLabels;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [color, setColor] = useState(defaultColor);
  const [pending, startTransition] = useTransition();

  function add() {
    const n = name.trim();
    if (!n) return;
    startTransition(async () => {
      await actions.create({ name: n, color });
      setName("");
      router.refresh();
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface-muted p-3">
      <div className="flex items-center gap-2">
        <ColorInput value={color} onChange={setColor} />
        <Input
          placeholder={labels.placeholder}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          className="flex-1"
        />
        <Button size="sm" onClick={add} loading={pending} disabled={!name.trim()}>
          {t.common.add}
        </Button>
      </div>
    </div>
  );
}

function BucketRow({
  item,
  actions,
  deleteLabel,
  isFirst,
  isLast,
  disabled,
  onMoveUp,
  onMoveDown,
}: {
  item: Bucket;
  actions: BucketActions;
  deleteLabel: string;
  isFirst: boolean;
  isLast: boolean;
  disabled: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState(item.name);
  const [color, setColor] = useState(item.color);
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();

  const dirty = name.trim() !== item.name || color !== item.color;

  function save() {
    if (!dirty || !name.trim()) return;
    startTransition(async () => {
      await actions.update(item.id, { name: name.trim(), color });
      router.refresh();
    });
  }

  function remove() {
    startTransition(async () => {
      await actions.remove(item.id);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-surface p-2">
      <div className="flex flex-col">
        <ArrowBtn dir="up" disabled={isFirst || disabled} onClick={onMoveUp} />
        <ArrowBtn dir="down" disabled={isLast || disabled} onClick={onMoveDown} />
      </div>
      <ColorInput value={color} onChange={setColor} />
      <Input
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-9 flex-1"
      />
      {dirty ? (
        <Button size="sm" onClick={save} loading={pending}>
          {t.common.save}
        </Button>
      ) : confirm ? (
        <div className="flex items-center gap-1">
          <Button size="sm" variant="danger" onClick={remove} loading={pending}>
            {t.common.delete}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setConfirm(false)}>
            {t.common.no}
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          aria-label={deleteLabel}
          className="grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/15 dark:hover:text-red-400"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
            <path
              fillRule="evenodd"
              d="M8.75 1.75a.75.75 0 00-.75.75V3H4.5a.75.75 0 000 1.5h.34l.66 10.56A2 2 0 007.5 17h5a2 2 0 002-1.94L15.16 4.5h.34a.75.75 0 000-1.5H12v-.5a.75.75 0 00-.75-.75h-2.5zM7.5 7a.75.75 0 011.5 0v6a.75.75 0 01-1.5 0V7zm4.25-.75A.75.75 0 0011 7v6a.75.75 0 001.5 0V7a.75.75 0 00-.75-.75z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      )}
    </div>
  );
}

function ColorInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const { t } = useI18n();
  return (
    <label
      className="relative size-9 shrink-0 cursor-pointer overflow-hidden rounded-lg ring-1 ring-line"
      style={{ backgroundColor: value }}
      title={t.settings.chooseColor}
    >
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="absolute inset-0 cursor-pointer opacity-0"
      />
    </label>
  );
}

function ArrowBtn({
  dir,
  disabled,
  onClick,
}: {
  dir: "up" | "down";
  disabled: boolean;
  onClick: () => void;
}) {
  const { t } = useI18n();
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={dir === "up" ? t.settings.moveUp : t.settings.moveDown}
      className="grid size-5 place-items-center rounded text-faint transition-colors hover:bg-surface-strong hover:text-strong disabled:opacity-30 disabled:hover:bg-transparent"
    >
      <svg
        viewBox="0 0 20 20"
        fill="currentColor"
        className={dir === "down" ? "size-3.5 rotate-180" : "size-3.5"}
      >
        <path
          fillRule="evenodd"
          d="M10 5a.75.75 0 01.55.24l4 4.25a.75.75 0 11-1.1 1.02L10 6.85l-3.45 3.66a.75.75 0 11-1.1-1.02l4-4.25A.75.75 0 0110 5z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
}

"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { translateTaskToEnglish } from "@/lib/ai/translate";
import {
  PRIORITIES,
  STATUSES,
  type Priority,
  type Status,
} from "@/lib/constants";

function asPriority(v: unknown): Priority | undefined {
  return PRIORITIES.includes(v as Priority) ? (v as Priority) : undefined;
}
function asStatus(v: unknown): Status | undefined {
  return STATUSES.includes(v as Status) ? (v as Status) : undefined;
}

export async function createTask(input: {
  title: string;
  description?: string;
  companyId?: string | null;
  categoryId?: string | null;
  priority?: Priority;
}): Promise<{ ok: boolean; id?: string }> {
  await requireUser();
  const title = input.title.trim();
  if (!title) return { ok: false };

  const [row] = await db
    .insert(tasks)
    .values({
      title,
      description: input.description?.trim() ?? "",
      companyId: input.companyId ?? null,
      categoryId: input.categoryId ?? null,
      priority: asPriority(input.priority) ?? "medium",
    })
    .returning({ id: tasks.id });

  revalidatePath("/");
  return { ok: true, id: row.id };
}

export async function updateTaskStatus(
  id: string,
  status: Status,
): Promise<{ ok: boolean }> {
  await requireUser();
  const next = asStatus(status);
  if (!next) return { ok: false };

  await db
    .update(tasks)
    .set({ status: next, updatedAt: new Date() })
    .where(eq(tasks.id, id));

  revalidatePath("/");
  return { ok: true };
}

export async function updateTask(
  id: string,
  patch: {
    title?: string;
    description?: string;
    companyId?: string | null;
    categoryId?: string | null;
    priority?: Priority;
    aiAssist?: boolean;
  },
): Promise<{ ok: boolean }> {
  const user = await requireUser();

  const set: Record<string, unknown> = { updatedAt: new Date() };
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) return { ok: false };
    set.title = t;
  }
  if (patch.description !== undefined) set.description = patch.description.trim();
  if (patch.companyId !== undefined) set.companyId = patch.companyId;
  if (patch.categoryId !== undefined) set.categoryId = patch.categoryId;
  if (patch.priority !== undefined && asPriority(patch.priority))
    set.priority = patch.priority;
  if (patch.aiAssist !== undefined) set.aiAssist = patch.aiAssist;

  // Regenerate the English version when the text changed (and the feature is
  // on). The edit form always sends both fields, so we translate from the patch.
  if (
    user.englishTasksEnabled &&
    typeof set.title === "string" &&
    typeof set.description === "string"
  ) {
    try {
      const en = await translateTaskToEnglish(set.title, set.description);
      set.titleEn = en.titleEn || null;
      set.descriptionEn = en.descriptionEn || null;
    } catch (err) {
      console.error("updateTask: English regeneration failed:", err);
      // Leave the existing English as-is rather than failing the save.
    }
  }

  await db.update(tasks).set(set).where(eq(tasks.id, id));

  revalidatePath("/");
  return { ok: true };
}

export async function deleteTask(id: string): Promise<{ ok: boolean }> {
  await requireUser();
  await db.delete(tasks).where(eq(tasks.id, id));
  revalidatePath("/");
  return { ok: true };
}

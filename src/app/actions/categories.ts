"use server";

import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { categories } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { getDictionary } from "@/lib/i18n/server";

const HEX = /^#[0-9a-fA-F]{6}$/;

function cleanColor(color: string, fallback = "#888780"): string {
  return HEX.test(color.trim()) ? color.trim() : fallback;
}

export async function createCategory(input: {
  name: string;
  color: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireUser();
  const name = input.name.trim();
  if (!name)
    return { ok: false, error: (await getDictionary()).settings.nameRequired };

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${categories.sortOrder}), -1)` })
    .from(categories);

  const [row] = await db
    .insert(categories)
    .values({ name, color: cleanColor(input.color), sortOrder: max + 1 })
    .returning({ id: categories.id });

  revalidatePath("/");
  return { ok: true, id: row.id };
}

export async function updateCategory(
  id: string,
  patch: { name?: string; color?: string },
): Promise<{ ok: boolean; error?: string }> {
  await requireUser();
  const set: Record<string, unknown> = {};
  if (patch.name !== undefined) {
    const n = patch.name.trim();
    if (!n)
      return { ok: false, error: (await getDictionary()).settings.nameRequired };
    set.name = n;
  }
  if (patch.color !== undefined) set.color = cleanColor(patch.color);
  if (Object.keys(set).length === 0) return { ok: true };

  await db.update(categories).set(set).where(eq(categories.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCategory(id: string): Promise<{ ok: boolean }> {
  await requireUser();
  // FK onDelete: set null leaves this category's tasks uncategorized.
  await db.delete(categories).where(eq(categories.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function reorderCategories(
  orderedIds: string[],
): Promise<{ ok: boolean }> {
  await requireUser();
  if (orderedIds.length === 0) return { ok: true };
  // One batched round trip instead of N separate UPDATEs, so a partial failure
  // can't leave the sort order half-applied.
  const updates = orderedIds.map((cid, index) =>
    db.update(categories).set({ sortOrder: index }).where(eq(categories.id, cid)),
  );
  await db.batch(updates as [(typeof updates)[number], ...typeof updates]);
  revalidatePath("/");
  return { ok: true };
}

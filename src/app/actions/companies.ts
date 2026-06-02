"use server";

import { eq, sql, ilike, ne, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { companies, tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { getDictionary } from "@/lib/i18n/server";

const HEX = /^#[0-9a-fA-F]{6}$/;

function cleanColor(color: string, fallback = "#888780"): string {
  return HEX.test(color.trim()) ? color.trim() : fallback;
}

export async function createCompany(input: {
  name: string;
  color: string;
}): Promise<{ ok: boolean; id?: string; error?: string }> {
  await requireUser();
  const name = input.name.trim();
  if (!name) return { ok: false, error: (await getDictionary()).settings.nameRequired };

  const [{ max }] = await db
    .select({ max: sql<number>`coalesce(max(${companies.sortOrder}), -1)` })
    .from(companies);

  const [row] = await db
    .insert(companies)
    .values({ name, color: cleanColor(input.color), sortOrder: max + 1 })
    .returning({ id: companies.id });

  revalidatePath("/");
  return { ok: true, id: row.id };
}

export async function updateCompany(
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

  await db.update(companies).set(set).where(eq(companies.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<{ ok: boolean }> {
  await requireUser();

  // Try to move this company's tasks to a remaining "General" company;
  // otherwise the FK (onDelete: set null) leaves them uncategorized.
  const [general] = await db
    .select({ id: companies.id })
    .from(companies)
    .where(and(ilike(companies.name, "General"), ne(companies.id, id)))
    .limit(1);

  if (general) {
    await db
      .update(tasks)
      .set({ companyId: general.id })
      .where(eq(tasks.companyId, id));
  }

  await db.delete(companies).where(eq(companies.id, id));
  revalidatePath("/");
  return { ok: true };
}

export async function reorderCompanies(
  orderedIds: string[],
): Promise<{ ok: boolean }> {
  await requireUser();
  await Promise.all(
    orderedIds.map((cid, index) =>
      db
        .update(companies)
        .set({ sortOrder: index })
        .where(eq(companies.id, cid)),
    ),
  );
  revalidatePath("/");
  return { ok: true };
}

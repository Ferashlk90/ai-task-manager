"use server";

import { eq, isNull, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { users, tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { translateTaskToEnglish } from "@/lib/ai/translate";
import { isValidModelId } from "@/lib/ai/model";

// Master switch for the English-versions feature.
export async function setEnglishTasks(
  enabled: boolean,
): Promise<{ ok: boolean }> {
  const user = await requireUser();
  await db
    .update(users)
    .set({ englishTasksEnabled: enabled })
    .where(eq(users.id, user.id));
  revalidatePath("/");
  return { ok: true };
}

// Set the active AI model. Validated against the allowlist so only known model
// ids reach the DB; an invalid id is ignored (resolver would fall back anyway).
export async function setModel(id: string): Promise<{ ok: boolean }> {
  const user = await requireUser();
  if (!isValidModelId(id)) return { ok: false };
  await db.update(users).set({ aiModel: id }).where(eq(users.id, user.id));
  revalidatePath("/");
  return { ok: true };
}

// One-time translate of tasks that don't yet have an English version (i.e.
// created before the feature existed). Processes a bounded chunk per call —
// sequential to stay gentle on rate limits, capped so a large backlog can't hit
// the function timeout. Returns `remaining` so the UI can prompt "run again".
const BACKFILL_CHUNK = 10;

export async function backfillEnglish(): Promise<{
  ok: boolean;
  count: number;
  remaining: number;
}> {
  await requireUser();
  const pending = await db
    .select()
    .from(tasks)
    .where(isNull(tasks.titleEn))
    .limit(BACKFILL_CHUNK);

  let count = 0;
  for (const t of pending) {
    try {
      const en = await translateTaskToEnglish(t.title, t.description);
      await db
        .update(tasks)
        .set({
          titleEn: en.titleEn || null,
          descriptionEn: en.descriptionEn || null,
        })
        .where(eq(tasks.id, t.id));
      count++;
    } catch (err) {
      console.error("backfillEnglish failed for task", t.id, err);
    }
  }

  const [{ remaining }] = await db
    .select({ remaining: sql<number>`count(*)::int` })
    .from(tasks)
    .where(isNull(tasks.titleEn));

  revalidatePath("/");
  return { ok: true, count, remaining };
}

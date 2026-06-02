"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { tasks } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import { getCompanies, getCategories } from "@/lib/data";
import { organizeText } from "@/lib/ai/organize";
import { getDictionary } from "@/lib/i18n/server";

export async function organizeTasks(
  text: string,
): Promise<{ ok: boolean; count?: number; error?: string }> {
  await requireUser();
  const t = (await getDictionary()).composer;
  const input = text.trim();
  if (!input) return { ok: false, error: t.emptyTasks };

  let organized;
  try {
    const [companies, categories] = await Promise.all([
      getCompanies(),
      getCategories(),
    ]);
    organized = await organizeText(input, companies, categories);
  } catch (err) {
    console.error("organizeTasks failed:", err);
    return { ok: false, error: t.organizeFailed };
  }

  if (organized.length === 0) {
    return { ok: false, error: t.noTasksRecognized };
  }

  await db.insert(tasks).values(
    organized.map((t, i) => ({
      title: t.title,
      titleEn: t.titleEn || null,
      description: t.description,
      descriptionEn: t.descriptionEn || null,
      companyId: t.companyId,
      categoryId: t.categoryId,
      priority: t.priority,
      aiAssist: t.aiAssist,
      rawSource: input,
      sortOrder: i,
    })),
  );

  revalidatePath("/");
  return { ok: true, count: organized.length };
}

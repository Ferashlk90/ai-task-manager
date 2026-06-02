import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getActiveModel } from "./model";
import type { Company, Category } from "@/lib/types";
import type { Priority } from "@/lib/constants";

const taskSchema = z.object({
  title: z
    .string()
    .describe("Short, clear task title (max ~10 words), in the input's language"),
  titleEn: z
    .string()
    .describe("Faithful English translation of the title (English even if the input is Arabic)"),
  description: z
    .string()
    .describe("Optional extra detail taken from the input; empty string if none"),
  descriptionEn: z
    .string()
    .describe("Faithful English translation of the description; empty string if none"),
  companyId: z
    .string()
    .nullable()
    .describe("The id of the best-matching company, or null if none fits"),
  categoryId: z
    .string()
    .nullable()
    .describe("The id of the best-matching category, or null if none fits"),
  priority: z.enum(["high", "medium", "low"]),
  aiAssist: z
    .boolean()
    .describe(
      "true if an AI assistant could meaningfully help DO the task (writing, coding, analysis, planning, research); false for purely physical/in-person/financial/interpersonal actions",
    ),
});

const outputSchema = z.object({ tasks: z.array(taskSchema) });

export type OrganizedTask = {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  companyId: string | null;
  categoryId: string | null;
  priority: Priority;
  aiAssist: boolean;
};

function buildSystemPrompt(
  companies: Company[],
  categories: Category[],
): string {
  const companyList = companies.map((c) => `- ${c.name} (id: ${c.id})`).join("\n");
  const categoryList = categories
    .map((c) => `- ${c.name} (id: ${c.id})`)
    .join("\n");
  return `You turn a person's free-form brain-dump into a clean, structured task list.
The user organizes work across several companies and categories, and writes in any language (often Arabic or English) and any format.

Rules:
- Split the input into individual, actionable tasks. One line may contain several tasks — separate them. Never merge unrelated tasks.
- Keep each task's title/description in the SAME language it was written in.
- ALSO provide titleEn/descriptionEn: a faithful English translation of each (always in English, even when the original is Arabic). These are shared with English-speaking co-workers, so keep them clear and natural.
- title: short and clear. description: only detail actually present in the input — never invent; use "" if none (and "" for descriptionEn too).
- companyId: pick the company (by id from the list) whose name best matches the task's context (e.g. a task mentioning a specific client, brand, or project → the company that best fits). If nothing specific fits, prefer the company literally named "General" when it exists; otherwise null.
- categoryId: pick the category (by id from the list) that best describes the type of work; null if none clearly fits.
- priority: high = urgent / deadline / blocking; medium = normal; low = minor / someday.
- aiAssist: true when an AI assistant could help execute it (drafting, coding, analysis, research); false for purely physical/in-person/financial actions.

Available companies:
${companyList || "(none)"}

Available categories:
${categoryList || "(none)"}`;
}

export async function organizeText(
  text: string,
  companies: Company[],
  categories: Category[],
): Promise<OrganizedTask[]> {
  const { output } = await generateText({
    model: await getActiveModel(),
    system: buildSystemPrompt(companies, categories),
    prompt: text,
    output: Output.object({ schema: outputSchema }),
  });

  const validCompanyIds = new Set(companies.map((c) => c.id));
  const validCategoryIds = new Set(categories.map((c) => c.id));
  return output.tasks.map((t) => ({
    title: t.title.trim(),
    titleEn: t.titleEn?.trim() ?? "",
    description: t.description?.trim() ?? "",
    descriptionEn: t.descriptionEn?.trim() ?? "",
    companyId:
      t.companyId && validCompanyIds.has(t.companyId) ? t.companyId : null,
    categoryId:
      t.categoryId && validCategoryIds.has(t.categoryId) ? t.categoryId : null,
    priority: t.priority,
    aiAssist: t.aiAssist,
  }));
}

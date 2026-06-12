import type { Company, Category } from "@/lib/types";
import type { Priority } from "@/lib/constants";

// Shape returned by the model (post-parse) before we sanitize it. Kept loose on
// the optional text fields so callers don't have to pre-fill empty strings.
export type RawOrganizedTask = {
  title: string;
  titleEn?: string;
  description?: string;
  descriptionEn?: string;
  companyId: string | null;
  categoryId: string | null;
  priority: Priority;
  aiAssist: boolean;
};

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

// Trim text and drop any company/category id the model invented (i.e. one that
// isn't in the user's actual lists) — the guardrail against hallucinated ids.
// Pure and dependency-free so it's unit-testable without the AI SDK.
export function sanitizeOrganized(
  tasks: RawOrganizedTask[],
  companies: Company[],
  categories: Category[],
): OrganizedTask[] {
  const validCompanyIds = new Set(companies.map((c) => c.id));
  const validCategoryIds = new Set(categories.map((c) => c.id));
  return tasks.map((t) => ({
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

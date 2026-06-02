import "server-only";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { companies, categories, tasks, taskMessages } from "@/lib/db/schema";
import type {
  DbCompany,
  DbCategory,
  DbTask,
  DbTaskMessage,
} from "@/lib/db/schema";
import type { Company, Category, Task, ChatMessage } from "@/lib/types";

function toCompany(row: DbCompany): Company {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

function toCategory(row: DbCategory): Category {
  return {
    id: row.id,
    name: row.name,
    color: row.color,
    sortOrder: row.sortOrder,
  };
}

function toTask(row: DbTask): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    titleEn: row.titleEn,
    descriptionEn: row.descriptionEn,
    companyId: row.companyId,
    categoryId: row.categoryId,
    priority: row.priority,
    status: row.status,
    aiAssist: row.aiAssist,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toMessage(row: DbTaskMessage): ChatMessage {
  return {
    id: row.id,
    role: row.role,
    content: row.content,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function getCompanies(): Promise<Company[]> {
  const rows = await db
    .select()
    .from(companies)
    .orderBy(asc(companies.sortOrder), asc(companies.createdAt));
  return rows.map(toCompany);
}

export async function getCategories(): Promise<Category[]> {
  const rows = await db
    .select()
    .from(categories)
    .orderBy(asc(categories.sortOrder), asc(categories.createdAt));
  return rows.map(toCategory);
}

export async function getTasks(): Promise<Task[]> {
  const rows = await db
    .select()
    .from(tasks)
    .orderBy(asc(tasks.sortOrder), desc(tasks.createdAt));
  return rows.map(toTask);
}

export async function getBoardData(): Promise<{
  companies: Company[];
  categories: Category[];
  tasks: Task[];
}> {
  const [companyRows, categoryRows, taskRows] = await Promise.all([
    getCompanies(),
    getCategories(),
    getTasks(),
  ]);
  return { companies: companyRows, categories: categoryRows, tasks: taskRows };
}

export async function getTaskMessages(taskId: string): Promise<ChatMessage[]> {
  const rows = await db
    .select()
    .from(taskMessages)
    .where(eq(taskMessages.taskId, taskId))
    .orderBy(asc(taskMessages.createdAt));
  return rows.map(toMessage);
}

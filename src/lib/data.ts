import "server-only";
import { asc, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  companies,
  categories,
  tasks,
  taskMessages,
  assistantMessages,
} from "@/lib/db/schema";
import type {
  DbCompany,
  DbCategory,
  DbTask,
  DbTaskMessage,
} from "@/lib/db/schema";
import type { Company, Category, Task, ChatMessage } from "@/lib/types";

// A conversation shown in the Chat view: either a task's thread or the single
// global assistant thread.
export type ChatThread = {
  kind: "task" | "assistant";
  taskId: string | null;
  title: string;
  titleEn: string | null;
  lastAt: string | null;
  count: number;
};

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

export async function getAssistantMessages(): Promise<ChatMessage[]> {
  const rows = await db
    .select()
    .from(assistantMessages)
    .orderBy(asc(assistantMessages.createdAt));
  return rows.map((r) => ({
    id: r.id,
    role: r.role,
    content: r.content,
    createdAt: r.createdAt.toISOString(),
  }));
}

// One thread per task that has messages + the (always-present) assistant thread,
// assistant first then tasks by most-recent activity.
export async function getChatThreads(): Promise<ChatThread[]> {
  const taskRows = await db
    .select({
      taskId: taskMessages.taskId,
      title: tasks.title,
      titleEn: tasks.titleEn,
      lastAt: sql<string>`max(${taskMessages.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(taskMessages)
    .innerJoin(tasks, eq(taskMessages.taskId, tasks.id))
    .groupBy(taskMessages.taskId, tasks.title, tasks.titleEn);

  const [asst] = await db
    .select({
      lastAt: sql<string | null>`max(${assistantMessages.createdAt})`,
      count: sql<number>`count(*)::int`,
    })
    .from(assistantMessages);

  const taskThreads: ChatThread[] = taskRows
    .map((r) => ({
      kind: "task" as const,
      taskId: r.taskId,
      title: r.title,
      titleEn: r.titleEn,
      lastAt: r.lastAt,
      count: r.count,
    }))
    .sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)); // most recent first

  const assistantThread: ChatThread = {
    kind: "assistant",
    taskId: null,
    title: "",
    titleEn: null,
    lastAt: asst?.lastAt ?? null,
    count: asst?.count ?? 0,
  };

  return [assistantThread, ...taskThreads];
}

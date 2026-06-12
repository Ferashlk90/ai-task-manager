"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { taskMessages, assistantMessages } from "@/lib/db/schema";
import { requireUser } from "@/lib/auth/user";
import {
  getTaskMessages,
  getAssistantMessages,
  getChatThreads,
  type ChatThread,
} from "@/lib/data";
import type { ChatMessage } from "@/lib/types";

export async function loadTaskMessages(
  taskId: string,
): Promise<ChatMessage[]> {
  await requireUser();
  return getTaskMessages(taskId);
}

export async function loadAssistantMessages(): Promise<ChatMessage[]> {
  await requireUser();
  return getAssistantMessages();
}

export async function loadChatThreads(): Promise<ChatThread[]> {
  await requireUser();
  return getChatThreads();
}

export async function deleteTaskChat(taskId: string): Promise<{ ok: boolean }> {
  await requireUser();
  await db.delete(taskMessages).where(eq(taskMessages.taskId, taskId));
  revalidatePath("/");
  return { ok: true };
}

export async function clearAssistantChat(): Promise<{ ok: boolean }> {
  await requireUser();
  await db.delete(assistantMessages);
  revalidatePath("/");
  return { ok: true };
}

"use server";

import { requireUser } from "@/lib/auth/user";
import { getTaskMessages } from "@/lib/data";
import type { ChatMessage } from "@/lib/types";

export async function loadTaskMessages(
  taskId: string,
): Promise<ChatMessage[]> {
  await requireUser();
  return getTaskMessages(taskId);
}

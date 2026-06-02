import { streamText, type ModelMessage } from "ai";
import { eq, asc } from "drizzle-orm";
import { getModel } from "@/lib/ai/model";
import { db } from "@/lib/db";
import { tasks, taskMessages, companies, categories } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { getDictionary } from "@/lib/i18n/server";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import type { DbTask } from "@/lib/db/schema";

export const maxDuration = 60;

// Most recent messages sent to the model. The full thread stays in the DB and
// the UI; this only bounds what each turn re-bills, so a long-running task chat
// doesn't resend its entire transcript every time.
const MAX_HISTORY = 20;

function buildSystemPrompt(
  task: DbTask,
  companyName: string | null,
  categoryName: string | null,
  dict: Dictionary,
): string {
  return `You are a focused assistant helping the user execute ONE specific task.
Be concise and practical. Reply in the same language the user writes in (Arabic or English).
When asked to produce something, output the actual deliverable (draft, code, analysis, plan) — not just advice about it.

The task:
- Title: ${task.title}
${task.description ? `- Details: ${task.description}` : ""}
${companyName ? `- Company: ${companyName}` : ""}
${categoryName ? `- Category: ${categoryName} | ` : "- "}Priority: ${dict.priority[task.priority]}`;
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const dict = await getDictionary();
  const { id } = await ctx.params;
  const { message } = (await req.json()) as { message?: string };
  const userMessage = message?.trim();
  if (!userMessage) return new Response("Empty message", { status: 400 });

  const [task] = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  if (!task) return new Response("Task not found", { status: 404 });

  let companyName: string | null = null;
  if (task.companyId) {
    const [c] = await db
      .select({ name: companies.name })
      .from(companies)
      .where(eq(companies.id, task.companyId))
      .limit(1);
    companyName = c?.name ?? null;
  }

  let categoryName: string | null = null;
  if (task.categoryId) {
    const [c] = await db
      .select({ name: categories.name })
      .from(categories)
      .where(eq(categories.id, task.categoryId))
      .limit(1);
    categoryName = c?.name ?? null;
  }

  const history = await db
    .select()
    .from(taskMessages)
    .where(eq(taskMessages.taskId, id))
    .orderBy(asc(taskMessages.createdAt));

  // Persist the user's message before streaming the reply.
  await db.insert(taskMessages).values({
    taskId: id,
    role: "user",
    content: userMessage,
  });

  // Cap what reaches the model, and mark the last prior message as a cache
  // breakpoint so the stable prefix (system + earlier turns) is read from cache
  // on follow-ups instead of re-billed.
  const recent = history.slice(-MAX_HISTORY);
  const priorMessages: ModelMessage[] = recent.map((m, i) =>
    i === recent.length - 1
      ? {
          role: m.role,
          content: m.content,
          providerOptions: {
            anthropic: { cacheControl: { type: "ephemeral" } },
          },
        }
      : { role: m.role, content: m.content },
  );

  const messages: ModelMessage[] = [
    ...priorMessages,
    { role: "user" as const, content: userMessage },
  ];

  const result = streamText({
    model: getModel(user.aiModel),
    system: buildSystemPrompt(task, companyName, categoryName, dict),
    messages,
    onFinish: async ({ text, providerMetadata }) => {
      console.log("task chat cache:", providerMetadata?.anthropic);
      if (text.trim()) {
        await db.insert(taskMessages).values({
          taskId: id,
          role: "assistant",
          content: text,
        });
      }
    },
    onError: (err) => console.error("chat stream error:", err),
  });

  return result.toTextStreamResponse();
}

import { streamText, type ModelMessage } from "ai";
import { asc } from "drizzle-orm";
import { getModel } from "@/lib/ai/model";
import { db } from "@/lib/db";
import { assistantMessages } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/user";
import { getBoardData } from "@/lib/data";
import type { Company, Task } from "@/lib/types";

export const maxDuration = 60;

// Most recent turns re-sent to the model; the full thread lives in the DB.
const MAX_HISTORY = 20;

const STATUS_LABEL: Record<Task["status"], string> = {
  new: "New",
  in_progress: "In progress",
  done: "Done",
};

// Compact, model-friendly snapshot of the board, grouped by company. Only
// active (new + in_progress) tasks are listed in detail; completed tasks are
// reduced to a count so context size scales with open work, not total history.
function buildContext(companies: Company[], tasks: Task[]): string {
  if (tasks.length === 0) return "(no tasks yet)";

  const active = tasks.filter((t) => t.status !== "done");
  const doneCount = tasks.length - active.length;
  const doneNote =
    doneCount > 0
      ? `\n(${doneCount} completed task${doneCount === 1 ? "" : "s"} not shown)`
      : "";

  if (active.length === 0) {
    return `(no active tasks)${doneNote}`;
  }

  const nameById = new Map(companies.map((c) => [c.id, c.name]));
  const groups = new Map<string, Task[]>();
  for (const t of active) {
    const key = t.companyId
      ? (nameById.get(t.companyId) ?? "Uncategorized")
      : "Uncategorized";
    const list = groups.get(key) ?? [];
    list.push(t);
    groups.set(key, list);
  }

  // Keep company order; uncategorized last.
  const order = [
    ...companies.map((c) => c.name),
    ...(groups.has("Uncategorized") ? ["Uncategorized"] : []),
  ];

  const lines: string[] = [];
  const seen = new Set<string>();
  for (const name of order) {
    if (seen.has(name)) continue;
    seen.add(name);
    const list = groups.get(name);
    if (!list || list.length === 0) continue;
    lines.push(name);
    for (const t of list) {
      const desc = t.description?.trim();
      lines.push(
        `  • [${STATUS_LABEL[t.status]}] priority=${t.priority} "${t.title}"` +
          (desc ? ` — ${desc.slice(0, 160)}` : ""),
      );
    }
  }
  return lines.join("\n") + doneNote;
}

function buildSystemPrompt(context: string): string {
  return `You are a planning assistant for someone who manages tasks across several companies. Their full current task list is below. Help them understand and prioritize — answer questions, summarize, surface what is urgent or stuck, and recommend what to focus on. Be concise and practical.

Reply in the same language the user writes in (Arabic or English).
There are NO due dates in this app, so treat priority "high" as the urgency signal — never invent deadlines.
You can read and advise only; you cannot change tasks.

Tasks (grouped by company):
${context}`;
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { message } = (await req.json()) as { message?: string };
  const userMessage = message?.trim();
  if (!userMessage) return new Response("Empty message", { status: 400 });

  // The thread is persisted now, so the server owns history (the client just
  // sends the new message).
  const history = await db
    .select()
    .from(assistantMessages)
    .orderBy(asc(assistantMessages.createdAt));

  await db
    .insert(assistantMessages)
    .values({ role: "user", content: userMessage });

  const { companies, tasks } = await getBoardData();
  const system = buildSystemPrompt(buildContext(companies, tasks));

  const recent = history.slice(-MAX_HISTORY);
  const priorMessages: ModelMessage[] = recent.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const result = streamText({
    model: getModel(user.aiModel),
    // System prompt as a cached message: the board snapshot is stable across a
    // session, so turns 2+ read it from cache instead of re-billing it.
    messages: [
      {
        role: "system",
        content: system,
        providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
      },
      ...priorMessages,
      { role: "user", content: userMessage },
    ],
    onFinish: async ({ text }) => {
      if (text.trim()) {
        await db
          .insert(assistantMessages)
          .values({ role: "assistant", content: text });
      }
    },
    onError: (err) => console.error("assistant stream error:", err),
  });

  // Persist the reply even if the client disconnects mid-stream.
  result.consumeStream();

  return result.toTextStreamResponse();
}

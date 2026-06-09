import { streamText, type ModelMessage } from "ai";
import { getModel } from "@/lib/ai/model";
import { getCurrentUser } from "@/lib/auth/user";
import { getBoardData } from "@/lib/data";
import type { Company, Task } from "@/lib/types";

export const maxDuration = 60;

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

type IncomingMessage = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const body = (await req.json()) as { messages?: IncomingMessage[] };
  const incoming = Array.isArray(body.messages) ? body.messages : [];

  // Keep the request bounded and well-formed; the client holds the (ephemeral)
  // conversation, so we only trust role/content shape and cap the length.
  const messages: ModelMessage[] = incoming
    .filter(
      (m) =>
        (m.role === "user" || m.role === "assistant") &&
        typeof m.content === "string" &&
        m.content.trim().length > 0,
    )
    .slice(-20)
    .map((m) => ({ role: m.role, content: m.content }) as ModelMessage);

  if (messages.length === 0) return new Response("Empty", { status: 400 });

  const { companies, tasks } = await getBoardData();
  const system = buildSystemPrompt(buildContext(companies, tasks));

  const result = streamText({
    model: getModel(user.aiModel),
    // System prompt as a cached message: the board snapshot is identical across
    // turns of a session, so turns 2+ read it from cache instead of re-billing
    // it. (Anthropic only caches prefixes past a ~1024-token minimum.)
    messages: [
      {
        role: "system",
        content: system,
        providerOptions: { anthropic: { cacheControl: { type: "ephemeral" } } },
      },
      ...messages,
    ],
    onError: (err) => console.error("assistant stream error:", err),
  });

  return result.toTextStreamResponse();
}

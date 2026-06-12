import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/user";
import { getBoardData } from "@/lib/data";
import { availableModels, DEFAULT_MODEL_ID } from "@/lib/ai/model";
import { VIEW_COOKIE, DEFAULT_VIEW, isViewMode } from "@/lib/view";
import { Board } from "@/components/board/board";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { companies, categories, tasks } = await getBoardData();
  // Only models whose provider key is configured; ids/labels only (no secrets).
  const models = availableModels().map((m) => ({ id: m.id, label: m.label }));

  const viewCookie = (await cookies()).get(VIEW_COOKIE)?.value;
  const initialView = isViewMode(viewCookie) ? viewCookie : DEFAULT_VIEW;

  return (
    <Board
      companies={companies}
      categories={categories}
      tasks={tasks}
      email={user.email}
      englishEnabled={user.englishTasksEnabled}
      models={models}
      currentModel={user.aiModel ?? DEFAULT_MODEL_ID}
      initialView={initialView}
    />
  );
}

import { getBoardData } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth/user";
import { getDictionary } from "@/lib/i18n/server";
import { csvCell } from "@/lib/utils";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const dict = await getDictionary();
  const format = new URL(req.url).searchParams.get("format") ?? "json";
  const { companies, categories, tasks } = await getBoardData();
  const companyName = new Map(companies.map((c) => [c.id, c.name]));
  const categoryName = new Map(categories.map((c) => [c.id, c.name]));
  const stamp = new Date().toISOString().slice(0, 10);

  if (format === "csv") {
    const cols = dict.exportCols;
    const headers = [
      cols.company,
      cols.title,
      cols.titleEn,
      cols.description,
      cols.descriptionEn,
      cols.priority,
      cols.category,
      cols.status,
      cols.createdAt,
    ];
    const rows = tasks.map((t) => [
      t.companyId
        ? (companyName.get(t.companyId) ?? "")
        : dict.common.uncategorized,
      t.title,
      t.titleEn ?? "",
      t.description,
      t.descriptionEn ?? "",
      dict.priority[t.priority],
      t.categoryId ? (categoryName.get(t.categoryId) ?? "") : "",
      dict.status[t.status],
      t.createdAt,
    ]);

    const BOM = "\uFEFF"; // makes Excel read UTF-8 (Arabic) correctly
    const csv =
      BOM +
      [headers, ...rows]
        .map((row) => row.map(csvCell).join(","))
        .join("\r\n");

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="tasks-${stamp}.csv"`,
      },
    });
  }

  const payload = {
    exportedAt: new Date().toISOString(),
    companies,
    categories,
    tasks,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="tasks-${stamp}.json"`,
    },
  });
}

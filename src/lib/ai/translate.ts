import "server-only";
import { generateText, Output } from "ai";
import { z } from "zod";
import { getActiveModel } from "./model";

const schema = z.object({
  titleEn: z.string().describe("Faithful, natural English translation of the title"),
  descriptionEn: z
    .string()
    .describe("Faithful English translation of the description; empty string if the description is empty"),
});

export type TaskEnglish = { titleEn: string; descriptionEn: string };

// Translates one task's title/description to English (for tasks created/edited
// outside the organize flow, and for backfilling existing tasks). Already-English
// input is returned essentially unchanged.
export async function translateTaskToEnglish(
  title: string,
  description: string,
): Promise<TaskEnglish> {
  const { output } = await generateText({
    model: await getActiveModel(),
    system:
      "You translate a single task into clear, natural English for sharing with English-speaking co-workers. Translate faithfully without adding or removing meaning. If the text is already English, return it as-is.",
    prompt: `Title: ${title}\nDescription: ${description || "(none)"}`,
    output: Output.object({ schema }),
  });

  return {
    titleEn: output.titleEn?.trim() ?? "",
    descriptionEn: output.descriptionEn?.trim() ?? "",
  };
}

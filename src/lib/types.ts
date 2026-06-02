import type { Priority, Status } from "./constants";

// Plain, serializable shapes passed from Server Components to the client.
export type Company = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

// User-defined category (type of work). Same shape as Company.
export type Category = {
  id: string;
  name: string;
  color: string;
  sortOrder: number;
};

export type Task = {
  id: string;
  title: string;
  description: string;
  // English renderings for sharing; null until generated.
  titleEn: string | null;
  descriptionEn: string | null;
  companyId: string | null;
  categoryId: string | null;
  priority: Priority;
  status: Status;
  aiAssist: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

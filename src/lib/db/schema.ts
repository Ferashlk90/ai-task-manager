import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const priorityEnum = pgEnum("priority", ["high", "medium", "low"]);
export const statusEnum = pgEnum("status", ["new", "in_progress", "done"]);
export const messageRoleEnum = pgEnum("message_role", ["user", "assistant"]);

// Single-user app: one row holds credentials + TOTP secret.
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  totpSecret: text("totp_secret"),
  // Last accepted TOTP time-step (RFC 6238 T). A code at or before this step is
  // rejected as a replay. Nullable: null until the first successful verification,
  // which also keeps the migration safe for the existing row.
  totpLastStep: integer("totp_last_step"),
  isSetup: boolean("is_setup").notNull().default(false),
  // Master switch for the "English versions of tasks" feature.
  englishTasksEnabled: boolean("english_tasks_enabled").notNull().default(true),
  // Selected AI model id (see lib/ai/model.ts allowlist); null → app default.
  aiModel: text("ai_model"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// User-defined categories (type of work). Same shape as companies.
export const categories = pgTable("categories", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  color: text("color").notNull(),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  // English renderings for sharing with co-workers; null until generated.
  titleEn: text("title_en"),
  descriptionEn: text("description_en"),
  // onDelete: set null so deleting a company doesn't delete its tasks;
  // the delete action reassigns them to "General" where possible.
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "set null",
  }),
  categoryId: uuid("category_id").references(() => categories.id, {
    onDelete: "set null",
  }),
  priority: priorityEnum("priority").notNull().default("medium"),
  status: statusEnum("status").notNull().default("new"),
  aiAssist: boolean("ai_assist").notNull().default(true),
  rawSource: text("raw_source"),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const taskMessages = pgTable("task_messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  taskId: uuid("task_id")
    .notNull()
    .references(() => tasks.id, { onDelete: "cascade" }),
  role: messageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const companiesRelations = relations(companies, ({ many }) => ({
  tasks: many(tasks),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  company: one(companies, {
    fields: [tasks.companyId],
    references: [companies.id],
  }),
  category: one(categories, {
    fields: [tasks.categoryId],
    references: [categories.id],
  }),
  messages: many(taskMessages),
}));

export const taskMessagesRelations = relations(taskMessages, ({ one }) => ({
  task: one(tasks, {
    fields: [taskMessages.taskId],
    references: [tasks.id],
  }),
}));

export type DbCompany = typeof companies.$inferSelect;
export type DbCategory = typeof categories.$inferSelect;
export type DbTask = typeof tasks.$inferSelect;
export type DbTaskMessage = typeof taskMessages.$inferSelect;
export type DbUser = typeof users.$inferSelect;

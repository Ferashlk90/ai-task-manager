// Shared enums and labels used across the app (server + client safe).

export const PRIORITIES = ["high", "medium", "low"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const STATUSES = ["new", "in_progress", "done"] as const;
export type Status = (typeof STATUSES)[number];

// Human-readable labels for priority / status live in the i18n dictionary
// (src/lib/i18n/dictionaries.ts). Companies and categories are user-defined.

// Visual accents for priority badges.
export const PRIORITY_COLORS: Record<Priority, string> = {
  high: "#DC2626",
  medium: "#D97706",
  low: "#2563EB",
};

// Seed companies/categories created on first database setup. Rename these to
// whatever buckets you organize work into. Keep one named "General": the
// organizer falls back to it when no other bucket fits (see lib/ai/organize.ts).
export const DEFAULT_COMPANIES: { name: string; color: string }[] = [
  { name: "Work", color: "#378ADD" },
  { name: "Personal", color: "#1D9E75" },
  { name: "Side project", color: "#7F77DD" },
  { name: "General", color: "#888780" },
];

// Seed categories (type of work) created on first database setup. Fully
// user-editable afterward, like companies.
export const DEFAULT_CATEGORIES: { name: string; color: string }[] = [
  { name: "Marketing", color: "#D85A30" },
  { name: "Development", color: "#378ADD" },
  { name: "Management", color: "#7F77DD" },
  { name: "Content", color: "#1D9E75" },
  { name: "Other", color: "#888780" },
];

// App name shown in the UI lives in the i18n dictionary (`appName`).
// This issuer is the label shown inside the user's authenticator app.
export const TOTP_ISSUER = "Personal Task Manager";

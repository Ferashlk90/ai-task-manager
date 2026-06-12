// View-mode primitives — plain module, safe on server or client.

export const VIEW_MODES = ["board", "list", "chat"] as const;
export type ViewMode = (typeof VIEW_MODES)[number];

// Not httpOnly — a display preference. Set client-side by the toggle and read
// server-side to render the right initial view (avoids a flash of the wrong one).
export const VIEW_COOKIE = "ptm_view";
export const DEFAULT_VIEW: ViewMode = "board";

export function isViewMode(value: unknown): value is ViewMode {
  return value === "board" || value === "list" || value === "chat";
}

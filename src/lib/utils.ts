// Tiny class-name joiner (avoids a clsx dependency for our simple cases).
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

// Format a value as a CSV cell: neutralize spreadsheet formula injection by
// prefixing cells that start with = + - @ (a leading ' makes Excel/Sheets treat
// them as text), then escape embedded quotes and wrap the whole cell in quotes.
export function csvCell(value: string): string {
  const v = value ?? "";
  const safe = /^[=+\-@]/.test(v) ? `'${v}` : v;
  return `"${safe.replace(/"/g, '""')}"`;
}

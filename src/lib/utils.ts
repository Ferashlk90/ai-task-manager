// Tiny class-name joiner (avoids a clsx dependency for our simple cases).
export function cn(
  ...classes: Array<string | false | null | undefined>
): string {
  return classes.filter(Boolean).join(" ");
}

import { getDictionary } from "@/lib/i18n/server";

// Shown while the page's server-side work (auth check + DB fetch on "/")
// streams in. Server Component — kept lightweight on purpose.
export default async function Loading() {
  const t = await getDictionary();
  return (
    <div
      className="flex min-h-dvh items-center justify-center"
      role="status"
      aria-live="polite"
    >
      <span className="flex items-center gap-3 text-muted">
        <span
          className="size-5 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
        <span className="text-sm">{t.common.loading}</span>
      </span>
    </div>
  );
}

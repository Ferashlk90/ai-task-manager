"use client"; // Error boundaries must be Client Components.

// Last line of defense: replaces the root layout when the layout itself
// throws, so it must render its own <html>/<body> and pull in global styles.
// Kept dependency-light — no shared UI imports — since the app may be broken.
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  return (
    <html lang="ar" dir="rtl" className="h-full">
      <body className="min-h-full antialiased">
        <title>حدث خطأ — مدير المهام</title>
        <main className="flex min-h-dvh items-center justify-center px-4 py-10">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-lg font-semibold text-neutral-900">
              حدث خطأ غير متوقع
            </h1>
            <p className="mt-1.5 text-sm text-neutral-500">
              واجه التطبيق مشكلة. حاول إعادة التحميل.
            </p>
            <button
              type="button"
              onClick={() => unstable_retry()}
              className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl bg-neutral-900 px-4 text-sm font-medium text-white outline-none transition-colors hover:bg-neutral-800 focus-visible:ring-2 focus-visible:ring-neutral-400 focus-visible:ring-offset-1"
            >
              إعادة المحاولة
            </button>
            {error.digest && (
              <p className="mt-3 font-mono text-[11px] text-neutral-400">
                رمز الخطأ: {error.digest}
              </p>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}

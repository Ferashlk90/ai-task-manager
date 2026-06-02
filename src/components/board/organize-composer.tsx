"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n/context";
import { organizeTasks } from "@/app/actions/organize";

export function OrganizeComposer({ hasCompanies }: { hasCompanies: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{
    kind: "ok" | "error";
    msg: string;
  } | null>(null);

  function organize() {
    if (!text.trim() || pending) return;
    setFeedback(null);
    startTransition(async () => {
      const res = await organizeTasks(text);
      if (res.ok) {
        setText("");
        setFeedback({
          kind: "ok",
          msg: t.composer.added.replace("{count}", String(res.count ?? 0)),
        });
        router.refresh();
        setTimeout(() => setFeedback(null), 4000);
      } else {
        setFeedback({ kind: "error", msg: res.error ?? t.composer.genericError });
      }
    });
  }

  return (
    <div className="rounded-2xl border border-line bg-surface p-3 shadow-sm sm:p-4">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if ((e.metaKey || e.ctrlKey) && e.key === "Enter") organize();
        }}
        rows={3}
        placeholder={t.composer.placeholder}
        className="scrollable w-full resize-y rounded-xl border border-transparent bg-surface-muted p-3 text-sm leading-7 text-fg outline-none transition-colors placeholder:text-faint focus:border-line focus:bg-surface"
      />
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0 text-xs">
          {feedback ? (
            <span
              className={
                feedback.kind === "ok"
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }
            >
              {feedback.msg}
            </span>
          ) : (
            <span className="text-faint">
              {hasCompanies
                ? t.composer.hintShortcut
                : t.composer.hintAddCompanies}
            </span>
          )}
        </div>
        <Button onClick={organize} loading={pending} disabled={!text.trim()}>
          {pending ? t.composer.organizing : t.composer.organize}
        </Button>
      </div>
    </div>
  );
}

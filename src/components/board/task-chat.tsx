"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { ChatMarkdown } from "@/components/chat-markdown";
import { CopyMessageButton } from "@/components/board/copy-message-button";
import type { Task } from "@/lib/types";
import { loadTaskMessages } from "@/app/actions/chat";

type Msg = { role: "user" | "assistant"; content: string };

export function TaskChat({ task }: { task: Task }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // `loading` starts true; this panel remounts per task (keyed by id),
    // so there's no need to reset it synchronously here.
    let active = true;
    loadTaskMessages(task.id)
      .then((msgs) => {
        if (active) {
          setMessages(msgs.map((m) => ({ role: m.role, content: m.content })));
          setLoading(false);
        }
      })
      .catch(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [task.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingText]);

  async function send() {
    const text = draft.trim();
    if (!text || streaming) return;
    setDraft("");
    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setStreaming(true);
    setStreamingText("");
    try {
      const res = await fetch(`/api/tasks/${task.id}/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok || !res.body) throw new Error("bad response");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setStreamingText(acc);
      }
      setMessages((prev) => [...prev, { role: "assistant", content: acc }]);
    } catch {
      setError(t.chat.error);
    } finally {
      setStreaming(false);
      setStreamingText("");
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <span className="grid size-6 place-items-center rounded-md bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
            <path d="M10 1.5l1.6 4.2 4.4 1.6-4.4 1.6L10 13.5 8.4 9.3 4 7.7l4.4-1.6L10 1.5z" />
          </svg>
        </span>
        <h3 className="text-sm font-bold text-strong">
          {t.chat.assistant}
        </h3>
      </div>

      <div className="space-y-2.5">
        {loading ? (
          <p className="text-xs text-faint">{t.common.loading}</p>
        ) : messages.length === 0 && !streaming ? (
          <p className="rounded-xl bg-surface-muted px-3 py-3 text-xs leading-6 text-muted">
            {t.chat.emptyHint}
          </p>
        ) : (
          messages.map((m, i) => <Bubble key={i} role={m.role} text={m.content} />)
        )}
        {streaming && (
          <Bubble role="assistant" text={streamingText || "…"} streaming />
        )}
        <div ref={bottomRef} />
      </div>

      {error && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{error}</p>}

      <div className="mt-3 flex items-end gap-2">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder={t.chat.placeholder}
          className="scrollable max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-6 text-fg outline-none transition-colors focus:border-muted focus:ring-2 focus:ring-ring-soft/70"
        />
        <button
          type="button"
          onClick={send}
          disabled={streaming || !draft.trim()}
          aria-label={t.chat.send}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:bg-accent-muted"
        >
          {streaming ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 rtl:-scale-x-100">
              <path d="M3.4 2.6a.75.75 0 00-.96.93l1.7 5.1a1 1 0 00.78.67l6.06.95c.27.04.27.43 0 .47l-6.06.95a1 1 0 00-.78.67l-1.7 5.1a.75.75 0 00.96.93l14-7a.75.75 0 000-1.34l-14-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

function Bubble({
  role,
  text,
  streaming,
}: {
  role: "user" | "assistant";
  text: string;
  streaming?: boolean;
}) {
  if (role === "user") {
    return (
      <div
        dir="auto"
        className="ms-auto max-w-[88%] whitespace-pre-wrap rounded-2xl bg-accent px-3 py-2 text-sm leading-6 text-on-accent"
      >
        {text}
      </div>
    );
  }
  return (
    <div className="me-auto max-w-[88%]">
      <div
        dir="auto"
        className="rounded-2xl bg-surface-strong px-3 py-2 text-sm leading-6 text-strong"
      >
        <ChatMarkdown>{text}</ChatMarkdown>
      </div>
      {!streaming && text && <CopyMessageButton text={text} />}
    </div>
  );
}

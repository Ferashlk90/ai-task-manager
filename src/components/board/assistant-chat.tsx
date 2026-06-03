"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { ChatMarkdown } from "@/components/chat-markdown";
import { CopyMessageButton } from "@/components/board/copy-message-button";

type Msg = { role: "user" | "assistant"; content: string };

// Board-wide assistant. Ephemeral: the conversation lives only in component
// state and is sent to /api/assistant/chat each turn (no persistence). The
// route loads the live task list server-side for context.
export function AssistantChat() {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, streamingText]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || streaming) return;
    setDraft("");
    setError(null);
    const next: Msg[] = [...messages, { role: "user", content }];
    setMessages(next);
    setStreaming(true);
    setStreamingText("");
    try {
      const res = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
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

  const empty = messages.length === 0 && !streaming;

  return (
    <div className="flex h-full flex-col">
      <div className="scrollable flex-1 space-y-2.5 overflow-y-auto px-5 py-5">
        {empty ? (
          <div className="space-y-3">
            <p className="rounded-xl bg-surface-muted px-3 py-3 text-xs leading-6 text-muted">
              {t.assistant.intro}
            </p>
            <div className="flex flex-col gap-1.5">
              {t.assistant.examples.map((ex, i) => (
                <button
                  key={i}
                  type="button"
                  dir="auto"
                  onClick={() => send(ex)}
                  className="rounded-lg border border-line bg-surface px-3 py-2 text-start text-xs text-strong transition-colors hover:bg-surface-muted"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((m, i) => <Bubble key={i} role={m.role} text={m.content} />)
        )}
        {streaming && (
          <Bubble role="assistant" text={streamingText || "…"} streaming />
        )}
        <div ref={bottomRef} />
      </div>

      {error && (
        <p className="px-5 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}

      <div className="flex items-end gap-2 border-t border-line-muted px-5 py-4">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send(draft);
            }
          }}
          rows={1}
          placeholder={t.assistant.placeholder}
          className="scrollable max-h-32 min-h-10 flex-1 resize-none rounded-xl border border-line bg-surface px-3 py-2 text-sm leading-6 text-fg outline-none transition-colors focus:border-muted focus:ring-2 focus:ring-ring-soft/70"
        />
        <button
          type="button"
          onClick={() => send(draft)}
          disabled={streaming || !draft.trim()}
          aria-label={t.chat.send}
          className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-on-accent transition-colors hover:bg-accent-hover disabled:bg-accent-muted"
        >
          {streaming ? (
            <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          ) : (
            <svg
              viewBox="0 0 20 20"
              fill="currentColor"
              className="size-5 rtl:-scale-x-100"
            >
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

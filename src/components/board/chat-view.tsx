"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/context";
import {
  loadChatThreads,
  deleteTaskChat,
  clearAssistantChat,
} from "@/app/actions/chat";
import { TaskChat } from "./task-chat";
import { AssistantChat } from "./assistant-chat";
import type { Task } from "@/lib/types";
import type { ChatThread } from "@/lib/data";

const ASSISTANT_KEY = "assistant";

// Browse every AI conversation in one place: the (pinned) board assistant plus
// every task that has a chat. Selecting one opens it in the detail pane, reusing
// the same TaskChat / AssistantChat components used elsewhere.
export function ChatView({
  tasks,
  english,
}: {
  tasks: Task[];
  english: boolean;
}) {
  const { t } = useI18n();
  const [threads, setThreads] = useState<ChatThread[] | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function refresh() {
    loadChatThreads()
      .then(setThreads)
      .catch(() => setThreads([]));
  }
  useEffect(() => {
    refresh();
  }, []);

  const taskById = useMemo(
    () => new Map(tasks.map((task) => [task.id, task])),
    [tasks],
  );

  function threadKey(thread: ChatThread) {
    return thread.kind === "assistant" ? ASSISTANT_KEY : thread.taskId!;
  }
  function threadName(thread: ChatThread) {
    if (thread.kind === "assistant") return t.chats.assistantThread;
    return english && thread.titleEn ? thread.titleEn : thread.title;
  }

  function remove(thread: ChatThread) {
    if (!confirm(t.chats.deleteConfirm.replace("{name}", threadName(thread))))
      return;
    startTransition(async () => {
      if (thread.kind === "assistant") await clearAssistantChat();
      else if (thread.taskId) await deleteTaskChat(thread.taskId);
      if (selectedKey === threadKey(thread)) setSelectedKey(null);
      refresh();
    });
  }

  const selectedThread = threads?.find((th) => threadKey(th) === selectedKey);
  const selectedTask =
    selectedThread?.kind === "task" && selectedThread.taskId
      ? taskById.get(selectedThread.taskId)
      : undefined;

  return (
    <div className="flex h-[70dvh] gap-3">
      {/* Thread list */}
      <aside
        className={cn(
          "scrollable w-full flex-col overflow-y-auto rounded-2xl border border-line bg-surface md:flex md:w-72",
          selectedKey ? "hidden md:flex" : "flex",
        )}
      >
        {threads === null ? (
          <p className="px-4 py-4 text-xs text-faint">{t.common.loading}</p>
        ) : (
          <ul className="divide-y divide-line">
            {threads.map((thread) => {
              const key = threadKey(thread);
              const active = key === selectedKey;
              return (
                <li
                  key={key}
                  className={cn(
                    "flex items-center gap-1",
                    active && "bg-surface-muted",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedKey(key)}
                    className="flex min-w-0 flex-1 flex-col gap-0.5 px-4 py-3 text-start"
                  >
                    <span
                      dir="auto"
                      className="flex items-center gap-1.5 truncate text-sm font-medium text-fg"
                    >
                      {thread.kind === "assistant" && <SparkIcon />}
                      <span className="truncate">{threadName(thread)}</span>
                    </span>
                    <span className="text-xs text-faint">
                      {thread.count > 0
                        ? t.chats.messageCount.replace(
                            "{count}",
                            String(thread.count),
                          )
                        : t.chats.noMessages}
                      {thread.lastAt ? ` · ${thread.lastAt.slice(0, 10)}` : ""}
                    </span>
                  </button>
                  {thread.count > 0 && (
                    <button
                      type="button"
                      onClick={() => remove(thread)}
                      disabled={pending}
                      aria-label={t.chats.delete}
                      className="me-2 grid size-8 shrink-0 place-items-center rounded-lg text-faint transition-colors hover:bg-surface-strong hover:text-red-600 disabled:opacity-50 dark:hover:text-red-400"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </aside>

      {/* Detail */}
      <section
        className={cn(
          "flex-1 flex-col overflow-hidden rounded-2xl border border-line bg-surface",
          selectedKey ? "flex" : "hidden md:flex",
        )}
      >
        {selectedThread ? (
          <>
            <div className="flex items-center gap-2 border-b border-line-muted px-3 py-2 md:hidden">
              <button
                type="button"
                onClick={() => setSelectedKey(null)}
                aria-label={t.common.close}
                className="grid size-8 place-items-center rounded-lg text-muted hover:bg-surface-strong"
              >
                <BackIcon />
              </button>
              <span className="truncate text-sm font-semibold text-strong">
                {threadName(selectedThread)}
              </span>
            </div>
            <div className="min-h-0 flex-1">
              {selectedThread.kind === "assistant" ? (
                <AssistantChat />
              ) : selectedTask ? (
                <div className="scrollable h-full overflow-y-auto p-4">
                  <TaskChat task={selectedTask} />
                </div>
              ) : (
                <p className="p-4 text-sm text-faint">{t.chats.pickConversation}</p>
              )}
            </div>
          </>
        ) : (
          <div className="grid h-full place-items-center px-6 text-center">
            <p className="text-sm text-faint">{t.chats.pickConversation}</p>
          </div>
        )}
      </section>
    </div>
  );
}

function SparkIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-3.5 shrink-0 text-violet-500"
      aria-hidden
    >
      <path d="M10 1.5l1.6 4.2 4.4 1.6-4.4 1.6L10 13.5 8.4 9.3 4 7.7l4.4-1.6L10 1.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-4" aria-hidden>
      <path d="M8.5 2.5a.75.75 0 0 0-.71.51L7.4 4.25H4.75a.75.75 0 0 0 0 1.5h.34l.62 9.35A1.75 1.75 0 0 0 7.45 16.75h5.1a1.75 1.75 0 0 0 1.74-1.65l.62-9.35h.34a.75.75 0 0 0 0-1.5H12.6l-.39-1.24a.75.75 0 0 0-.71-.51h-3zM8.5 8a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 8.5 8zm3.75.75a.75.75 0 0 0-1.5 0v3.5a.75.75 0 0 0 1.5 0v-3.5z" />
    </svg>
  );
}

function BackIcon() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className="size-5 rtl:-scale-x-100"
      aria-hidden
    >
      <path d="M12.7 4.3a1 1 0 0 1 0 1.4L8.42 10l4.3 4.3a1 1 0 0 1-1.42 1.4l-5-5a1 1 0 0 1 0-1.4l5-5a1 1 0 0 1 1.4 0z" />
    </svg>
  );
}

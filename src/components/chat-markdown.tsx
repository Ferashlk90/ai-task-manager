"use client";

import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// Compact, chat-sized Markdown styled with the app's theme tokens. Only the
// props we use are destructured (never `node`), so nothing leaks to the DOM.
const components: Components = {
  h1: ({ children }) => (
    <h3 className="mb-1 mt-3 text-sm font-bold first:mt-0">{children}</h3>
  ),
  h2: ({ children }) => (
    <h3 className="mb-1 mt-3 text-sm font-bold first:mt-0">{children}</h3>
  ),
  h3: ({ children }) => (
    <h4 className="mb-1 mt-3 text-[13px] font-semibold first:mt-0">{children}</h4>
  ),
  h4: ({ children }) => (
    <h4 className="mb-1 mt-3 text-[13px] font-semibold first:mt-0">{children}</h4>
  ),
  p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
  ul: ({ children }) => (
    <ul className="mb-2 list-disc space-y-1 ps-5 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-2 list-decimal space-y-1 ps-5 last:mb-0">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-6 marker:text-faint">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="underline underline-offset-2"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-3 border-line" />,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-s-2 border-line ps-3 text-muted">
      {children}
    </blockquote>
  ),
  pre: ({ children }) => (
    <pre className="scrollable mb-2 overflow-x-auto rounded-lg bg-surface-strong p-3 text-[12px] leading-5 last:mb-0">
      {children}
    </pre>
  ),
  code: ({ children, className }) => {
    const text = String(children ?? "");
    const inline = !className && !text.includes("\n");
    return inline ? (
      <code className="rounded bg-surface-strong px-1 py-0.5 font-mono text-[12px]">
        {children}
      </code>
    ) : (
      <code className={cn("font-mono", className)}>{children}</code>
    );
  },
  table: ({ children }) => (
    <div className="scrollable mb-2 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-line px-2 py-1 text-start font-semibold">
      {children}
    </th>
  ),
  td: ({ children }) => <td className="border border-line px-2 py-1">{children}</td>,
};

export function ChatMarkdown({ children }: { children: string }) {
  return (
    <div className="text-sm leading-6">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}

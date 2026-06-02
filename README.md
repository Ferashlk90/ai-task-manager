# AI Personal Task Manager

> Brain-dump your tasks in plain English or Arabic — an LLM structures them by
> bucket, priority, and type, translates them, and helps you execute each one.

A self-hosted, single-user task manager built around an AI organizer. Paste a
messy list in any language and it becomes a clean, categorized board. Pick your
model (Claude, GPT, Gemini, or DeepSeek). Fully bilingual with right-to-left support.

## Highlights

- 🧠 **AI organizer** — paste free text, get structured tasks (bucket, priority,
  type, and an English translation) in one step.
- 🌍 **Bilingual, RTL-ready** — full English + Arabic UI; the organizer keeps each
  task in its original language *and* produces a faithful English version for
  sharing with colleagues.
- 🔌 **Bring your own model** — switch between Anthropic Claude, OpenAI GPT, Google
  Gemini, and DeepSeek from Settings; only providers whose key you've set are offered.
- 💬 **Per-task AI chat** — ask the model to actually do the task (draft, code,
  analyze); history is saved per task.
- 🔎 **Fast board** — search, a bucket filter, and status tabs (New · In progress ·
  Done) that all compose together.
- 🔒 **Private by design** — password + authenticator-app (TOTP) login, rate
  limiting, signed-cookie sessions, and a strict Content-Security-Policy.
- 🌗 Dark mode · installable PWA · JSON/CSV export.

## Screenshots

<!-- Add a screenshot or two here (board + task panel) — e.g.:
![Board](./docs/board.png)
![Task panel](./docs/task-panel.png)
-->

_Coming soon._

## Stack

- **Next.js 16** (App Router, Server Actions) + **TypeScript** + **Tailwind v4**
- **Postgres** (e.g. [Neon](https://neon.tech)) via **Drizzle ORM**
- **Vercel AI SDK** with a pluggable provider picker — `generateText` +
  `Output.object` for organizing/translation, `streamText` for chat
- Auth: email + password → **TOTP** → 7-day signed-cookie session

## Features

- **Organize**: paste free text → the model splits it into tasks classified by
  bucket (your "company / category"), priority (high·medium·low), and type
  (marketing·development·management·content·other).
- **Board**: tasks grouped by bucket with color accents; **search**, a
  **bucket filter**, and **status tabs** that compose together.
- **Task panel**: change status, edit any field if the AI got it wrong, delete,
  and chat with AI to execute the task (history saved per task).
- **English versions**: optional faithful English title/description per task for
  sharing with English-speaking colleagues (one-click copy).
- **Model selection**: choose the AI model in Settings; only configured
  providers appear.
- **Settings**: add / edit / delete / reorder your buckets.
- **Export**: JSON, and Excel-friendly CSV (UTF-8 BOM for Arabic).
- Dark mode, English/Arabic UI toggle, and an installable PWA.

## Prerequisites

1. **Node 22+**
2. A **Postgres** database (e.g. [Neon](https://neon.tech) free tier) → its
   connection string
3. At least one **AI provider key**:
   - Anthropic — https://console.anthropic.com/settings/keys
   - OpenAI — https://platform.openai.com/api-keys
   - Google Gemini — https://aistudio.google.com/apikey
   - DeepSeek — https://platform.deepseek.com/api_keys

## Setup

```bash
npm install
cp .env.example .env.local      # then fill it in (see below)
npm run db:push                 # create tables from the Drizzle schema
npm run db:seed                 # seed the starting buckets
npm run dev                     # http://localhost:3000
```

`.env.local`:

```
DATABASE_URL=postgresql://...                 # from your Postgres provider
SESSION_SECRET=...                            # openssl rand -base64 32
ANTHROPIC_API_KEY=sk-ant-...                  # set at least one provider
OPENAI_API_KEY=                               # optional
GOOGLE_GENERATIVE_AI_API_KEY=                 # optional
DEEPSEEK_API_KEY=                             # optional
```

The model picker only shows models whose provider key is present; the default
is Claude Sonnet.

## First run

Your first visit redirects to **/setup**:

1. Scan the QR code with an authenticator app (Google Authenticator, Authy…).
2. Set your email + password.
3. Enter the 6-digit code to confirm — you're in.

After that, log in with **password → 6-digit code**. Sessions last 7 days.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Production build / serve |
| `npm run db:push` | Sync schema to the database |
| `npm run db:seed` | Seed starting buckets |
| `npm run db:studio` | Browse data in Drizzle Studio |
| `npm run lint` | ESLint |

## Deploy (Vercel)

Push to a repo, import it in Vercel, and set `DATABASE_URL`, `SESSION_SECRET`,
and at least one provider key (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`,
`GOOGLE_GENERATIVE_AI_API_KEY`, `DEEPSEEK_API_KEY`). Run `npm run db:push` against
the production database once
before first use.

## License

[MIT](./LICENSE) © Feras Al Hallak

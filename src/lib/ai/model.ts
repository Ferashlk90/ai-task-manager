import "server-only";
import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { deepseek } from "@ai-sdk/deepseek";
import { openai } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";
import { getUserRow } from "@/lib/auth/user";

type Provider = "anthropic" | "google" | "deepseek" | "openai";

export interface ModelOption {
  id: string;
  label: string;
  provider: Provider;
}

// Curated allowlist. A single global selection also drives organize/translate,
// so every model here is one that handles structured output (Output.object)
// reliably — that curation is the guardrail against a weak pick breaking the
// brain-dump and English-translation features.
export const MODELS: ModelOption[] = [
  { id: "claude-sonnet-4-6", label: "Claude Sonnet 4.6", provider: "anthropic" },
  { id: "claude-haiku-4-5", label: "Claude Haiku 4.5", provider: "anthropic" },
  { id: "gemini-2.5-flash", label: "Gemini 2.5 Flash", provider: "google" },
  { id: "gemini-2.5-pro", label: "Gemini 2.5 Pro", provider: "google" },
  { id: "gpt-5.2", label: "GPT-5.2", provider: "openai" },
  { id: "gpt-5-mini", label: "GPT-5 Mini", provider: "openai" },
  { id: "deepseek-chat", label: "DeepSeek Chat", provider: "deepseek" },
];

export const DEFAULT_MODEL_ID = "claude-sonnet-4-6";

const ENV_KEY: Record<Provider, string> = {
  anthropic: "ANTHROPIC_API_KEY",
  google: "GOOGLE_GENERATIVE_AI_API_KEY",
  deepseek: "DEEPSEEK_API_KEY",
  openai: "OPENAI_API_KEY",
};

function isConfigured(provider: Provider): boolean {
  return !!process.env[ENV_KEY[provider]];
}

// Models whose provider key is actually set — the only ones safe to offer in
// the UI. Lets a self-hoster who only has, say, a DeepSeek key see just DeepSeek.
export function availableModels(): ModelOption[] {
  return MODELS.filter((m) => isConfigured(m.provider));
}

export function isValidModelId(id: string): boolean {
  return MODELS.some((m) => m.id === id);
}

function instantiate(m: ModelOption): LanguageModel {
  switch (m.provider) {
    case "anthropic":
      return anthropic(m.id);
    case "google":
      return google(m.id);
    case "deepseek":
      return deepseek(m.id);
    case "openai":
      return openai(m.id);
  }
}

// Resolve a model id to a usable model with key-aware fallback, so a missing
// key or a stale/unknown selection never hard-fails: prefer the requested
// model, else the default (when its key is set), else the first configured one.
export function getModel(id?: string | null): LanguageModel {
  const requested = MODELS.find((m) => m.id === id && isConfigured(m.provider));
  if (requested) return instantiate(requested);

  const fallback =
    MODELS.find((m) => m.id === DEFAULT_MODEL_ID && isConfigured(m.provider)) ??
    availableModels()[0] ??
    MODELS.find((m) => m.id === DEFAULT_MODEL_ID)!;
  return instantiate(fallback);
}

// The model for the (single) user's current selection. Used by organize/translate,
// which don't already hold the user row; chat routes pass user.aiModel directly.
export async function getActiveModel(): Promise<LanguageModel> {
  const user = await getUserRow();
  return getModel(user?.aiModel);
}

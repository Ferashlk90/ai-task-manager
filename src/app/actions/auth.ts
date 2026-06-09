"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { verifyTotp } from "@/lib/auth/totp";
import {
  createSession,
  destroySession,
  setPending,
  getPending,
  clearPending,
} from "@/lib/auth/session";
import { headers } from "next/headers";
import { getUserRow } from "@/lib/auth/user";
import { getDictionary } from "@/lib/i18n/server";
import { checkRateLimit, registerFailure, resetLimit } from "@/lib/auth/rate-limit";

export type ActionResult = { ok: true } | { ok: false; error: string };

// A real cost-12 bcrypt hash of a throwaway string. When the submitted email
// doesn't match, we still verify the password against this so a failed login
// takes the same time whether or not the email was correct (no timing oracle).
const DUMMY_HASH =
  "$2b$12$V3A4uUeewCQjihwUuebxZ.1wJSKkZeXGnVdUZ4gsWl0e4xCAawNIO";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

// Per-client key so a brute-forcer throttles themselves without locking the
// real owner out from a different network. Both login steps share the key.
async function loginKey(): Promise<string> {
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim();
  return `login:${ip || "local"}`;
}

// ── First-run setup: set email + password, enroll TOTP ────────────────────
export async function completeSetup(input: {
  email: string;
  password: string;
  secret: string;
  token: string;
}): Promise<ActionResult> {
  const t = (await getDictionary()).setup;
  const email = normalizeEmail(input.email);
  const password = input.password;

  if (!email || !email.includes("@")) {
    return { ok: false, error: t.invalidEmail };
  }
  if (password.length < 8) {
    return { ok: false, error: t.passwordMin };
  }

  const existing = await getUserRow();
  if (existing?.isSetup) {
    return { ok: false, error: t.accountExists };
  }

  const totp = await verifyTotp(input.token, input.secret);
  if (!totp.valid) {
    return { ok: false, error: t.invalidTotp };
  }

  const passwordHash = await hashPassword(password);

  // Seed totpLastStep with the enrollment step so the same code can't be
  // immediately replayed as the first login.
  let userId: string;
  if (existing) {
    await db
      .update(users)
      .set({
        email,
        passwordHash,
        totpSecret: input.secret,
        totpLastStep: totp.step,
        isSetup: true,
      })
      .where(eq(users.id, existing.id));
    userId = existing.id;
  } else {
    const [created] = await db
      .insert(users)
      .values({
        email,
        passwordHash,
        totpSecret: input.secret,
        totpLastStep: totp.step,
        isSetup: true,
      })
      .returning({ id: users.id });
    userId = created.id;
  }

  await createSession(userId);
  return { ok: true };
}

// ── Login step 1: verify password, issue short-lived pending marker ───────
export async function loginStep1(
  email: string,
  password: string,
): Promise<ActionResult> {
  const t = (await getDictionary()).login;
  const key = await loginKey();

  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return {
      ok: false,
      error: t.tooManyAttempts.replace("{sec}", String(limit.retryAfterSec)),
    };
  }

  const user = await getUserRow();
  const normalized = normalizeEmail(email);
  const emailMatches =
    !!user?.isSetup && !!user.passwordHash && user.email === normalized;

  // Always run exactly one bcrypt comparison (dummy hash on no match) so timing
  // doesn't reveal whether the email was right.
  const hash = emailMatches && user?.passwordHash ? user.passwordHash : DUMMY_HASH;
  const passwordOk = await verifyPassword(password, hash);

  if (!user || !emailMatches || !passwordOk) {
    registerFailure(key);
    return { ok: false, error: t.invalidCredentials };
  }

  // Password OK — don't reset yet; TOTP must still pass (step 2).
  await setPending(user.id);
  return { ok: true };
}

// ── Login step 2: verify TOTP against the pending marker, open session ────
export async function loginStep2(token: string): Promise<ActionResult> {
  const t = (await getDictionary()).login;
  const key = await loginKey();

  const limit = checkRateLimit(key);
  if (!limit.ok) {
    return {
      ok: false,
      error: t.tooManyAttempts.replace("{sec}", String(limit.retryAfterSec)),
    };
  }

  const pending = await getPending();
  if (!pending) {
    return { ok: false, error: t.sessionExpired };
  }

  const user = await getUserRow();
  if (!user?.totpSecret || user.id !== pending.userId) {
    registerFailure(key);
    return { ok: false, error: t.verifyFailed };
  }

  const totp = await verifyTotp(token, user.totpSecret);
  if (!totp.valid) {
    registerFailure(key);
    return { ok: false, error: t.invalidCode };
  }

  // Replay guard: reject a code from a time-step already used. Null-guarded so
  // the first login after this feature ships (totpLastStep === null) is accepted.
  if (
    user.totpLastStep != null &&
    totp.step != null &&
    totp.step <= user.totpLastStep
  ) {
    registerFailure(key);
    return { ok: false, error: t.invalidCode };
  }

  await db
    .update(users)
    .set({ totpLastStep: totp.step })
    .where(eq(users.id, user.id));
  await clearPending();
  resetLimit(key);
  await createSession(user.id);
  return { ok: true };
}

export async function logout(): Promise<void> {
  await destroySession();
  redirect("/login");
}

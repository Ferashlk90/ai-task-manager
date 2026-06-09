import "server-only";
import { cookies } from "next/headers";
import {
  SESSION_COOKIE,
  PENDING_COOKIE,
  signToken,
  verifyToken,
  type SessionPayload,
  type PendingPayload,
} from "./jwt";

const SEVEN_DAYS = 60 * 60 * 24 * 7;
const TEN_MINUTES = 60 * 10;

const baseCookie = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

// Full session, set after password + TOTP both pass.
export async function createSession(userId: string): Promise<void> {
  const token = await signToken({ userId, type: "session" }, "7d");
  (await cookies()).set(SESSION_COOKIE, token, {
    ...baseCookie,
    maxAge: SEVEN_DAYS,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifyToken<SessionPayload>(token, "session");
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

// Short-lived marker between the password step and the TOTP step.
export async function setPending(userId: string): Promise<void> {
  const token = await signToken({ userId, type: "pending" }, "10m");
  (await cookies()).set(PENDING_COOKIE, token, {
    ...baseCookie,
    maxAge: TEN_MINUTES,
  });
}

export async function getPending(): Promise<PendingPayload | null> {
  const token = (await cookies()).get(PENDING_COOKIE)?.value;
  return verifyToken<PendingPayload>(token, "pending");
}

export async function clearPending(): Promise<void> {
  (await cookies()).delete(PENDING_COOKIE);
}

// Edge-safe JWT helpers (no next/headers import) so proxy.ts can use them.
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET is not set. Add it to .env.local.");
}
const key = new TextEncoder().encode(secret);

export const SESSION_COOKIE = "ptm_session";
export const PENDING_COOKIE = "ptm_pending";

// The `type` claim binds each token to its cookie role. verifyToken checks it,
// so a pending (password-only) token can't be replayed as a full session — the
// real defense behind the password+TOTP two-step.
export type SessionPayload = { userId: string; type: "session" };
export type PendingPayload = { userId: string; type: "pending" };

export async function signToken(
  payload: Record<string, unknown>,
  expiresIn: string,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(key);
}

export async function verifyToken<T extends { type: string }>(
  token: string | undefined,
  expectedType: T["type"],
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    // Reject a validly-signed token presented in the wrong role (e.g. a pending
    // token copied into the session cookie).
    if (payload.type !== expectedType) return null;
    return payload as T;
  } catch {
    return null;
  }
}

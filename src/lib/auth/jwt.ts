// Edge-safe JWT helpers (no next/headers import) so proxy.ts can use them.
import { SignJWT, jwtVerify } from "jose";

const secret = process.env.SESSION_SECRET;
if (!secret) {
  throw new Error("SESSION_SECRET is not set. Add it to .env.local.");
}
const key = new TextEncoder().encode(secret);

export const SESSION_COOKIE = "ptm_session";
export const PENDING_COOKIE = "ptm_pending";

export type SessionPayload = { userId: string };
export type PendingPayload = { userId: string; step: "totp" };

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

export async function verifyToken<T>(
  token: string | undefined,
): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    return payload as T;
  } catch {
    return null;
  }
}

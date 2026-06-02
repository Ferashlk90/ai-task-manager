import "server-only";

// Lightweight in-memory sliding-window limiter for login attempts.
//
// Scope: a single-user, low-traffic deployment. A sustained brute-force keeps
// one warm Fluid Compute instance, which this reliably throttles. It is NOT a
// distributed limit — instances don't share state and it resets on deploy, so
// pair it with a Vercel Firewall rate-limit rule for network-level protection.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

const WINDOW_MS = 5 * 60_000; // attempts counted over a rolling 5-minute window
const MAX_FAILURES = 5; // block once this many failures land in the window

export type RateLimitResult =
  | { ok: true }
  | { ok: false; retryAfterSec: number };

export function checkRateLimit(key: string): RateLimitResult {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    if (b) buckets.delete(key); // prune expired window
    return { ok: true };
  }
  if (b.count >= MAX_FAILURES) {
    return { ok: false, retryAfterSec: Math.ceil((b.resetAt - now) / 1000) };
  }
  return { ok: true };
}

// Call after a failed attempt (bad password or bad TOTP).
export function registerFailure(key: string): void {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now >= b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
  } else {
    b.count += 1;
  }
}

// Call after a fully successful login to clear the client's window.
export function resetLimit(key: string): void {
  buckets.delete(key);
}

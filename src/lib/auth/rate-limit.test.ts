import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { checkRateLimit, registerFailure, resetLimit } from "./rate-limit";

describe("rate limit (5 failures / 5-minute window)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("allows up to the limit, then blocks", () => {
    const key = "ip-a";
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(key).ok).toBe(true);
      registerFailure(key);
    }
    const result = checkRateLimit(key);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.retryAfterSec).toBeGreaterThan(0);
  });

  it("clears once the window expires", () => {
    const key = "ip-b";
    for (let i = 0; i < 5; i++) registerFailure(key);
    expect(checkRateLimit(key).ok).toBe(false);
    vi.advanceTimersByTime(5 * 60_000 + 1);
    expect(checkRateLimit(key).ok).toBe(true);
  });

  it("resetLimit clears the window immediately", () => {
    const key = "ip-c";
    for (let i = 0; i < 5; i++) registerFailure(key);
    expect(checkRateLimit(key).ok).toBe(false);
    resetLimit(key);
    expect(checkRateLimit(key).ok).toBe(true);
  });
});

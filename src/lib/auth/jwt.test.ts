import { describe, it, expect } from "vitest";
import {
  signToken,
  verifyToken,
  type SessionPayload,
  type PendingPayload,
} from "./jwt";

describe("verifyToken — type binding", () => {
  it("accepts a session token presented as a session", async () => {
    const token = await signToken({ userId: "u1", type: "session" }, "1h");
    const payload = await verifyToken<SessionPayload>(token, "session");
    expect(payload?.userId).toBe("u1");
    expect(payload?.type).toBe("session");
  });

  it("REJECTS a pending token presented as a session (the 2FA bypass)", async () => {
    const pending = await signToken({ userId: "u1", type: "pending" }, "10m");
    const payload = await verifyToken<SessionPayload>(pending, "session");
    expect(payload).toBeNull();
  });

  it("rejects a session token presented as pending", async () => {
    const session = await signToken({ userId: "u1", type: "session" }, "1h");
    const payload = await verifyToken<PendingPayload>(session, "pending");
    expect(payload).toBeNull();
  });

  it("returns null for undefined or malformed tokens", async () => {
    expect(await verifyToken<SessionPayload>(undefined, "session")).toBeNull();
    expect(await verifyToken<SessionPayload>("not-a-jwt", "session")).toBeNull();
  });
});

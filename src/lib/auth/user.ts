import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { DbUser } from "@/lib/db/schema";
import { getSession } from "./session";

// Single-user app: there is at most one row in `users`.
export async function getUserRow(): Promise<DbUser | null> {
  // Order by createdAt so the "one user" is deterministic even if a duplicate
  // row ever slipped in (e.g. a setup race).
  const rows = await db
    .select()
    .from(users)
    .orderBy(asc(users.createdAt))
    .limit(1);
  return rows[0] ?? null;
}

export async function getAuthStatus(): Promise<{
  hasUser: boolean;
  isSetup: boolean;
  email: string | null;
}> {
  const user = await getUserRow();
  return {
    hasUser: !!user,
    isSetup: !!user?.isSetup,
    email: user?.email ?? null,
  };
}

export async function getCurrentUser(): Promise<DbUser | null> {
  const session = await getSession();
  if (!session) return null;
  const rows = await db
    .select()
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);
  return rows[0] ?? null;
}

// Use inside Server Actions / Route Handlers to enforce auth.
export async function requireUser(): Promise<DbUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

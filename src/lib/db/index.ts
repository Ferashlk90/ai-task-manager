import "server-only";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

type Database = ReturnType<typeof create>;

function create() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Add your Neon connection string to .env.local.",
    );
  }
  return drizzle(neon(connectionString), { schema });
}

// Lazy singleton: the connection is created on first query, not at import,
// so `next build` doesn't crash when DATABASE_URL isn't available yet.
let instance: Database | undefined;

export const db = new Proxy({} as Database, {
  get(_target, prop) {
    instance ??= create();
    const value = Reflect.get(instance as object, prop);
    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export { schema };

// Standalone seed script — run with: npm run db:seed
// Uses its own connection (cannot import the server-only db client).
import { config } from "dotenv";
config({ path: ".env.local" });

import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { companies, categories } from "./schema";
import { DEFAULT_COMPANIES, DEFAULT_CATEGORIES } from "../constants";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not set in .env.local");

  const db = drizzle(neon(url));

  const existingCompanies = await db
    .select({ id: companies.id })
    .from(companies)
    .limit(1);
  if (existingCompanies.length === 0) {
    await db.insert(companies).values(
      DEFAULT_COMPANIES.map((c, i) => ({ name: c.name, color: c.color, sortOrder: i })),
    );
    console.log(`Seeded ${DEFAULT_COMPANIES.length} companies.`);
  } else {
    console.log("Companies already exist — skipping.");
  }

  const existingCategories = await db
    .select({ id: categories.id })
    .from(categories)
    .limit(1);
  if (existingCategories.length === 0) {
    await db.insert(categories).values(
      DEFAULT_CATEGORIES.map((c, i) => ({ name: c.name, color: c.color, sortOrder: i })),
    );
    console.log(`Seeded ${DEFAULT_CATEGORIES.length} categories.`);
  } else {
    console.log("Categories already exist — skipping.");
  }
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

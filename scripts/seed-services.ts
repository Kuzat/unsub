#!/usr/bin/env -S tsx
/**
 * Upsert predefined services into the database.
 *
 * USAGE:
 *   pnpm tsx scripts/seed-services.ts
 *
 *   # or with env vars
 *   DATABASE_URL="postgres://user:pass@localhost:5432/app" \
 *     pnpm tsx scripts/seed-services.ts
 */

import "dotenv/config";
import chalk from "chalk";
import { drizzle } from "drizzle-orm/node-postgres";
import pkg from "pg";
import { service } from "@/db/schema/app";
import { seedServices } from "@/db/data/services";
import { randomUUID } from "node:crypto";

const { Client } = pkg;

async function main() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const db = drizzle(client);

  for (const s of seedServices) {
    const id = s.id ?? randomUUID();

    await db
      .insert(service)
      .values({
        id,
        name: s.name,
        category: s.category,
        url: s.url,
        description: s.description,
        scope: "global",
      })

    console.log(
      `${chalk.green("✔")} ${chalk.bold(s.name)} ${chalk.dim(`(${id})`)}`
    );
  }

  await client.end();
  console.log(
    chalk.blueBright(`\n${seedServices.length} services upserted successfully`)
  );
}

main().catch((err) => {
  console.error(chalk.red("Seeding failed:"), err);
  process.exit(1);
});

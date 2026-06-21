#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const files = [
  "drizzle/0001_init.sql",
  "drizzle/0002_site_posts.sql",
  "drizzle/0003_wish_replies.sql",
  "drizzle/0004_likes_viewer_key.sql",
  "drizzle/0005_deliverables_schema_sync.sql",
  "drizzle/0006_wish_cover_url.sql",
];
const client = new pg.Client({ connectionString: databaseUrl, ssl: { rejectUnauthorized: false } });
await client.connect();

for (const file of files) {
  console.log(`→ ${file}`);
  await client.query(readFileSync(join(pkgRoot, file), "utf8"));
}

await client.end();
console.log("✓ migrations done");
#!/usr/bin/env node
/**
 * Remove seed + smoke-test rows from production, keeping the real 万境奇旅 wish/deliverable.
 *
 * Usage: DATABASE_URL=... node packages/db/scripts/cleanup-test-data.mjs
 */
import pg from "pg";

const KEEP_WISH_ID = "8079fc4e-bd2f-485b-b830-b78ef8826889";
const KEEP_SITE_URL = "https://wanjing-qi-lv.vercel.app";
const SEED_USER_EMAILS = [
  "wisher@example.com",
  "agent1@example.com",
  "agent2@example.com",
];

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const client = new pg.Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

async function count(table) {
  const { rows } = await client.query(`select count(*)::int as c from ${table}`);
  return rows[0].c;
}

await client.connect();

console.log("Before:");
for (const table of ["wishes", "wish_replies", "likes", "deliverables", "site_posts", "users"]) {
  console.log(`  ${table}: ${await count(table)}`);
}

await client.query("BEGIN");

await client.query("delete from likes");
await client.query("delete from view_events");
await client.query("delete from site_posts where site_url <> $1", [KEEP_SITE_URL]);
await client.query("delete from wishes where id <> $1", [KEEP_WISH_ID]);
await client.query(
  `delete from agent_profiles
   where user_id in (select id from users where email = any($1::text[]))`,
  [SEED_USER_EMAILS],
);
await client.query("delete from invites");
await client.query("delete from users where email = any($1::text[])", [SEED_USER_EMAILS]);
await client.query(
  "update wishes set view_count = 0, like_count = 0 where id = $1",
  [KEEP_WISH_ID],
);
await client.query(
  "update deliverables set view_count = 0, like_count = 0 where slug = 'wanjing-qi-lv-a1b2'",
);

await client.query("COMMIT");

console.log("\nAfter:");
for (const table of ["wishes", "wish_replies", "likes", "deliverables", "site_posts", "users"]) {
  console.log(`  ${table}: ${await count(table)}`);
}

const kept = await client.query(
  `select w.title, d.slug
   from wishes w
   left join deliverables d on d.wish_id = w.id
   where w.id = $1`,
  [KEEP_WISH_ID],
);
console.log("\nKept:", kept.rows[0]);

await client.end();
console.log("✓ test data cleaned");
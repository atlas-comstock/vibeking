import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

export { schema };
export type Database = ReturnType<typeof createDb>["db"];

let pool: pg.Pool | null = null;
let dbInstance: Database | null = null;

export function createDb(connectionString: string) {
  const client = new pg.Pool({ connectionString });
  const db = drizzle(client, { schema });
  return {
    db,
    close: () => client.end(),
  };
}

export function getDb(): Database {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is required");
  }
  if (!dbInstance) {
    pool = new pg.Pool({ connectionString: url });
    dbInstance = drizzle(pool, { schema });
  }
  return dbInstance;
}

export async function closeDb(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    dbInstance = null;
  }
}
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = dirname(fileURLToPath(import.meta.url));
const migrationSql = readFileSync(join(__dirname, "../drizzle/0001_init.sql"), "utf8");

const EXPECTED_TABLES = [
  "users",
  "agent_profiles",
  "api_keys",
  "wishes",
  "wish_claims",
  "deliverables",
  "deliverable_versions",
  "deliverable_files",
  "likes",
  "view_events",
  "reports",
  "invites",
  "status_events",
  "deliverable_data_records",
];

const EXPECTED_INDEXES = [
  "idx_wish_claims_active",
  "idx_deliverables_wish_agent",
  "idx_view_events_dedupe",
  "idx_wishes_not_deleted",
];

describe("migration smoke test", () => {
  it("defines all core tables", () => {
    for (const table of EXPECTED_TABLES) {
      expect(migrationSql).toMatch(new RegExp(`CREATE TABLE.*"${table}"`, "i"));
    }
  });

  it("defines critical partial and unique indexes", () => {
    for (const index of EXPECTED_INDEXES) {
      expect(migrationSql).toContain(index);
    }
  });

  it("enforces single active claim per wish", () => {
    expect(migrationSql).toMatch(/idx_wish_claims_active.*WHERE.*status.*=.*'active'/s);
  });
});
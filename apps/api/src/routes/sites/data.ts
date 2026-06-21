import { Hono } from "hono";
import { randomUUID } from "node:crypto";
import type { DataRecord } from "@vibeking/shared";
import { store } from "../../data/store.js";
import { corsData } from "../../middleware/cors-data.js";

const DATA_TOKEN = process.env.VIBEKING_DATA_TOKEN ?? "dev-data-token";

const collectionSchemas: Record<string, Record<string, "string" | "number" | "boolean">> = {
  feedback: { rating: "number", comment: "string" },
};

function collectionKey(slug: string, collection: string) {
  return `${slug}:${collection}`;
}

function getCollection(slug: string, collection: string): DataRecord[] {
  const key = collectionKey(slug, collection);
  if (!store.dataCollections.has(key)) {
    store.dataCollections.set(key, new Map());
  }
  const map = store.dataCollections.get(key)!;
  if (!map.has("default")) {
    map.set("default", []);
  }
  return map.get("default")!;
}

function validateRecord(
  collection: string,
  record: Record<string, unknown>,
): string | null {
  const schema = collectionSchemas[collection];
  if (!schema) return "Unknown collection";
  for (const [field, type] of Object.entries(schema)) {
    if (record[field] === undefined) continue;
    if (typeof record[field] !== type) {
      return `Field ${field} must be ${type}`;
    }
  }
  return null;
}

export const sitesDataRoutes = new Hono();

sitesDataRoutes.use("*", corsData);

sitesDataRoutes.get("/:slug/data/:collection", (c) => {
  const { slug, collection } = c.req.param();
  const limit = Math.min(Number(c.req.query("limit") ?? 100), 100);
  const items = getCollection(slug, collection);
  const slice = items.slice(0, limit);
  return c.json({
    items: slice,
    total: items.length,
    limit,
    hasMore: items.length > limit,
  });
});

sitesDataRoutes.get("/:slug/data/:collection/:recordId", (c) => {
  const { slug, collection, recordId } = c.req.param();
  const record = getCollection(slug, collection).find((r) => r.id === recordId);
  if (!record) {
    return c.json({ error: { code: "NOT_FOUND", message: "Record not found" } }, 404);
  }
  return c.json(record);
});

sitesDataRoutes.post("/:slug/data/:collection", async (c) => {
  const token = c.req.header("X-VibeKing-Data-Token");
  if (!token || token !== DATA_TOKEN) {
    return c.json(
      { error: { code: "DATA_TOKEN_REQUIRED", message: "Valid data token required" } },
      403,
    );
  }

  const { slug, collection } = c.req.param();
  const body = (await c.req.json()) as Record<string, unknown>;
  const error = validateRecord(collection, body);
  if (error) {
    return c.json(
      { error: { code: "SCHEMA_VALIDATION_FAILED", message: error } },
      422,
    );
  }

  const items = getCollection(slug, collection);
  if (items.length >= 10_000) {
    return c.json({ error: { code: "RATE_LIMITED", message: "Collection full" } }, 429);
  }

  const record: DataRecord = { id: `rec_${randomUUID().slice(0, 8)}`, ...body };
  items.push(record);
  return c.json(record, 201);
});

sitesDataRoutes.delete("/:slug/data/:collection/:recordId", (c) => {
  const token = c.req.header("X-VibeKing-Data-Token");
  if (!token || token !== DATA_TOKEN) {
    return c.json(
      { error: { code: "DATA_TOKEN_INVALID", message: "Valid data token required" } },
      403,
    );
  }

  const { slug, collection, recordId } = c.req.param();
  const items = getCollection(slug, collection);
  const idx = items.findIndex((r) => r.id === recordId);
  if (idx < 0) {
    return c.json({ error: { code: "NOT_FOUND", message: "Record not found" } }, 404);
  }
  items.splice(idx, 1);
  return c.json({ ok: true });
});
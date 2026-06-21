import { randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { eq, and, isNull, count } from "drizzle-orm";
import {
  ApiKeyScope,
  AppError,
  DEFAULT_USER_KEY_SCOPES,
} from "@vibeking/shared";
import { getDb, apiKeys } from "@vibeking/db";

const MAX_KEYS = 50;

export function generateApiKey(): string {
  return `vk_${randomBytes(24).toString("hex")}`;
}

export async function createApiKey(
  userId: string,
  name: string,
  scopes: ApiKeyScope[] = DEFAULT_USER_KEY_SCOPES,
) {
  const db = getDb();
  const [result] = await db
    .select({ total: count() })
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)));

  if ((result?.total ?? 0) >= MAX_KEYS) {
    throw new AppError("KEY_LIMIT_EXCEEDED", "Maximum API keys reached", 400);
  }

  const rawKey = generateApiKey();
  const keyHash = await bcrypt.hash(rawKey, 10);
  const keySuffix = rawKey.slice(-4);

  const [created] = await db
    .insert(apiKeys)
    .values({
      userId,
      name,
      keyHash,
      keySuffix,
      scopes,
    })
    .returning();

  return {
    id: created!.id,
    name: created!.name,
    key: rawKey,
    keySuffix,
    scopes: created!.scopes as ApiKeyScope[],
    createdAt: created!.createdAt.toISOString(),
  };
}

export async function listApiKeys(userId: string) {
  const db = getDb();
  const keys = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)));

  return keys.map((k) => ({
    id: k.id,
    name: k.name,
    keySuffix: k.keySuffix,
    scopes: k.scopes as ApiKeyScope[],
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt?.toISOString() ?? null,
    current: true,
  }));
}

export async function revokeApiKey(userId: string, keyId: string) {
  const db = getDb();
  const [updated] = await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.id, keyId), eq(apiKeys.userId, userId), isNull(apiKeys.revokedAt)))
    .returning();

  if (!updated) {
    throw new AppError("NOT_FOUND", "API key not found", 404);
  }
}
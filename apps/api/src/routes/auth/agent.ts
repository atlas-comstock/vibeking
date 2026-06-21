import { randomBytes, randomInt } from "node:crypto";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import {
  getDb,
  agentVerificationCodes,
  users,
  agentProfiles,
} from "@vibeking/db";
import {
  DEFAULT_AGENT_KEY_SCOPES,
  UserRole,
} from "@vibeking/shared";
import {
  createSessionToken,
  setSessionCookie,
} from "../../middleware/auth.js";
import { createApiKey } from "../../services/api-key-service.js";
import { validateInviteCode, consumeInviteCode } from "../../services/invite-service.js";

export const agentAuthRoutes = new Hono();

function generateCode(): string {
  return String(randomInt(100000, 999999));
}

function generateHandle(email: string): string {
  const base = email.split("@")[0]!.replace(/[^a-z0-9]/gi, "-").toLowerCase();
  return `${base}-${randomBytes(2).toString("hex")}`;
}

agentAuthRoutes.post("/agent/request-code", async (c) => {
  const body = await c.req.json<{ email: string; inviteCode?: string }>();
  await validateInviteCode(body.inviteCode);

  const code = generateCode();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  const db = getDb();
  await db.insert(agentVerificationCodes).values({
    email: body.email.toLowerCase(),
    code,
    inviteCode: body.inviteCode ?? null,
    expiresAt,
  });

  console.log(`[dev] Agent verification code for ${body.email}: ${code}`);

  return c.json({
    ok: true,
    message: "Verification code sent (dev: logged to console)",
    devCode: process.env.NODE_ENV === "production" ? undefined : code,
  });
});

agentAuthRoutes.post("/agent/verify-code", async (c) => {
  const body = await c.req.json<{ email: string; code: string }>();
  const db = getDb();
  const now = new Date();

  const [record] = await db
    .select()
    .from(agentVerificationCodes)
    .where(eq(agentVerificationCodes.email, body.email.toLowerCase()))
    .limit(1);

  if (
    !record ||
    record.usedAt ||
    record.expiresAt < now ||
    record.code !== body.code
  ) {
    return c.json(
      { error: { code: "UNAUTHORIZED", message: "Invalid or expired code" } },
      401,
    );
  }

  await validateInviteCode(record.inviteCode ?? undefined);

  let [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, body.email.toLowerCase()))
    .limit(1);

  if (!user) {
    [user] = await db
      .insert(users)
      .values({
        email: body.email.toLowerCase(),
        displayName: body.email.split("@")[0]!,
        role: UserRole.AGENT,
      })
      .returning();

    await db.insert(agentProfiles).values({
      userId: user!.id,
      handle: generateHandle(body.email),
    });

    if (record.inviteCode) {
      await consumeInviteCode(record.inviteCode, user!.id);
    }
  }

  await db
    .update(agentVerificationCodes)
    .set({ usedAt: now })
    .where(eq(agentVerificationCodes.id, record.id));

  const apiKey = await createApiKey(user!.id, "default", DEFAULT_AGENT_KEY_SCOPES);
  const sessionToken = await createSessionToken(user!.id);
  setSessionCookie(c, sessionToken);

  return c.json({
    ok: true,
    userId: user!.id,
    apiKey: apiKey.key,
    apiKeyId: apiKey.id,
  });
});
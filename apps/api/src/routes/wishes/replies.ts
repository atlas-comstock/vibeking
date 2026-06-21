import { Hono } from "hono";
import { ApiKeyScope, AppError } from "@vibeking/shared";
import {
  optionalAuth,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { getClientIp, rateLimitAction } from "../../middleware/rate-limit.js";
import { getGuestAuthorId } from "../../lib/guest-user.js";
import { createWishReply, listWishReplies } from "../../services/reply-service.js";

export const replyRoutes = new Hono<AppEnv>();

const ANON_REPLIES_PER_HOUR = 20;
const ANON_REPLIES_PER_DAY = 50;
const AUTH_REPLIES_PER_DAY = 100;

function enforceReplyRateLimit(c: Parameters<typeof getClientIp>[0], hasAuth: boolean) {
  const ip = getClientIp(c);
  if (!hasAuth) {
    if (!rateLimitAction(`replies:anon:hour:${ip}`, ANON_REPLIES_PER_HOUR, 3_600_000)) {
      throw new AppError("RATE_LIMITED", "发太多回复啦，歇一会儿～", 429);
    }
    if (!rateLimitAction(`replies:anon:day:${ip}`, ANON_REPLIES_PER_DAY, 86_400_000)) {
      throw new AppError("RATE_LIMITED", "今天回复次数用完啦，明天再来～", 429);
    }
    return;
  }
  const auth = c.get("auth")!;
  const key =
    auth.authMethod === "session"
      ? `replies:user:${auth.user.id}`
      : `replies:agent:${auth.user.id}`;
  if (!rateLimitAction(key, AUTH_REPLIES_PER_DAY, 86_400_000)) {
    throw new AppError("RATE_LIMITED", "今天回复次数用完啦，明天再来～", 429);
  }
}

replyRoutes.get("/replies", async (c) => {
  try {
    const replies = await listWishReplies(c.req.param("id")!);
    return c.json({ items: replies });
  } catch (err) {
    return handleAppError(c, err);
  }
});

replyRoutes.post("/replies", optionalAuth, async (c) => {
  try {
    const auth = c.get("auth");
    const body = await c.req.json();

    if (auth?.authMethod === "api_key") {
      const hasScope = auth.scopes.includes(ApiKeyScope.USER_WRITE);
      if (!hasScope) {
        return c.json({ error: { code: "FORBIDDEN", message: "Insufficient API key scopes" } }, 403);
      }
    }

    enforceReplyRateLimit(c, Boolean(auth));

    const authorId = auth?.user.id ?? (await getGuestAuthorId());
    const reply = await createWishReply(c.req.param("id")!, authorId, {
      body: body.body,
      nickname: body.nickname,
    });
    return c.json(reply, 201);
  } catch (err) {
    return handleAppError(c, err);
  }
});
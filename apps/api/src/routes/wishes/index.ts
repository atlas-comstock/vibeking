import type { Context } from "hono";
import { Hono } from "hono";
import { ApiKeyScope, AppError, errorResponse } from "@vibeking/shared";
import {
  optionalAuth,
  requireAuth,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import { wishPlatformFlag } from "../../middleware/feature-flags.js";
import {
  createWish,
  listWishes,
  getWishById,
  patchWish,
  deleteWish,
} from "../../services/wish-service.js";
import { computeViewerKey, recordWishView } from "../../services/view-service.js";
import { getCookie } from "hono/cookie";
import { SESSION_COOKIE } from "../../middleware/auth.js";
import { getClientIp, rateLimitAction } from "../../middleware/rate-limit.js";
import { getGuestAuthorId } from "../../lib/guest-user.js";
import { claimRoutes } from "./claim.js";
import { releaseRoutes } from "./release.js";
import { statusRoutes } from "./status.js";
import { acceptRoutes } from "./accept.js";
import { rejectRoutes } from "./reject.js";

export const wishesRoutes = new Hono<AppEnv>();

wishesRoutes.use("*", wishPlatformFlag);

const ANON_WISHES_PER_HOUR = 5;
const ANON_WISHES_PER_DAY = 10;
const AUTH_WISHES_PER_DAY = 20;

function enforceWishCreateRateLimit(c: Context<AppEnv>, hasAuth: boolean) {
  const ip = getClientIp(c);
  if (!hasAuth) {
    if (!rateLimitAction(`wishes:anon:hour:${ip}`, ANON_WISHES_PER_HOUR, 3_600_000)) {
      throw new AppError("RATE_LIMITED", "发太多啦，歇一会儿再许 ✦", 429);
    }
    if (!rateLimitAction(`wishes:anon:day:${ip}`, ANON_WISHES_PER_DAY, 86_400_000)) {
      throw new AppError("RATE_LIMITED", "今天许愿次数用完啦，明天再来～", 429);
    }
    return;
  }
  const auth = c.get("auth")!;
  const key = auth.authMethod === "session" ? `wishes:user:${auth.user.id}` : `wishes:agent:${auth.user.id}`;
  if (!rateLimitAction(key, AUTH_WISHES_PER_DAY, 86_400_000)) {
    throw new AppError("RATE_LIMITED", "今天许愿次数用完啦，明天再来～", 429);
  }
}

wishesRoutes.post("/", optionalAuth, async (c) => {
  try {
    const auth = c.get("auth");
    const body = await c.req.json();

    if (auth?.authMethod === "api_key") {
      const hasScope = auth.scopes.includes(ApiKeyScope.USER_WRITE);
      if (!hasScope) {
        return c.json(errorResponse("FORBIDDEN", "Insufficient API key scopes"), 403);
      }
    }

    enforceWishCreateRateLimit(c, Boolean(auth));

    const authorId = auth?.user.id ?? (await getGuestAuthorId());
    const wish = await createWish(authorId, body);
    return c.json(wish, 201);
  } catch (err) {
    return handleAppError(c, err);
  }
});

wishesRoutes.get("/", optionalAuth, async (c) => {
  try {
    const limit = Math.min(Number(c.req.query("limit") ?? 20), 100);
    const result = await listWishes({
      limit,
      cursor: c.req.query("cursor"),
      status: c.req.query("status") ?? "open",
      tag: c.req.query("tag"),
      sort: c.req.query("sort") ?? "created_at_desc",
    });
    return c.json(result);
  } catch (err) {
    if (err instanceof Error && err.message === "INVALID_CURSOR") {
      return handleAppError(c, new AppError("INVALID_CURSOR", "Invalid pagination cursor", 400));
    }
    return handleAppError(c, err);
  }
});

wishesRoutes.get("/:id", optionalAuth, async (c) => {
  try {
    const wishId = c.req.param("id")!;
    const wish = await getWishById(wishId);
    const sessionToken = getCookie(c, SESSION_COOKIE);
    const viewerKey = computeViewerKey(c, sessionToken);
    await recordWishView(wishId, viewerKey);
    return c.json(wish);
  } catch (err) {
    return handleAppError(c, err);
  }
});

wishesRoutes.patch("/:id", requireAuth, async (c) => {
  try {
    const auth = c.get("auth")!;
    const body = await c.req.json();
    const wish = await patchWish(c.req.param("id")!, auth.user.id, body);
    return c.json(wish);
  } catch (err) {
    return handleAppError(c, err);
  }
});

wishesRoutes.delete("/:id", requireAuth, async (c) => {
  try {
    const auth = c.get("auth")!;
    await deleteWish(c.req.param("id")!, auth.user.id);
    return c.json({ ok: true });
  } catch (err) {
    return handleAppError(c, err);
  }
});

wishesRoutes.route("/:id", claimRoutes);
wishesRoutes.route("/:id", releaseRoutes);
wishesRoutes.route("/:id", statusRoutes);
wishesRoutes.route("/:id", acceptRoutes);
wishesRoutes.route("/:id", rejectRoutes);
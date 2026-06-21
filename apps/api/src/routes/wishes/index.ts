import { Hono } from "hono";
import { ApiKeyScope, AppError } from "@vibeking/shared";
import {
  optionalAuth,
  requireAuth,
  requireScopes,
  requireSession,
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
import { claimRoutes } from "./claim.js";
import { releaseRoutes } from "./release.js";
import { statusRoutes } from "./status.js";
import { acceptRoutes } from "./accept.js";
import { rejectRoutes } from "./reject.js";

export const wishesRoutes = new Hono<AppEnv>();

wishesRoutes.use("*", wishPlatformFlag);

wishesRoutes.post(
  "/",
  requireScopes(ApiKeyScope.USER_WRITE),
  async (c) => {
    try {
      const auth = c.get("auth")!;
      const body = await c.req.json();
      const wish = await createWish(auth.user.id, body);
      return c.json(wish, 201);
    } catch (err) {
      return handleAppError(c, err);
    }
  },
);

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
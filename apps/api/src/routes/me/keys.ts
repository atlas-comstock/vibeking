import { Hono } from "hono";
import { ApiKeyScope } from "@vibeking/shared";
import {
  requireSession,
  handleAppError,
  type AppEnv,
} from "../../middleware/auth.js";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "../../services/api-key-service.js";

export const keysRoutes = new Hono<AppEnv>();

keysRoutes.post("/", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    const body = await c.req.json<{ name: string; scopes?: ApiKeyScope[] }>();
    const key = await createApiKey(auth.user.id, body.name, body.scopes);
    return c.json(key, 201);
  } catch (err) {
    return handleAppError(c, err);
  }
});

keysRoutes.get("/", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    const keys = await listApiKeys(auth.user.id);
    return c.json({ keys });
  } catch (err) {
    return handleAppError(c, err);
  }
});

keysRoutes.delete("/:id", requireSession, async (c) => {
  try {
    const auth = c.get("auth")!;
    await revokeApiKey(auth.user.id, c.req.param("id")!);
    return c.json({ ok: true });
  } catch (err) {
    return handleAppError(c, err);
  }
});
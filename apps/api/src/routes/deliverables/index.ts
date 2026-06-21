import { Hono } from "hono";
import type { AppEnv } from "../../middleware/auth.js";
import { blocklistMiddleware } from "../../middleware/blocklist.js";
import { publishRoute } from "./publish.js";
import { finalizeRoute } from "./finalize.js";
import { getRoute } from "./get.js";
import { updateRoute } from "./update.js";
import { metadataRoute } from "./metadata.js";
import { deleteRoute } from "./delete.js";

export const deliverablesRouter = new Hono<AppEnv>();

deliverablesRouter.route("/", publishRoute);
deliverablesRouter.use("/:slug", blocklistMiddleware);
deliverablesRouter.route("/", finalizeRoute);
deliverablesRouter.route("/", getRoute);
deliverablesRouter.route("/", updateRoute);
deliverablesRouter.route("/", metadataRoute);
deliverablesRouter.route("/", deleteRoute);
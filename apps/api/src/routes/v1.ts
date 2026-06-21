import { Hono } from "hono";
import { PLATFORM_NAME } from "@vibeking/shared";
import { authRoutes } from "./auth/index.js";
import { meRoutes } from "./me/index.js";
import { wishesRoutes } from "./wishes/index.js";
import { deliverablesRouter } from "./deliverables/index.js";
import { likesRouter } from "./likes.js";
import { discoveryRouter } from "./discovery/index.js";
import { reportsRouter } from "./reports.js";
import { agentsRoutes } from "./agents/index.js";
import { sitesDataRoutes } from "./sites/data.js";
import { feedRouter } from "./feed.js";
import { hereNowRouter } from "./here-now/index.js";
import type { AppEnv } from "../middleware/auth.js";

export const v1Routes = new Hono<AppEnv>();

v1Routes.get("/", (c) =>
  c.json({
    name: PLATFORM_NAME,
    version: "0.1.0",
    message: "VibeKing Wish Platform API",
  }),
);

v1Routes.route("/auth", authRoutes);
v1Routes.route("/me", meRoutes);
v1Routes.route("/wishes", wishesRoutes);
v1Routes.route("/deliverables", deliverablesRouter);
v1Routes.route("/likes", likesRouter);
v1Routes.route("/discovery", discoveryRouter);
v1Routes.route("/reports", reportsRouter);
v1Routes.route("/agents", agentsRoutes);
v1Routes.route("/sites", sitesDataRoutes);
v1Routes.route("/feed", feedRouter);
v1Routes.route("/here-now", hereNowRouter);
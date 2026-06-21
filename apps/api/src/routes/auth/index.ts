import { Hono } from "hono";
import { githubRoutes } from "./github.js";
import { magicLinkRoutes } from "./magic-link.js";
import { agentAuthRoutes } from "./agent.js";
import { logoutRoute } from "./logout.js";

export const authRoutes = new Hono();

authRoutes.route("/", githubRoutes);
authRoutes.route("/", magicLinkRoutes);
authRoutes.route("/", agentAuthRoutes);
authRoutes.route("/", logoutRoute);
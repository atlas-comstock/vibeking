import { Hono } from "hono";
import { validateInviteCode } from "../../services/invite-service.js";

export const githubRoutes = new Hono();

githubRoutes.get("/github", async (c) => {
  try {
    const inviteCode = c.req.query("inviteCode");
    await validateInviteCode(inviteCode);

    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return c.redirect("/api/v1/auth/github/stub?message=oauth_not_configured");
    }

    const redirectUri = process.env.GITHUB_CALLBACK_URL ?? "http://localhost:3001/api/v1/auth/github/callback";
    const state = inviteCode ? `invite:${inviteCode}` : "default";
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=user:email&state=${encodeURIComponent(state)}`;
    return c.redirect(url);
  } catch (err) {
    return c.json({ error: { code: "INVITE_REQUIRED", message: String(err) } }, 403);
  }
});

githubRoutes.get("/github/callback", async (c) => {
  return c.json({
    message: "GitHub OAuth callback stub — configure GITHUB_CLIENT_ID for production",
    code: c.req.query("code"),
    state: c.req.query("state"),
  });
});

githubRoutes.get("/github/stub", (c) => {
  return c.json({
    message: c.req.query("message") ?? "GitHub OAuth stub",
    hint: "Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET for real OAuth",
  });
});
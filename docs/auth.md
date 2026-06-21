# VibeKing Web Session Auth

## Overview

The web app uses a **BFF (Backend-for-Frontend)** pattern against the Hono API at `/api/v1`. Human users authenticate via GitHub OAuth or magic link; the API issues session cookies that the Next.js app mirrors on the web origin for server-side fetches.

## Cookies

| Cookie | Domain | Flags | Purpose |
|--------|--------|-------|---------|
| `vk_session` | Web + API | `HttpOnly; Secure; SameSite=Lax` | Opaque session ID referencing API session store |
| `vk_csrf` | Web | `Secure; SameSite=Lax` (not HttpOnly) | CSRF double-submit token for mutating routes |

## Flow

### GitHub OAuth (dev stub)

1. User visits `/login` and clicks **GitHub 登录**.
2. Browser redirects to `GET /api/v1/auth/github?redirect=/dashboard`.
3. API creates a session and redirects to `/auth/callback?session={id}&redirect=...` on the web origin.
4. `apps/web/app/auth/callback/route.ts` sets `vk_session` + `vk_csrf` on the web response and redirects to the target path.

### Magic link

1. `POST /api/v1/auth/magic-link/request` sends email (stub in dev).
2. `POST /api/v1/auth/magic-link/verify` validates token and returns `{ sessionId }`.
3. Web callback route sets cookies (production) or client receives API `Set-Cookie` when same-site.

### Session validation

- **Middleware** (`apps/web/middleware.ts`): for `/wishes/new` and `/dashboard`, checks `vk_session` and validates via `GET /api/v1/me`.
- **Server components** use `getSession()` from `apps/web/lib/session.ts`, forwarding `Cookie` to the API.

## Protected routes

| Path | Guard |
|------|-------|
| `/wishes/new` | Middleware + `requireUser()` |
| `/dashboard` | Middleware + `requireUser()` |

## CSRF

Mutating server actions and `/app/api/*` BFF routes forward `X-CSRF-Token` from the `vk_csrf` cookie. API validates on session-only mutations (accept/reject, key management).

## Logout

`POST /api/v1/auth/logout` clears the API session. Web should delete `vk_session` and `vk_csrf` cookies on the web origin.

## Environment

| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:3001/api/v1` | API base for web fetches |
| `WEB_ORIGIN` | `http://localhost:6000` | OAuth callback target (API) |

## Agent API keys

Programmatic access uses `vk_*` API keys (not browser sessions). Keys are managed in `/dashboard` via `GET/POST/DELETE /api/v1/me/keys`. Full key is shown **once** on create.
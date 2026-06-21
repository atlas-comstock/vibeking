# Deployment Guide

## Local development

```bash
docker compose -f infra/docker-compose.yml up -d
cp .env.example .env
pnpm install
psql $DATABASE_URL -f packages/db/drizzle/0001_init.sql
pnpm --filter @vibeking/db db:seed
pnpm dev
```

## Staging (Fly.io + Cloudflare)

| Service | Host |
|---------|------|
| API | `api.staging.vibeking.dev` |
| Web | `staging.vibeking.dev` |
| Worker | `*.staging.vibeking.dev` |
| Preview | `preview.staging.vibeking.dev` |

### Required secrets

| Secret | Used by |
|--------|---------|
| `FLY_API_TOKEN` | GitHub Actions deploy |
| `CF_API_TOKEN` | Worker deploy + KV sync |
| `CF_ACCOUNT_ID` | KV sync |
| `CF_KV_NAMESPACE_ID` | Worker + KV sync |
| `DATABASE_URL` | Fly API app |
| `SESSION_SECRET` | Fly API app |
| `S3_*` / R2 credentials | Fly API app |

### Deploy

```bash
# Manual
flyctl deploy --config infra/fly/api.toml
flyctl deploy --config infra/fly/web.toml
cd apps/worker && pnpm exec wrangler deploy

# CI
gh workflow run deploy-staging.yml
```

### Smoke test

```bash
chmod +x scripts/smoke-staging.sh
API_URL=https://api.staging.vibeking.dev ./scripts/smoke-staging.sh
```

## Production

Production deploy is gated via `deploy-prod.yml` (workflow_dispatch, `production` environment).
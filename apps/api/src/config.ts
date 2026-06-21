import { parseSlugBlocklist } from "@vibeking/publish";

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  redisUrl: process.env.REDIS_URL,
  siteBaseDomain: process.env.SITE_BASE_DOMAIN ?? "vibeking.dev",
  apiBaseUrl: process.env.API_BASE_URL ?? "http://localhost:3001",
  slugBlocklist: parseSlugBlocklist(process.env.SLUG_BLOCKLIST),
  s3: {
    endpoint: process.env.S3_ENDPOINT,
    region: process.env.S3_REGION ?? "us-east-1",
    bucket: process.env.S3_BUCKET ?? "vibeking",
    accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "vibeking",
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "vibeking-dev",
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
  },
  testMode: process.env.NODE_ENV === "test" || process.env.VITEST === "true",
};
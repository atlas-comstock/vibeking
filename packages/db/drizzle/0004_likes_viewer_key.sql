ALTER TABLE "likes" ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "likes" ADD COLUMN IF NOT EXISTS "viewer_key" varchar(64);

CREATE UNIQUE INDEX IF NOT EXISTS "idx_likes_viewer_target"
  ON "likes" ("viewer_key", "target_type", "target_id")
  WHERE "viewer_key" IS NOT NULL;
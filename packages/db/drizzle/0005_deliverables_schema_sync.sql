ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "spa_mode" boolean DEFAULT false NOT NULL;
ALTER TABLE "deliverables" ADD COLUMN IF NOT EXISTS "updated_at" timestamptz DEFAULT now() NOT NULL;
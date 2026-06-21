import { serve } from "@hono/node-server";
import cron from "node-cron";
import { app } from "./app.js";
import { config } from "./config.js";
import { startClaimSweeper } from "./jobs/claim-sweeper.js";
import { scheduleTrending } from "./jobs/trending.js";
import { scheduleUploadGc } from "./jobs/upload-gc.js";
import { scheduleKvReconciler } from "./jobs/kv-reconciler.js";
import { initTelemetry } from "./middleware/otel.js";

const port = Number(process.env.PORT ?? 3001);

initTelemetry();

if (!config.testMode) {
  startClaimSweeper();
  scheduleTrending(cron);
  scheduleUploadGc(cron);
  scheduleKvReconciler(cron);
}

serve({ fetch: app.fetch, port }, (info) => {
  console.log(`API listening on http://localhost:${info.port}`);
});
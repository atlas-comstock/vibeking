import cron from "node-cron";
import { sweepInactiveClaims } from "../services/claim-service.js";

let started = false;

export function startClaimSweeper() {
  if (started || process.env.NODE_ENV === "test") return;
  started = true;

  cron.schedule("0 * * * *", async () => {
    try {
      const expired = await sweepInactiveClaims();
      if (expired > 0) {
        console.log(`[claim-sweeper] Expired ${expired} inactive claims`);
      }
    } catch (err) {
      console.error("[claim-sweeper] Error:", err);
    }
  });

  console.log("[claim-sweeper] Scheduled hourly inactivity sweep");
}
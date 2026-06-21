import { refreshTrendingCache } from "../services/trending-service.js";
import { getCache } from "../lib/cache.js";

const cache = getCache();

async function tryAcquireLeader(jobName: string, ttlSeconds: number): Promise<boolean> {
  const key = `job:${jobName}:leader`;
  const existing = await cache.get(key);
  if (existing) return false;
  await cache.set(key, "1", ttlSeconds);
  return true;
}

export async function runTrendingJob(): Promise<void> {
  const isLeader = await tryAcquireLeader("trending", 120);
  if (!isLeader) return;
  await refreshTrendingCache();
}

export function scheduleTrending(cron: { schedule: (expr: string, fn: () => void) => void }) {
  cron.schedule("*/5 * * * *", () => {
    void runTrendingJob().then(() => {
      console.log("[trending] cache refreshed");
    });
  });
}
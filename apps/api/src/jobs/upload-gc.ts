import { abandonExpiredUploads } from "../services/deliverable-service.js";

export async function runUploadGc(): Promise<number> {
  return abandonExpiredUploads();
}

export function scheduleUploadGc(cron: { schedule: (expr: string, fn: () => void) => void }) {
  cron.schedule("0 3 * * *", () => {
    void runUploadGc().then((count) => {
      console.log(`[upload-gc] abandoned ${count} expired uploads`);
    });
  });
}
import { Hono } from "hono";

export const metricsRoutes = new Hono();

metricsRoutes.get("/", (c) => {
  const lines = [
    "# HELP vibeking_up API process is up",
    "# TYPE vibeking_up gauge",
    "vibeking_up 1",
  ];
  return c.text(lines.join("\n") + "\n", 200, {
    "Content-Type": "text/plain; version=0.0.4",
  });
});
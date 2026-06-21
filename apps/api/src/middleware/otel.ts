/** OpenTelemetry stub — wire @opentelemetry/sdk-node in production (PR 18). */
export function initTelemetry(): void {
  if (process.env.OTEL_ENABLED === "true") {
    console.log(JSON.stringify({ level: "info", msg: "otel stub: enable @opentelemetry/sdk-node" }));
  }
}
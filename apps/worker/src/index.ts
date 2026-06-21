import { serveStaticRequest } from "./serve.js";

export type WorkerEnv = {
  R2: import("./serve.js").R2Bucket;
  SLUG_META?: import("./serve.js").KvNamespace;
  SITE_BASE_DOMAIN?: string;
};

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    if (request.method !== "GET" && request.method !== "HEAD") {
      return new Response("Method not allowed", { status: 405 });
    }
    return serveStaticRequest(request, env);
  },
};

export { serveStaticRequest } from "./serve.js";
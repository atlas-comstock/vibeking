import type {
  HereNowFinalizeResponse,
  HereNowPublishRequest,
  HereNowPublishResponse,
} from "./types.js";

const DEFAULT_BASE = "https://here.now";

export type HereNowClientConfig = {
  apiKey?: string;
  baseUrl?: string;
  clientHeader?: string;
};

export class HereNowClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly clientHeader: string;

  constructor(config: HereNowClientConfig = {}) {
    this.baseUrl = config.baseUrl ?? process.env.HERENOW_BASE_URL ?? DEFAULT_BASE;
    this.apiKey = config.apiKey ?? process.env.HERENOW_API_KEY;
    this.clientHeader = config.clientHeader ?? "vibeking/skill";
  }

  private headers(json = true): Record<string, string> {
    const h: Record<string, string> = {
      "X-HereNow-Client": this.clientHeader,
    };
    if (json) h["Content-Type"] = "application/json";
    if (this.apiKey) h.Authorization = `Bearer ${this.apiKey}`;
    return h;
  }

  async publish(body: HereNowPublishRequest): Promise<HereNowPublishResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/publish`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`here.now publish failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<HereNowPublishResponse>;
  }

  async uploadFile(presigned: { url: string; headers: Record<string, string> }, data: Buffer | Uint8Array): Promise<void> {
    const res = await fetch(presigned.url, {
      method: "PUT",
      headers: presigned.headers,
      body: data,
    });
    if (!res.ok) {
      throw new Error(`here.now upload failed (${res.status}) for ${presigned.url}`);
    }
  }

  async finalize(finalizeUrl: string, versionId: string): Promise<HereNowFinalizeResponse> {
    const res = await fetch(finalizeUrl, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify({ versionId }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`here.now finalize failed (${res.status}): ${text}`);
    }
    return res.json() as Promise<HereNowFinalizeResponse>;
  }
}
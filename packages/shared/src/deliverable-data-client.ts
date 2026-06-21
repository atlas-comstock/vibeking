import type { DataListResponse, DataRecord } from "./types.js";

export type DeliverableDataClientOptions = {
  slug: string;
  apiBaseUrl?: string;
  dataToken?: string;
};

const DEFAULT_API_BASE = "https://api.vibeking.dev/api/v1";

export class DeliverableDataClient {
  private readonly baseUrl: string;
  private readonly slug: string;
  private readonly dataToken?: string;

  constructor(options: DeliverableDataClientOptions) {
    this.slug = options.slug;
    this.baseUrl = (options.apiBaseUrl ?? DEFAULT_API_BASE).replace(/\/$/, "");
    this.dataToken = options.dataToken;
  }

  private collectionUrl(collection: string, recordId?: string): string {
    const path = `/sites/${this.slug}/data/${collection}`;
    return recordId ? `${this.baseUrl}${path}/${recordId}` : `${this.baseUrl}${path}`;
  }

  private headers(method: "GET" | "POST" | "DELETE"): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (method !== "GET") {
      headers["Content-Type"] = "application/json";
    }
    if (this.dataToken) {
      headers["X-VibeKing-Data-Token"] = this.dataToken;
    }
    return headers;
  }

  async list(collection: string, limit = 100): Promise<DataListResponse> {
    const url = new URL(this.collectionUrl(collection));
    url.searchParams.set("limit", String(limit));
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: this.headers("GET"),
    });
    if (!res.ok) {
      throw await this.parseError(res);
    }
    return res.json() as Promise<DataListResponse>;
  }

  async get(collection: string, recordId: string): Promise<DataRecord> {
    const res = await fetch(this.collectionUrl(collection, recordId), {
      method: "GET",
      headers: this.headers("GET"),
    });
    if (!res.ok) {
      throw await this.parseError(res);
    }
    return res.json() as Promise<DataRecord>;
  }

  async append(collection: string, record: Record<string, unknown>): Promise<DataRecord> {
    const res = await fetch(this.collectionUrl(collection), {
      method: "POST",
      headers: this.headers("POST"),
      body: JSON.stringify(record),
    });
    if (!res.ok) {
      throw await this.parseError(res);
    }
    return res.json() as Promise<DataRecord>;
  }

  async remove(collection: string, recordId: string): Promise<void> {
    const res = await fetch(this.collectionUrl(collection, recordId), {
      method: "DELETE",
      headers: this.headers("DELETE"),
    });
    if (!res.ok) {
      throw await this.parseError(res);
    }
  }

  private async parseError(res: Response): Promise<Error> {
    try {
      const body = (await res.json()) as { error?: { code?: string; message?: string } };
      const code = body.error?.code ?? "UNKNOWN";
      const message = body.error?.message ?? res.statusText;
      return new Error(`${code}: ${message}`);
    } catch {
      return new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
  }
}

export function createDeliverableDataClient(
  options: DeliverableDataClientOptions,
): DeliverableDataClient {
  return new DeliverableDataClient(options);
}
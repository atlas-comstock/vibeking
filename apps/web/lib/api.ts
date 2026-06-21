import type {
  ApiError,
  ApiKey,
  ApiKeyCreated,
  ApiKeyScope,
  DeliverableDetail,
  DeliverableSummary,
  LikeToggleResult,
  PaginatedResponse,
  TrendingResponse,
  User,
  Wish,
} from "@vibeking/shared";
import { API_BASE_URL, CSRF_COOKIE, SESSION_COOKIE } from "./config";

export class ApiClientError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}

type FetchOptions = {
  method?: string;
  body?: unknown;
  cookieHeader?: string;
  csrfToken?: string;
  clientIp?: string;
  cache?: RequestCache;
};

async function apiFetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (options.cookieHeader) {
    headers.Cookie = options.cookieHeader;
  }

  if (options.csrfToken) {
    headers["X-CSRF-Token"] = options.csrfToken;
  }

  if (options.clientIp) {
    headers["X-Forwarded-For"] = options.clientIp;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method ?? (options.body !== undefined ? "POST" : "GET"),
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    cache: options.cache ?? "no-store",
    credentials: "include",
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as ApiError;
    throw new ApiClientError(
      err.error?.code ?? "UNKNOWN",
      err.error?.message ?? res.statusText,
      res.status,
    );
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export function buildCookieHeader(
  sessionId?: string,
  csrfToken?: string,
): string | undefined {
  const parts: string[] = [];
  if (sessionId) parts.push(`${SESSION_COOKIE}=${sessionId}`);
  if (csrfToken) parts.push(`${CSRF_COOKIE}=${csrfToken}`);
  return parts.length > 0 ? parts.join("; ") : undefined;
}

export const api = {
  getMe(cookieHeader?: string) {
    return apiFetch<User>("/me", { cookieHeader });
  },

  getWishes(params?: {
    status?: string;
    tag?: string;
    authorId?: string;
    limit?: number;
    cursor?: string;
  }) {
    const search = new URLSearchParams();
    if (params?.status) search.set("status", params.status);
    if (params?.tag) search.set("tag", params.tag);
    if (params?.authorId) search.set("authorId", params.authorId);
    if (params?.limit) search.set("limit", String(params.limit));
    if (params?.cursor) search.set("cursor", params.cursor);
    const qs = search.toString();
    return apiFetch<PaginatedResponse<Wish>>(`/wishes${qs ? `?${qs}` : ""}`);
  },

  getWish(id: string) {
    return apiFetch<Wish>(`/wishes/${id}`);
  },

  createWish(
    body: {
      title: string;
      description: string;
      tags: string[];
      budgetCents?: number | null;
      budgetCurrency?: string;
      deadline?: string | null;
    },
    opts?: { cookieHeader?: string; csrfToken?: string; clientIp?: string },
  ) {
    return apiFetch<Wish>("/wishes", {
      method: "POST",
      body,
      cookieHeader: opts?.cookieHeader,
      csrfToken: opts?.csrfToken,
      clientIp: opts?.clientIp,
    });
  },

  acceptWish(id: string, cookieHeader?: string, csrfToken?: string) {
    return apiFetch<Wish>(`/wishes/${id}/accept`, {
      method: "POST",
      cookieHeader,
      csrfToken,
    });
  },

  rejectWish(
    id: string,
    reason: string | undefined,
    cookieHeader?: string,
    csrfToken?: string,
  ) {
    return apiFetch<Wish>(`/wishes/${id}/reject`, {
      method: "POST",
      body: { reason },
      cookieHeader,
      csrfToken,
    });
  },

  getFeed(limit = 24, locale: "zh" | "en" = "zh") {
    return apiFetch<{
      items: Array<{
        type: "site_post" | "deliverable" | "wish";
        id: string;
        title: string;
        description?: string;
        siteUrl?: string;
        slug?: string;
        coverEmoji?: string;
        tags: string[];
        source?: string;
        likeCount: number;
        viewCount: number;
        createdAt: string;
        href: string;
        score?: number;
      }>;
    }>(`/feed?limit=${limit}&locale=${locale}`, { cache: "no-store" });
  },

  getTrendingWishes(limit = 6) {
    return apiFetch<TrendingResponse<Wish>>(`/discovery/trending?type=wishes&limit=${limit}`, {
      cache: "force-cache",
    });
  },

  getTrendingDeliverables(limit = 6) {
    return apiFetch<TrendingResponse<DeliverableSummary>>(
      `/discovery/trending?type=deliverables&limit=${limit}`,
      { cache: "force-cache" },
    );
  },

  getTags() {
    return apiFetch<{ tags: Array<{ tag: string; count: number }> }>("/discovery/tags");
  },

  getDeliverable(slug: string) {
    return apiFetch<DeliverableDetail>(`/deliverables/${slug}`);
  },

  getAgent(handle: string) {
    return apiFetch<{
      user: { id: string; displayName: string; role: string; createdAt: string };
      profile: {
        handle: string;
        bio?: string;
        completedWishesCount: number;
        liveDeliverablesCount: number;
      };
      recentWishes: Wish[];
      liveDeliverables: DeliverableSummary[];
    }>(`/agents/${handle}`);
  },

  getApiKeys(cookieHeader?: string) {
    return apiFetch<{ keys: ApiKey[] }>("/me/keys", { cookieHeader });
  },

  createApiKey(
    body: { name: string; scopes: ApiKeyScope[] },
    cookieHeader?: string,
    csrfToken?: string,
  ) {
    return apiFetch<ApiKeyCreated>("/me/keys", {
      method: "POST",
      body,
      cookieHeader,
      csrfToken,
    });
  },

  revokeApiKey(id: string, cookieHeader?: string, csrfToken?: string) {
    return apiFetch<{ ok: boolean }>(`/me/keys/${id}`, {
      method: "DELETE",
      cookieHeader,
      csrfToken,
    });
  },

  toggleLike(
    body: { targetType: "wish" | "deliverable"; targetId: string },
    cookieHeader?: string,
    csrfToken?: string,
  ) {
    return apiFetch<LikeToggleResult>("/likes", {
      method: "POST",
      body,
      cookieHeader,
      csrfToken,
    });
  },

  logout(cookieHeader?: string) {
    return apiFetch<{ ok: boolean }>("/auth/logout", { method: "POST", cookieHeader });
  },
};
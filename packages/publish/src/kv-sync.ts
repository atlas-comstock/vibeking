import type { SlugMeta } from "./types.js";

export type KvSyncConfig = {
  accountId?: string;
  namespaceId?: string;
  apiToken?: string;
};

export type KvSyncResult = {
  synced: boolean;
  skipped: boolean;
  error?: string;
};

export async function syncSlugToKv(
  slug: string,
  meta: SlugMeta,
  config: KvSyncConfig = {},
): Promise<KvSyncResult> {
  const accountId = config.accountId ?? process.env.CF_ACCOUNT_ID;
  const namespaceId = config.namespaceId ?? process.env.CF_KV_NAMESPACE_ID;
  const apiToken = config.apiToken ?? process.env.CF_API_TOKEN;

  if (!accountId || !namespaceId || !apiToken) {
    return { synced: false, skipped: true };
  }

  const key = encodeURIComponent(`slug:${slug}`);
  const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}/values/${key}`;

  try {
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(meta),
    });

    if (!response.ok) {
      const text = await response.text();
      return {
        synced: false,
        skipped: false,
        error: `KV sync failed (${response.status}): ${text}`,
      };
    }

    return { synced: true, skipped: false };
  } catch (error) {
    return {
      synced: false,
      skipped: false,
      error: error instanceof Error ? error.message : "KV sync failed",
    };
  }
}
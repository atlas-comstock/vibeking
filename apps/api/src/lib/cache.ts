type CacheEntry = {
  value: string;
  expiresAt: number;
};

export class MemoryCache {
  private store = new Map<string, CacheEntry>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async zadd(key: string, score: number, member: string): Promise<void> {
    const current = this.store.get(key);
    const parsed: Array<{ member: string; score: number }> = current
      ? (JSON.parse(current.value) as Array<{ member: string; score: number }>)
      : [];
    const idx = parsed.findIndex((e) => e.member === member);
    if (idx >= 0) parsed[idx] = { member, score };
    else parsed.push({ member, score });
    parsed.sort((a, b) => b.score - a.score);
    await this.set(key, JSON.stringify(parsed), 3600);
  }

  async zrevrange(key: string, start: number, stop: number): Promise<string[]> {
    const raw = await this.get(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<{ member: string; score: number }>;
    return parsed.slice(start, stop + 1).map((e) => e.member);
  }
}

let cacheInstance: MemoryCache | null = null;

export function getCache(): MemoryCache {
  if (!cacheInstance) {
    cacheInstance = new MemoryCache();
  }
  return cacheInstance;
}
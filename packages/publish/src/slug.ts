import { randomBytes } from "node:crypto";
import { ulid } from "ulid";

const ADJECTIVES = [
  "bright",
  "calm",
  "clever",
  "crisp",
  "gentle",
  "lucky",
  "quiet",
  "swift",
  "vivid",
  "warm",
];

const NOUNS = [
  "canvas",
  "harbor",
  "meadow",
  "orbit",
  "pixel",
  "river",
  "spark",
  "summit",
  "valley",
  "wave",
];

export const RESERVED_SLUGS = new Set([
  "api",
  "www",
  "preview",
  "staging",
  "admin",
  "assets",
]);

export function parseSlugBlocklist(envValue?: string): Set<string> {
  const blocklist = new Set(RESERVED_SLUGS);
  if (!envValue) return blocklist;
  for (const entry of envValue.split(",")) {
    const trimmed = entry.trim().toLowerCase();
    if (trimmed) blocklist.add(trimmed);
  }
  return blocklist;
}

export function isSlugBlocked(slug: string, blocklist: Set<string>): boolean {
  return blocklist.has(slug.toLowerCase());
}

export function generateSlugCandidate(): string {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]!;
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)]!;
  const suffix = randomBytes(2).toString("hex");
  return `${adjective}-${noun}-${suffix}`;
}

export function generateSlug(
  isTaken: (slug: string) => boolean | Promise<boolean>,
  blocklist: Set<string> = RESERVED_SLUGS,
  maxRetries = 5,
): Promise<string> {
  return generateSlugInternal(isTaken, blocklist, maxRetries, 0);
}

async function generateSlugInternal(
  isTaken: (slug: string) => boolean | Promise<boolean>,
  blocklist: Set<string>,
  maxRetries: number,
  attempt: number,
): Promise<string> {
  if (attempt >= maxRetries) {
    return `site-${ulid().toLowerCase().slice(0, 8)}`;
  }

  const candidate = generateSlugCandidate();
  if (
    candidate.length < 8 ||
    candidate.length > 32 ||
    isSlugBlocked(candidate, blocklist) ||
    (await isTaken(candidate))
  ) {
    return generateSlugInternal(isTaken, blocklist, maxRetries, attempt + 1);
  }
  return candidate;
}

export function buildSiteUrl(slug: string, baseDomain?: string): string {
  const domain = baseDomain ?? process.env.SITE_BASE_DOMAIN ?? "vibeking.dev";
  const protocol = domain.includes("localhost") ? "http" : "https";
  if (domain.includes("localhost") && domain.includes(":")) {
    return `${protocol}://${domain}/sites/${slug}/`;
  }
  return `${protocol}://${slug}.${domain}/`;
}

export function storageKey(slug: string, versionId: string, path: string): string {
  const normalized = path.replace(/^\/+/, "");
  return `sites/${slug}/v/${versionId}/${normalized}`;
}

export function metaJsonKey(slug: string): string {
  return `sites/${slug}/meta.json`;
}
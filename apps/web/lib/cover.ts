export type CoverItemType = "wish" | "deliverable" | "site_post";

const GRADIENT_STOPS = [
  { from: "#ffe8f0", to: "#ffb8c8" },
  { from: "#fff0e0", to: "#ffc8a0" },
  { from: "#e8f4ff", to: "#b8d4ff" },
  { from: "#f0ffe8", to: "#c8f8b8" },
  { from: "#f8e8ff", to: "#ddb8ff" },
  { from: "#fff8e8", to: "#ffdcb0" },
  { from: "#e8fff8", to: "#b0f8dc" },
  { from: "#ffe8f8", to: "#ffb0dc" },
];

const GRADIENTS = [
  "linear-gradient(145deg, #ffe8f0 0%, #ffc8d8 55%, #ffb8c8 100%)",
  "linear-gradient(145deg, #fff0e0 0%, #ffd8b8 55%, #ffc8a0 100%)",
  "linear-gradient(145deg, #e8f4ff 0%, #c8e0ff 55%, #b8d4ff 100%)",
  "linear-gradient(145deg, #f0ffe8 0%, #d8ffc8 55%, #c8f8b8 100%)",
  "linear-gradient(145deg, #f8e8ff 0%, #e8c8ff 55%, #ddb8ff 100%)",
  "linear-gradient(145deg, #fff8e8 0%, #ffe8c8 55%, #ffdcb0 100%)",
  "linear-gradient(145deg, #e8fff8 0%, #c8ffe8 55%, #b0f8dc 100%)",
  "linear-gradient(145deg, #ffe8f8 0%, #ffc8e8 55%, #ffb0dc 100%)",
];

const EMOJI_BY_TYPE: Record<CoverItemType, string[]> = {
  wish: ["✨", "💫", "🌸", "⭐", "🍀", "🎐", "💝", "🌈", "🪄", "✿"],
  deliverable: ["🎀", "🎁", "🖼️", "📦", "🧁", "🎨", "💎", "🌟", "🎪", "🪅"],
  site_post: ["🌐", "🔗", "📱", "💻", "🚀", "🏠", "📡", "🛸", "🗺️", "🧭"],
};

export function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash;
}

export function getCoverVisual(seed: string, type: CoverItemType, coverEmoji?: string) {
  const hash = hashSeed(`${type}:${seed}`);
  return {
    gradient: GRADIENTS[hash % GRADIENTS.length]!,
    emoji: coverEmoji ?? EMOJI_BY_TYPE[type][hash % EMOJI_BY_TYPE[type].length]!,
    pattern: hash % 4,
  };
}

export function googleFaviconUrl(siteUrl: string, size = 128): string | null {
  try {
    const host = new URL(siteUrl).hostname;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=${size}`;
  } catch {
    return null;
  }
}

export function originFaviconUrl(siteUrl: string): string | null {
  try {
    return `${new URL(siteUrl).origin}/favicon.ico`;
  } catch {
    return null;
  }
}

function escapeXml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function truncate(value: string, max: number): string {
  const trimmed = value.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}

export function buildPosterCoverUrl(input: {
  type: CoverItemType;
  seed: string;
  title?: string;
  tags?: string[];
  coverEmoji?: string;
}): string {
  const params = new URLSearchParams({
    type: input.type,
    seed: input.seed,
    title: input.title ?? "",
    tags: (input.tags ?? []).slice(0, 4).join(","),
  });
  if (input.coverEmoji) params.set("emoji", input.coverEmoji);
  return `/api/cover/poster?${params}`;
}

export function buildPosterSvg(input: {
  type: CoverItemType;
  seed: string;
  title?: string;
  tags?: string[];
  coverEmoji?: string;
}): string {
  const visual = getCoverVisual(input.seed, input.type, input.coverEmoji);
  const stops = GRADIENT_STOPS[hashSeed(`${input.type}:${input.seed}`) % GRADIENT_STOPS.length]!;
  const title = truncate(input.title ?? "", 42);
  const tags = (input.tags ?? []).slice(0, 3).map((tag) => truncate(tag, 16));
  const tagLine = tags.length > 0 ? tags.map((t) => `#${t}`).join("  ") : "";
  const typeLabel =
    input.type === "wish" ? "许愿" : input.type === "deliverable" ? "作品" : "站点";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" role="img">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${stops.from}"/>
      <stop offset="100%" stop-color="${stops.to}"/>
    </linearGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
  </defs>
  <rect width="800" height="500" fill="url(#bg)"/>
  <circle cx="120" cy="90" r="70" fill="rgba(255,255,255,0.35)" filter="url(#soft)"/>
  <circle cx="700" cy="420" r="90" fill="rgba(255,255,255,0.28)" filter="url(#soft)"/>
  <text x="56" y="86" font-size="18" fill="rgba(255,80,120,0.9)" font-family="system-ui, sans-serif" font-weight="700">${escapeXml(typeLabel)}</text>
  <text x="400" y="230" text-anchor="middle" font-size="88">${visual.emoji}</text>
  <text x="400" y="310" text-anchor="middle" font-size="34" fill="#4a3040" font-family="system-ui, sans-serif" font-weight="700">${escapeXml(title || "VibeKing")}</text>
  ${
    tagLine
      ? `<text x="400" y="360" text-anchor="middle" font-size="22" fill="rgba(74,48,64,0.72)" font-family="system-ui, sans-serif">${escapeXml(tagLine)}</text>`
      : ""
  }
</svg>`;
}

export function parseOgImage(html: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}
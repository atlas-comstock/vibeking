export type CoverItemType = "wish" | "deliverable" | "site_post";

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
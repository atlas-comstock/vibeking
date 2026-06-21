import type { CoverItemType } from "@/lib/cover";
import { buildPosterSvg } from "@/lib/cover";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get("type") ?? "wish") as CoverItemType;
  const seed = searchParams.get("seed") ?? "default";
  const title = searchParams.get("title") ?? "";
  const tags = searchParams.get("tags")?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
  const coverEmoji = searchParams.get("emoji") ?? undefined;

  const safeType: CoverItemType =
    type === "deliverable" || type === "site_post" ? type : "wish";

  const svg = buildPosterSvg({
    type: safeType,
    seed,
    title,
    tags,
    coverEmoji,
  });

  return new Response(svg, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
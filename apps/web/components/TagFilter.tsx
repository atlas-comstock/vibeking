"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { labels, t } from "@/lib/i18n";

type Props = {
  tags: Array<{ tag: string; count: number }>;
};

export function TagFilter({ tags }: Props) {
  const searchParams = useSearchParams();
  const active = searchParams.get("tag");

  return (
    <div className="tag-filter">
      <span className="tag-filter-label">{t(labels.wish.filterByTag)}</span>
      <div className="tag-list">
        <Link
          href="/wishes"
          className={`tag-chip ${!active ? "tag-chip-active" : ""}`}
        >
          {t(labels.wish.allTags)}
        </Link>
        {tags.map(({ tag, count }) => (
          <Link
            key={tag}
            href={`/wishes?tag=${encodeURIComponent(tag)}`}
            className={`tag-chip ${active === tag ? "tag-chip-active" : ""}`}
          >
            {tag}
            <span className="tag-count">{count}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
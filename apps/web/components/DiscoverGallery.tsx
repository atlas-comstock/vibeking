"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/locale";
import { labels, t, type LocaleLabel } from "@/lib/i18n";
import { EmptyDiscover } from "./EmptyDiscover";
import { FeedCard, type FeedCardItem } from "./FeedCard";

type Filter = "all" | FeedCardItem["type"];

const FILTERS: { id: Filter; label: LocaleLabel }[] = [
  { id: "all", label: labels.home.filterAll },
  { id: "deliverable", label: labels.home.filterWorks },
  { id: "wish", label: labels.home.filterWishes },
  { id: "site_post", label: labels.home.filterSites },
];

export function DiscoverGallery({
  items,
  locale,
}: {
  items: FeedCardItem[];
  locale: Locale;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== "all" && item.type !== filter) return false;
      if (!q) return true;
      const haystack = [
        item.title,
        item.description ?? "",
        ...item.tags,
        item.type,
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [items, query, filter]);

  return (
    <section className="section gallery-section" id="gallery">
      <div className="gallery-toolbar">
        <div className="gallery-heading">
          <h2>{t(labels.home.discover, locale)}</h2>
          <p className="section-sub">
            {t(labels.home.galleryCount, locale).replace("{n}", String(filtered.length))}
          </p>
        </div>
        <label className="gallery-search">
          <span className="sr-only">{t(labels.home.search, locale)}</span>
          <input
            type="search"
            className="input gallery-search-input"
            placeholder={t(labels.home.searchPlaceholder, locale)}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>

      <div className="gallery-filters" role="tablist" aria-label={t(labels.home.discover, locale)}>
        {FILTERS.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={filter === tab.id}
            className={`gallery-filter${filter === tab.id ? " gallery-filter-active" : ""}`}
            onClick={() => setFilter(tab.id)}
          >
            {t(tab.label, locale)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        items.length === 0 ? (
          <EmptyDiscover locale={locale} />
        ) : (
          <p className="empty-state card">{t(labels.home.searchEmpty, locale)}</p>
        )
      ) : (
        <div className="app-grid">
          {filtered.map((item, i) => (
            <FeedCard key={`${item.type}-${item.id}`} item={item} locale={locale} index={i} />
          ))}
        </div>
      )}
    </section>
  );
}
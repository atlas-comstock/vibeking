"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Wish } from "@vibeking/shared";
import { labels, t } from "@/lib/i18n";

type Props = {
  wish: Wish;
  canModerate: boolean;
};

export function WishActions({ wish, canModerate }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "reject" | null>(null);

  if (!canModerate || wish.status !== "delivered") {
    return null;
  }

  async function act(action: "accept" | "reject") {
    setLoading(action);
    try {
      const res = await fetch(`/api/wishes/${wish.id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: action === "reject" ? JSON.stringify({ reason: "" }) : undefined,
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="action-row">
      <button
        type="button"
        className="btn btn-primary"
        disabled={loading !== null}
        onClick={() => act("accept")}
      >
        {t(labels.wish.accept)}
      </button>
      <button
        type="button"
        className="btn btn-ghost"
        disabled={loading !== null}
        onClick={() => act("reject")}
      >
        {t(labels.wish.reject)}
      </button>
    </div>
  );
}
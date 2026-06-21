"use client";

import { useEffect, useState } from "react";

type Props = {
  targetType: "wish" | "deliverable";
  targetId: string;
  initialCount: number;
  className?: string;
};

export function LikeButton({ targetType, targetId, initialCount, className }: Props) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/likes/check?targetType=${targetType}&targetId=${encodeURIComponent(targetId)}`)
      .then((res) => (res.ok ? res.json() : { liked: false }))
      .then((data: { liked?: boolean }) => {
        if (!cancelled) {
          setLiked(Boolean(data.liked));
          setReady(true);
        }
      })
      .catch(() => {
        if (!cancelled) setReady(true);
      });
    return () => {
      cancelled = true;
    };
  }, [targetType, targetId]);

  async function handleClick(event: React.MouseEvent<HTMLButtonElement>) {
    event.preventDefault();
    event.stopPropagation();
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetType, targetId }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { liked: boolean; likeCount: number };
      setLiked(data.liked);
      setCount(data.likeCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      className={`like-btn ${liked ? "like-btn-active" : ""} ${className ?? ""}`.trim()}
      onClick={handleClick}
      disabled={loading || !ready}
      aria-pressed={liked}
    >
      <span aria-hidden>{liked ? "♥" : "♡"}</span>
      <span>{count}</span>
    </button>
  );
}
"use client";

import { useState } from "react";
import type { ApiKey, ApiKeyCreated, ApiKeyScope } from "@vibeking/shared";
import { labels, t } from "@/lib/i18n";

type Props = {
  initialKeys: ApiKey[];
};

const DEFAULT_SCOPES: ApiKeyScope[] = [
  "user:read",
  "user:write",
  "agent:read",
  "agent:write",
];

export function ApiKeyManager({ initialKeys }: Props) {
  const [keys, setKeys] = useState(initialKeys);
  const [revealed, setRevealed] = useState<ApiKeyCreated | null>(null);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("claude");

  async function createKey() {
    setLoading(true);
    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, scopes: DEFAULT_SCOPES }),
      });
      if (!res.ok) throw new Error("Failed to create key");
      const key = (await res.json()) as ApiKeyCreated;
      setRevealed(key);
      setKeys((prev) => [
        {
          id: key.id,
          name: key.name,
          keySuffix: key.keySuffix,
          scopes: key.scopes,
          createdAt: key.createdAt,
          lastUsedAt: key.lastUsedAt,
          current: key.current,
        },
        ...prev,
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(id: string) {
    const res = await fetch(`/api/keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) => prev.filter((k) => k.id !== id));
    }
  }

  return (
    <section className="card">
      <div className="section-header">
        <h2>{t(labels.dashboard.apiKeys)}</h2>
        <div className="inline-form">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="key name"
            className="input"
          />
          <button type="button" className="btn btn-primary" onClick={createKey} disabled={loading}>
            {t(labels.dashboard.createKey)}
          </button>
        </div>
      </div>

      {revealed && (
        <div className="key-reveal">
          <p>{t(labels.dashboard.keyReveal)}</p>
          <code>{revealed.key}</code>
          <button type="button" className="btn btn-ghost" onClick={() => setRevealed(null)}>
            Dismiss
          </button>
        </div>
      )}

      <ul className="key-list">
        {keys.map((key) => (
          <li key={key.id} className="key-item">
            <div>
              <strong>{key.name}</strong>
              <span className="meta-muted">
                vk_••••{key.keySuffix} · {t(labels.dashboard.masked)}
              </span>
              <div className="tag-row">
                {key.scopes.map((scope) => (
                  <span key={scope} className="tag-chip tag-chip-sm">
                    {scope}
                  </span>
                ))}
              </div>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => revokeKey(key.id)}>
              {t(labels.dashboard.revoke)}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
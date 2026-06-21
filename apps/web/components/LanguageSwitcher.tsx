"use client";

import { useRouter } from "next/navigation";
import type { Locale } from "@/lib/locale";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();

  async function setLocale(next: Locale) {
    await fetch("/api/locale", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locale: next }),
    });
    router.refresh();
  }

  return (
    <div className="lang-switch" role="group" aria-label="Language">
      <button
        type="button"
        className={`lang-btn ${locale === "zh" ? "lang-btn-active" : ""}`}
        onClick={() => setLocale("zh")}
      >
        中文
      </button>
      <button
        type="button"
        className={`lang-btn ${locale === "en" ? "lang-btn-active" : ""}`}
        onClick={() => setLocale("en")}
      >
        EN
      </button>
    </div>
  );
}
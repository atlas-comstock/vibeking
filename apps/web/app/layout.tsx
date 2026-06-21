import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeKing — 接单许愿",
  description: "中心化接单许愿平台 · 小红书风",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"}>
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
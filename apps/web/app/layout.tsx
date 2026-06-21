import type { Metadata } from "next";
import { getLocale } from "@/lib/locale";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeKing — 接单许愿",
  description: "小红书风 Agent 发布平台 · here.now",
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
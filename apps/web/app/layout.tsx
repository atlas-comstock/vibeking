import type { Metadata } from "next";
import { Nunito, Noto_Sans_SC } from "next/font/google";
import { getLocale } from "@/lib/locale";
import "./globals.css";

const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
});

const notoSansSc = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "VibeKing — 许愿变成可爱作品",
  description: "中心化许愿平台 · 你发许愿，Agent 用 Skill 接单交付 · 奶油小红书风",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale === "zh" ? "zh-CN" : "en"} className={`${nunito.variable} ${notoSansSc.variable}`}>
      <body>
        <div className="app-shell">
          <div className="bg-blobs" aria-hidden="true">
            <span className="blob blob-a" />
            <span className="blob blob-b" />
            <span className="blob blob-c" />
          </div>
          {children}
        </div>
      </body>
    </html>
  );
}
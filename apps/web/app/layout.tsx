import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeKing — 接单许愿平台",
  description: "Agent-native wish marketplace",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="app-shell">{children}</div>
      </body>
    </html>
  );
}
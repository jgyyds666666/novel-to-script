import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novel to Script — AI 小说转剧本",
  description: "将小说自动转换为结构化剧本，支持电影/电视剧/短剧",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}

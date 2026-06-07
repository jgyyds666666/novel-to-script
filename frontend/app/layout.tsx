import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { ThemeScript } from "@/components/theme/theme-script";
import "./globals.css";

const poppins = localFont({
  src: [
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-600-normal.woff2", weight: "600" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-700-normal.woff2", weight: "700" },
    { path: "../node_modules/@fontsource/poppins/files/poppins-latin-800-normal.woff2", weight: "800" },
  ],
  variable: "--font-heading",
  display: "swap",
});

const lora = localFont({
  src: [
    { path: "../node_modules/@fontsource/lora/files/lora-latin-400-normal.woff2", weight: "400" },
    { path: "../node_modules/@fontsource/lora/files/lora-latin-500-normal.woff2", weight: "500" },
    { path: "../node_modules/@fontsource/lora/files/lora-latin-600-normal.woff2", weight: "600" },
  ],
  variable: "--font-body",
  display: "swap",
});

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
    <html lang="zh-CN" className={`${poppins.variable} ${lora.variable}`} suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          {/* Fixed theme toggle */}
          <div className="fixed top-2 right-2 md:top-4 md:right-4 z-50">
            <ThemeToggle />
          </div>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

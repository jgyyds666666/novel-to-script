import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          Novel to Script
        </h1>
        <p className="text-xl text-muted-foreground">
          AI 小说转剧本工具 — 将小说自动转换为结构化剧本
        </p>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          支持电影 / 电视剧 / 短剧三种目标格式，AI 深度改写，
          输出 YAML 剧本 + Fountain 格式，可导入 Final Draft 等专业编剧软件。
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Button size="lg">
            <Link href="/upload">开始转换</Link>
          </Button>
          <Button variant="outline" size="lg">
            <Link href="/docs/schema">查看 Schema</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

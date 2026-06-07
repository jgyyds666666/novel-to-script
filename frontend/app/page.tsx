import Link from "next/link";
import { Film, Tv, Smartphone, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main>
      {/* Hero — dark section */}
      <section className="bg-[#141413] text-[#faf9f5] py-16 md:py-32 px-4 md:px-8">
        <div className="max-w-[960px] mx-auto text-center space-y-4 md:space-y-6">
          {/* Decorative rule */}
          <div className="flex items-center justify-center gap-3 pb-2">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/60" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/60" />
          </div>

          <h1
            className="text-5xl md:text-6xl font-bold tracking-tight animate-fade-in-up"
            style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
          >
            将小说，
            <br />
            转化为<span className="text-primary">可拍摄的剧本</span>
          </h1>

          <p
            className="text-base md:text-lg text-[#b0aea5] max-w-xl mx-auto animate-fade-in-up"
            style={{ animationDelay: "150ms" }}
          >
            AI 深度改写 —— 从小说叙事到视听语言，
            支持电影、电视剧、短剧三种格式，输出标准 YAML 剧本。
          </p>

          <div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 animate-fade-in-up"
            style={{ animationDelay: "300ms" }}
          >
            <Link
              href="/upload"
              className="group inline-flex items-center gap-2 h-12 px-10 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:brightness-110 transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
            >
              开始转换
              <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/docs/schema"
              className="inline-flex items-center h-12 px-8 rounded-lg text-sm font-medium text-[#b0aea5] border border-[#b0aea5]/30 hover:border-[#b0aea5]/60 hover:text-[#faf9f5] transition-all duration-150"
            >
              查看 Schema
            </Link>
          </div>
        </div>
      </section>

      {/* Features — light section */}
      <section className="bg-background py-16 md:py-24 px-4 md:px-8">
        <div className="max-w-[960px] mx-auto space-y-10 md:space-y-16">
          <div className="text-center space-y-3">
            <h2
              className="text-2xl md:text-3xl font-bold tracking-tight"
              style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
            >
              三种格式，一键生成
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              无论长片、剧集还是短视频，都能输出符合行业规范的结构化剧本
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Film,
                title: "电影",
                desc: "三幕结构 · 30-60 场景 · 带 Act/Sequence 嵌套层级，适合院线长片剧本",
              },
              {
                icon: Tv,
                title: "电视剧",
                desc: "Season → Episode 结构 · 每集悬念钩子 · 支持多季长篇叙事",
              },
              {
                icon: Smartphone,
                title: "短剧",
                desc: "每集 1-3 场景 · 极快节奏 · 适合短视频平台 1-5 分钟短剧",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="group rounded-xl border border-border bg-card p-5 md:p-8 text-center space-y-3 md:space-y-4 transition-all duration-200 hover:border-primary/30 hover:shadow-sm"
              >
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-primary/10">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3
                  className="text-lg font-semibold"
                  style={{ fontFamily: "var(--font-heading), system-ui, sans-serif" }}
                >
                  {title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer hint */}
      <div className="text-center pb-8 md:pb-16">
        <p className="text-xs text-muted-foreground">
          AI 小说转剧本工具 · DeepSeek 驱动 · 开源项目
        </p>
      </div>
    </main>
  );
}

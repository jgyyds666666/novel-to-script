"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/upload/steps-indicator";
import { ScriptPreview } from "@/components/upload/script-preview";
import { Button } from "@/components/ui/button";
import { parseChapters, STORAGE_KEYS, type UploadMeta, type ParsedChapter } from "@/lib/parser";
import { generateScript } from "@/lib/generator";
import type { Script } from "@/lib/types";

const STEPS = [
  { label: "上传小说", description: "上传纯文本文件" },
  { label: "分章解析", description: "AI 识别章节结构" },
  { label: "生成剧本", description: "深度改写为剧本" },
  { label: "导出", description: "下载 YAML / Fountain" },
];

export default function GeneratePage() {
  const router = useRouter();
  const [script, setScript] = useState<Script | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    const text = sessionStorage.getItem(STORAGE_KEYS.NOVEL_TEXT);
    const metaStr = sessionStorage.getItem(STORAGE_KEYS.NOVEL_META);

    if (!text) {
      setError("未找到上传的小说文本，请返回重新上传。");
      setIsGenerating(false);
      return;
    }

    if (!metaStr) {
      setError("未找到剧本设置信息，请返回重新设置。");
      setIsGenerating(false);
      return;
    }

    try {
      const meta: UploadMeta = JSON.parse(metaStr);
      const { chapters } = parseChapters(text);

      // Artificial delay to simulate AI processing (round 2 will be real)
      setTimeout(() => {
        const result = generateScript(chapters, meta);
        setScript(result);
        setIsGenerating(false);
      }, 800);
    } catch {
      setError("剧本生成失败，请返回重试。");
      setIsGenerating(false);
    }
  }, []);

  const handleBack = () => {
    router.push("/upload/parsing");
  };

  const handleRestart = () => {
    sessionStorage.removeItem(STORAGE_KEYS.NOVEL_TEXT);
    sessionStorage.removeItem(STORAGE_KEYS.NOVEL_META);
    router.push("/upload");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8 pt-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">生成剧本</h1>
          <p className="text-muted-foreground">
            AI 正在将小说章节转换为结构化剧本
          </p>
        </div>

        <StepsIndicator steps={STEPS} currentStep={2} />

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={handleRestart}>
              重新开始
            </Button>
          </div>
        )}

        {isGenerating && !error && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">AI 正在深度改写中...</p>
            <p className="text-xs text-muted-foreground">
              （MVP 阶段使用模板生成，真实 AI 将在第二轮实现）
            </p>
          </div>
        )}

        {script && !isGenerating && (
          <div className="space-y-6">
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
              <p className="text-sm font-medium">剧本已生成</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {script.meta.title} · {script.scenes.length} 个场景 · {script.adaptation_report?.total_dialogue_lines ?? 0} 行对白
              </p>
            </div>

            <ScriptPreview script={script} />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                返回修改
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                重新开始
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

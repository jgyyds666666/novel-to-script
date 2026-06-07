"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/upload/steps-indicator";
import { ScriptPreview } from "@/components/upload/script-preview";
import { ProgressDisplay } from "@/components/upload/progress-display";
import { GenerateSkeleton } from "@/components/upload/loading-skeleton";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, type UploadMeta } from "@/lib/parser";
import { useSSEStream } from "@/hooks/use-sse-stream";
import { useApiKey } from "@/hooks/use-api-key";
import type { ChapterSummary } from "@/lib/pipeline/types";
import type { Script } from "@/lib/types";

const STEPS = [
  { label: "上传小说", description: "上传纯文本文件" },
  { label: "分章解析", description: "AI 识别章节结构" },
  { label: "生成剧本", description: "深度改写为剧本" },
  { label: "导出", description: "下载 YAML / Fountain" },
];

interface GenerateResult {
  script: Script;
}

export default function GeneratePage() {
  const router = useRouter();
  const [meta, setMeta] = useState<UploadMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);
  const { apiKey } = useApiKey();

  const {
    status,
    progress,
    result,
    error: streamError,
    start,
  } = useSSEStream<GenerateResult>();

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const metaStr = sessionStorage.getItem(STORAGE_KEYS.NOVEL_META);
    const chaptersStr = sessionStorage.getItem("novel-to-script:chapters");

    if (!chaptersStr) {
      setError("未找到章节数据，请返回重新解析。");
      return;
    }

    if (!metaStr) {
      setError("未找到剧本设置信息，请返回重新设置。");
      return;
    }

    try {
      const parsedMeta: UploadMeta = JSON.parse(metaStr);
      setMeta(parsedMeta);

      const chapters: ChapterSummary[] = JSON.parse(chaptersStr);

      start("/api/pipeline/generate", {
        chapters,
        scriptType: parsedMeta.scriptType,
        title: parsedMeta.title,
        language: parsedMeta.language || "zh-CN",
        fileName: parsedMeta.fileName,
        apiKey: apiKey || undefined,
      });
    } catch {
      setError("数据解析失败，请返回重试。");
    }
  }, [apiKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => router.push("/upload/parsing");

  const handleRestart = () => {
    sessionStorage.removeItem(STORAGE_KEYS.NOVEL_TEXT);
    sessionStorage.removeItem(STORAGE_KEYS.NOVEL_META);
    sessionStorage.removeItem("novel-to-script:chapters");
    router.push("/upload");
  };

  const isLoading = status === "loading";
  const hasScript = status === "done" && result?.script;
  const displayError = error || streamError;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8 pt-16">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">生成剧本</h1>
          <p className="text-muted-foreground">
            AI 正在将小说章节深度改写为结构化剧本
          </p>
        </div>

        <StepsIndicator steps={STEPS} currentStep={2} />

        {displayError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm text-destructive font-medium">生成失败</p>
            <p className="text-xs text-muted-foreground">{displayError}</p>
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleBack}>
                ← 返回修改
              </Button>
              <Button variant="outline" onClick={handleRestart}>
                重新开始
              </Button>
            </div>
          </div>
        )}

        {!displayError && isLoading && (
          <>
            <ProgressDisplay progress={progress} isActive={isLoading} />
            <GenerateSkeleton />
          </>
        )}

        {hasScript && (
          <div className="space-y-6">
            {/* Stats banner */}
            <div className="rounded-lg bg-muted/50 px-4 py-3 text-center">
              <p className="text-sm font-medium text-success">
                剧本生成完成
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {result.script.meta.title}
                <span className="mx-1.5">·</span>
                {result.script.scenes.length} 个场景
                <span className="mx-1.5">·</span>
                {result.script.characters.length} 个人物
                <span className="mx-1.5">·</span>
                {result.script.adaptation_report?.total_dialogue_lines ?? 0} 行对白
                {(result.script.adaptation_report?.uncertainty_count ?? 0) > 0 && (
                  <>
                    <span className="mx-1.5">·</span>
                    <span className="text-warning">
                      {result.script.adaptation_report!.uncertainty_count} 处待确认
                    </span>
                  </>
                )}
              </p>
            </div>

            <ScriptPreview script={result.script} />

            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                ← 返回修改
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

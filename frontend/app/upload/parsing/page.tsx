"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/upload/steps-indicator";
import { ChapterCard } from "@/components/upload/chapter-card";
import { ProgressDisplay } from "@/components/upload/progress-display";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, type UploadMeta } from "@/lib/parser";
import { useSSEStream } from "@/hooks/use-sse-stream";
import type { ChapterSummary } from "@/lib/pipeline/types";

const STEPS = [
  { label: "上传小说", description: "上传纯文本文件" },
  { label: "分章解析", description: "AI 识别章节结构" },
  { label: "生成剧本", description: "深度改写为剧本" },
  { label: "导出", description: "下载 YAML / Fountain" },
];

interface ParseResult {
  chapters: ChapterSummary[];
}

export default function ParsingPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<UploadMeta | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasStarted = useRef(false);

  const { status, progress, result, error: streamError, start } =
    useSSEStream<ParseResult>();

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    const text = sessionStorage.getItem(STORAGE_KEYS.NOVEL_TEXT);
    const metaStr = sessionStorage.getItem(STORAGE_KEYS.NOVEL_META);

    if (!text || !metaStr) {
      setError("未找到上传的小说文本，请返回重新上传。");
      return;
    }

    const parsedMeta: UploadMeta = JSON.parse(metaStr);
    setMeta(parsedMeta);

    // Start AI parsing via SSE
    start("/api/pipeline/parse", {
      text,
      language: parsedMeta.language || "zh-CN",
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleBack = () => {
    router.push("/upload");
  };

  const handleConfirm = () => {
    if (result?.chapters) {
      // Store full ChapterSummary[] in sessionStorage for the generate page
      sessionStorage.setItem(
        "novel-to-script:chapters",
        JSON.stringify(result.chapters)
      );
    }
    router.push("/upload/generate");
  };

  const isLoading = status === "loading";
  const hasResult = status === "done" && result?.chapters;
  const displayError = error || streamError;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8 pt-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">分章解析</h1>
          <p className="text-muted-foreground">
            AI 自动识别章节结构，提取情节点与角色
          </p>
        </div>

        <StepsIndicator steps={STEPS} currentStep={1} />

        {displayError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm text-destructive">{displayError}</p>
            <Button variant="outline" onClick={handleBack}>
              返回上传
            </Button>
          </div>
        )}

        {!displayError && isLoading && (
          <ProgressDisplay
            progress={progress}
            isActive={isLoading}
          />
        )}

        {hasResult && meta && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="text-sm">
                <span className="font-medium">{meta.fileName}</span>
                <span className="text-muted-foreground ml-2">
                  {result.chapters.length} 个章节
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>
                  共{" "}
                  {result.chapters.reduce(
                    (s, c) => s + c.dialogue_segments.length,
                    0
                  )}{" "}
                  句对白
                </span>
                <span>
                  {result.chapters.reduce(
                    (s, c) => s + c.characters_mentioned.length,
                    0
                  )}{" "}
                  次角色提及
                </span>
              </div>
            </div>

            {/* Chapter List */}
            <div className="space-y-2">
              <h2 className="text-sm font-medium">
                AI 解析完成，共 {result.chapters.length} 个章节
              </h2>
              <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1">
                {result.chapters.map((chapter, idx) => (
                  <ChapterCard key={idx} chapter={chapter} />
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={handleBack}>
                返回修改
              </Button>
              <Button onClick={handleConfirm}>
                确认，生成剧本
              </Button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

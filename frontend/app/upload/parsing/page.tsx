"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/upload/steps-indicator";
import { ChapterCard } from "@/components/upload/chapter-card";
import { Button } from "@/components/ui/button";
import { parseChapters, STORAGE_KEYS, type UploadMeta, type ParseResult } from "@/lib/parser";

const STEPS = [
  { label: "上传小说", description: "上传纯文本文件" },
  { label: "分章解析", description: "AI 识别章节结构" },
  { label: "生成剧本", description: "深度改写为剧本" },
  { label: "导出", description: "下载 YAML / Fountain" },
];

export default function ParsingPage() {
  const router = useRouter();
  const [meta, setMeta] = useState<UploadMeta | null>(null);
  const [result, setResult] = useState<ParseResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const text = sessionStorage.getItem(STORAGE_KEYS.NOVEL_TEXT);
    const metaStr = sessionStorage.getItem(STORAGE_KEYS.NOVEL_META);

    if (!text || !metaStr) {
      setError("未找到上传的小说文本，请返回重新上传。");
      return;
    }

    try {
      setMeta(JSON.parse(metaStr));
      const parsed = parseChapters(text);
      // Artificial delay to show the parsing step (will be real AI latency in round 2)
      setTimeout(() => setResult(parsed), 300);
    } catch {
      setError("文本解析失败，请检查文件编码后重试。");
    }
  }, []);

  const handleBack = () => {
    router.push("/upload");
  };

  const handleConfirm = () => {
    // MVP: store parse result and proceed to generation
    if (result) {
      sessionStorage.setItem(
        "novel-to-script:chapters",
        JSON.stringify(result.chapters.map((ch) => ({
          index: ch.index,
          title: ch.title,
          paragraphCount: ch.paragraphCount,
          charCount: ch.charCount,
        })))
      );
    }
    router.push("/upload/generate");
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8 pt-12">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">分章解析</h1>
          <p className="text-muted-foreground">
            AI 自动识别章节结构
          </p>
        </div>

        <StepsIndicator steps={STEPS} currentStep={1} />

        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6 text-center space-y-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button variant="outline" onClick={handleBack}>
              返回上传
            </Button>
          </div>
        )}

        {!error && !result && (
          <div className="flex flex-col items-center gap-4 py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">正在解析章节结构...</p>
          </div>
        )}

        {result && meta && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="text-sm">
                <span className="font-medium">{meta.fileName}</span>
                <span className="text-muted-foreground ml-2">
                  {result.totalChars.toLocaleString()} 字
                </span>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>{result.chapters.length} 个章节</span>
                <span>{result.totalParagraphs} 段</span>
              </div>
            </div>

            {/* Chapter List */}
            <div className="space-y-2">
              <h2 className="text-sm font-medium">
                识别到 {result.chapters.length} 个章节
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StepsIndicator } from "@/components/upload/steps-indicator";
import { FileDropZone } from "@/components/upload/file-drop-zone";
import { ScriptTypeSelector } from "@/components/upload/script-type-selector";
import { Button } from "@/components/ui/button";
import { STORAGE_KEYS, type UploadMeta } from "@/lib/parser";
import type { ScriptType } from "@/lib/types";

const STEPS = [
  { label: "上传小说", description: "上传纯文本文件" },
  { label: "分章解析", description: "AI 识别章节结构" },
  { label: "生成剧本", description: "深度改写为剧本" },
  { label: "导出", description: "下载 YAML / Fountain" },
];

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [scriptType, setScriptType] = useState<ScriptType | null>(null);
  const [language, setLanguage] = useState<string>("zh-CN");
  const [title, setTitle] = useState("");
  const [isReading, setIsReading] = useState(false);

  const canProceed = file && scriptType && !isReading;

  const handleSubmit = () => {
    if (!canProceed || !file) return;

    setIsReading(true);
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target?.result as string;

      // Store novel text and metadata for the parsing page
      sessionStorage.setItem(STORAGE_KEYS.NOVEL_TEXT, text);

      const meta: UploadMeta = {
        fileName: file.name,
        scriptType: scriptType!,
        language,
        title: title || file.name.replace(/\.\w+$/, ""),
      };
      sessionStorage.setItem(STORAGE_KEYS.NOVEL_META, JSON.stringify(meta));

      router.push("/upload/parsing");
    };

    reader.onerror = () => {
      setIsReading(false);
    };

    reader.readAsText(file);
  };

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-8 pt-12">
        {/* Header */}
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">开始转换</h1>
          <p className="text-muted-foreground">
            上传你的小说文本，AI 将自动转换为结构化剧本
          </p>
        </div>

        {/* Steps */}
        <StepsIndicator steps={STEPS} currentStep={0} />

        {/* Form */}
        <div className="space-y-8">
          {/* File Upload */}
          <FileDropZone onFileAccepted={setFile} />

          {/* Script Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              剧本标题（可选）
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="留空则自动从文本中提取"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Script Type */}
          <ScriptTypeSelector value={scriptType} onChange={setScriptType} />

          {/* Language */}
          <div className="space-y-2">
            <label htmlFor="language" className="text-sm font-medium">
              原文语言
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <option value="zh-CN">中文</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => router.push("/")}>
              返回
            </Button>
            <Button disabled={!canProceed} onClick={handleSubmit}>
              {isReading ? "正在读取文件..." : "下一步：分章解析"}
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

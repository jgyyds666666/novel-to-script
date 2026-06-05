"use client";

import { useState } from "react";
import { useApiKey } from "@/hooks/use-api-key";

export function ApiKeyConfig() {
  const { apiKey, setApiKey, clearApiKey, hasKey, loaded } = useApiKey();
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState("");

  if (!loaded) return null;

  const masked = hasKey ? `sk-****${apiKey.slice(-4)}` : "";

  const handleSave = (value: string) => {
    setApiKey(value);
    setIsEditing(false);
    setInputValue("");
  };

  if (!hasKey || isEditing) {
    return (
      <div className={`rounded-lg border p-4 space-y-3 ${!hasKey ? "border-amber-300 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20" : ""}`}>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">
            {hasKey ? "修改 API Key" : "配置 DeepSeek API Key"}
          </span>
          {isEditing && (
            <button
              onClick={() => { setIsEditing(false); setInputValue(""); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              取消
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <input
            type="password"
            placeholder="输入 sk-xxxxxxxxxxxx..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && inputValue.trim() && handleSave(inputValue)}
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            autoFocus
          />
          <button
            onClick={() => handleSave(inputValue)}
            disabled={!inputValue.trim()}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            保存
          </button>
        </div>

        {!hasKey && (
          <p className="text-xs text-muted-foreground">
            Key 仅存储在本地浏览器，不会上传服务器。
            <a
              href="https://platform.deepseek.com/api_keys"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 underline hover:text-foreground"
            >
              获取 API Key →
            </a>
          </p>
        )}

        {isEditing && (
          <button
            onClick={() => { clearApiKey(); setIsEditing(false); }}
            className="text-xs text-destructive hover:underline"
          >
            清除 Key
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-lg border px-4 py-2.5 bg-muted/30">
      <div className="flex items-center gap-2 text-sm">
        <span className="h-2 w-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="text-muted-foreground text-xs">API Key</span>
        <span className="font-mono text-xs">{masked}</span>
      </div>
      <button
        onClick={() => setIsEditing(true)}
        className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
      >
        修改
      </button>
    </div>
  );
}

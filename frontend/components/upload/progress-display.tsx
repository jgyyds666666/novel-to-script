// ============================================================
// ProgressDisplay — Real-time pipeline progress visualization
// ============================================================

import type { PipelineProgress } from "@/lib/pipeline/types";

// ---- Stage Labels ----

const STAGE_LABELS: Record<string, string> = {
  splitting: "切分章节",
  parsing: "分析章节",
  analyzing: "全局分析",
  generating: "生成场景",
  checking: "一致性检查",
};

interface ProgressDisplayProps {
  progress: PipelineProgress | null;
  isActive: boolean;
}

export function ProgressDisplay({
  progress,
  isActive,
}: ProgressDisplayProps) {
  if (!progress && isActive) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">正在准备...</p>
      </div>
    );
  }

  if (!progress) return null;

  const stageLabel =
    STAGE_LABELS[progress.stage] || progress.stage;
  const isDone = progress.stage === "done";
  const isError = progress.stage === "error";
  const hasProgress =
    progress.current !== undefined &&
    progress.total !== undefined &&
    progress.total > 0;
  const percent = hasProgress
    ? Math.round((progress.current! / progress.total!) * 100)
    : 0;

  return (
    <div className="space-y-4 py-8">
      {/* Stage indicator */}
      <div className="flex items-center gap-3">
        {!isDone && !isError && isActive && (
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent flex-shrink-0" />
        )}
        {isDone && (
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <svg
              className="h-3 w-3 text-primary-foreground"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={3}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
        )}
        {isError && (
          <div className="h-5 w-5 rounded-full bg-destructive flex items-center justify-center flex-shrink-0">
            <span className="text-destructive-foreground text-xs font-bold">!</span>
          </div>
        )}
        <span
          className={`text-sm font-medium ${
            isError ? "text-destructive" : ""
          }`}
        >
          {isError ? progress.message : `${stageLabel}中...`}
        </span>
      </div>

      {/* Progress message */}
      {!isDone && !isError && progress.message && (
        <p className="text-sm text-muted-foreground pl-8">
          {progress.message}
        </p>
      )}

      {/* Progress bar */}
      {hasProgress && !isDone && !isError && (
        <div className="pl-8">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${Math.max(percent, 5)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {progress.current}/{progress.total}（{percent}%）
          </p>
        </div>
      )}

      {/* Done message */}
      {isDone && progress.message && (
        <p className="text-sm text-muted-foreground pl-8">
          {progress.message}
        </p>
      )}
    </div>
  );
}

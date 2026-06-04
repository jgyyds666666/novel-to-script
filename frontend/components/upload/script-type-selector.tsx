"use client";

import { cn } from "@/lib/utils";
import { Film, Tv, Smartphone } from "lucide-react";
import type { ScriptType } from "@/lib/types";
import { SCRIPT_TYPE_LABELS } from "@/lib/constants";

interface ScriptTypeSelectorProps {
  value: ScriptType | null;
  onChange: (value: ScriptType) => void;
}

const scriptTypeOptions: {
  value: ScriptType;
  icon: typeof Film;
  description: string;
}[] = [
  {
    value: "movie",
    icon: Film,
    description: "90–120 分钟标准电影，三幕结构",
  },
  {
    value: "tv_series",
    icon: Tv,
    description: "单集 30–60 分钟，支持多季多集",
  },
  {
    value: "short_drama",
    icon: Smartphone,
    description: "单集 1–5 分钟，快节奏短剧",
  },
];

export function ScriptTypeSelector({ value, onChange }: ScriptTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-medium">目标剧本类型</label>
      <div className="grid grid-cols-3 gap-3">
        {scriptTypeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors hover:border-primary/50",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border"
              )}
            >
              <Icon
                className={cn(
                  "h-6 w-6",
                  isSelected ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "text-sm font-medium",
                  isSelected ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {SCRIPT_TYPE_LABELS[option.value]}
              </span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight">
                {option.description}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

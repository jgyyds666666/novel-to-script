"use client";

import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description?: string;
}

interface StepsIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepsIndicator({ steps, currentStep }: StepsIndicatorProps) {
  return (
    <nav aria-label="转换进度" className="w-full">
      <ol className="flex items-center justify-center gap-2">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isDone = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <li key={step.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <span
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ring-1 transition-colors",
                    isDone && "bg-primary text-primary-foreground ring-primary",
                    isActive && "bg-primary text-primary-foreground ring-primary",
                    !isDone && !isActive && "bg-muted text-muted-foreground ring-border"
                  )}
                >
                  {isDone ? "✓" : index + 1}
                </span>
                <span
                  className={cn(
                    "mt-1 text-xs",
                    isActive ? "text-foreground font-medium" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div
                  className={cn(
                    "mx-4 h-px w-12",
                    index < currentStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

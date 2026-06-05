// ============================================================
// useSSEStream — React hook for consuming SSE from POST requests
// ============================================================

"use client";

import { useState, useRef, useCallback } from "react";
import type { PipelineProgress } from "@/lib/pipeline/types";

export type StreamStatus =
  | "idle"
  | "loading"
  | "done"
  | "error";

export interface UseSSEStreamState<T> {
  status: StreamStatus;
  progress: PipelineProgress | null;
  result: T | null;
  error: string | null;
}

interface UseSSEStreamOptions {
  /** Timeout in ms for no SSE events (default 120000 = 2 min) */
  timeout?: number;
}

export function useSSEStream<T = unknown>(
  options: UseSSEStreamOptions = {}
) {
  const { timeout = 120_000 } = options;

  const [state, setState] = useState<UseSSEStreamState<T>>({
    status: "idle",
    progress: null,
    result: null,
    error: null,
  });

  const abortRef = useRef<AbortController | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimeoutTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const startTimeout = useCallback(() => {
    clearTimeoutTimer();
    timeoutRef.current = setTimeout(() => {
      abortRef.current?.abort();
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "处理超时，请重试或减少文本量。",
      }));
    }, timeout);
  }, [timeout, clearTimeoutTimer]);

  const start = useCallback(
    async (url: string, body: unknown) => {
      // Abort any previous request
      abortRef.current?.abort();
      clearTimeoutTimer();

      const controller = new AbortController();
      abortRef.current = controller;

      setState({
        status: "loading",
        progress: null,
        result: null,
        error: null,
      });

      startTimeout();

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        // Handle non-200 responses (not SSE streams)
        if (!response.ok || !response.headers.get("content-type")?.includes("text/event-stream")) {
          const errorData = await response.json().catch(() => null);
          const errorMsg =
            errorData?.error || `服务器错误 (${response.status})`;
          setState({
            status: "error",
            progress: null,
            result: null,
            error: errorMsg,
          });
          return;
        }

        // Read SSE stream
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error("无法读取响应流");
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          // Parse SSE events from buffer
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || ""; // Keep incomplete chunk

          for (const line of lines) {
            const dataPrefix = "data: ";
            if (!line.startsWith(dataPrefix)) continue;

            const jsonStr = line.slice(dataPrefix.length);
            try {
              const event = JSON.parse(jsonStr);

              if (event.type === "progress") {
                setState((prev) => ({
                  ...prev,
                  progress: event.data as PipelineProgress,
                }));
                // Reset timeout on each progress event
                startTimeout();
              } else if (event.type === "result") {
                clearTimeoutTimer();
                setState({
                  status: "done",
                  progress: { stage: "done", message: "处理完成", current: 1, total: 1 },
                  result: event.data as T,
                  error: null,
                });
              } else if (event.type === "error") {
                clearTimeoutTimer();
                setState({
                  status: "error",
                  progress: null,
                  result: null,
                  error: event.message || "未知错误",
                });
              }
            } catch {
              // Skip malformed SSE lines
            }
          }
        }
      } catch (error: unknown) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return; // Aborted intentionally
        }
        clearTimeoutTimer();
        setState({
          status: "error",
          progress: null,
          result: null,
          error:
            error instanceof Error
              ? error.message
              : "网络连接失败，请检查网络后重试。",
        });
      }
    },
    [timeout, startTimeout, clearTimeoutTimer]
  );

  const abort = useCallback(() => {
    abortRef.current?.abort();
    clearTimeoutTimer();
  }, [clearTimeoutTimer]);

  return { ...state, start, abort };
}

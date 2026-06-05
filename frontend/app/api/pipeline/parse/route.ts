// ============================================================
// POST /api/pipeline/parse — AI chapter parsing with SSE stream
// ============================================================

import { NextRequest } from "next/server";
import { aiParseChapters } from "@/lib/pipeline/parse-stage";
import type { PipelineProgress } from "@/lib/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language, apiKey } = body as {
      text?: string;
      language?: string;
      apiKey?: string;
    };

    // Validate
    if (!text || !text.trim()) {
      return Response.json(
        { error: "上传的文本为空。" },
        { status: 400 }
      );
    }

    if (text.length > 500_000) {
      return Response.json(
        { error: "文本过长（超过 50 万字），请分批次处理。" },
        { status: 400 }
      );
    }

    // Check API key: prefer request body key, fallback to env var
    const resolvedApiKey = apiKey?.trim() || process.env.DEEPSEEK_API_KEY;
    if (!resolvedApiKey) {
      return Response.json(
        {
          error:
            "未配置 DeepSeek API Key。请在页面中输入你的 API Key，或在 .env.local 中设置 DEEPSEEK_API_KEY。",
        },
        { status: 500 }
      );
    }

    // Create SSE stream
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendEvent = (event: {
          type: string;
          data?: unknown;
          message?: string;
        }) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
          );
        };

        const onProgress = (p: PipelineProgress) => {
          sendEvent({ type: "progress", data: p });
        };

        try {
          const chapters = await aiParseChapters(
            text,
            language || "zh-CN",
            onProgress,
            resolvedApiKey
          );

          sendEvent({ type: "result", data: { chapters } });
        } catch (error: unknown) {
          const message =
            error instanceof Error ? error.message : "未知错误";
          sendEvent({ type: "error", message });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch {
    return Response.json(
      { error: "请求解析失败。" },
      { status: 400 }
    );
  }
}

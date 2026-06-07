// ============================================================
// POST /api/pipeline/generate — AI script generation with SSE stream
// ============================================================

import { NextRequest } from "next/server";
import { aiGenerateScript } from "@/lib/pipeline/generate-stage";
import type { ChapterSummary, PipelineProgress } from "@/lib/pipeline/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      chapters,
      scriptType,
      title,
      language,
      fileName,
      enableShots,
      apiKey,
    } = body as {
      chapters?: ChapterSummary[];
      scriptType?: string;
      title?: string;
      language?: string;
      fileName?: string;
      enableShots?: boolean;
      apiKey?: string;
    };

    // Validate
    if (!chapters || chapters.length === 0) {
      return Response.json(
        { error: "未提供章节数据，请返回上一步重新解析。" },
        { status: 400 }
      );
    }

    if (!scriptType) {
      return Response.json(
        { error: "未指定剧本类型。" },
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
          const script = await aiGenerateScript(
            chapters,
            {
              scriptType: scriptType || "short_drama",
              title: title || "未命名剧本",
              language: language || "zh-CN",
              fileName,
              enableShots,
              apiKey: resolvedApiKey,
            },
            onProgress
          );

          sendEvent({ type: "result", data: { script } });
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

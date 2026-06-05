// ============================================================
// AI Client Wrapper — DeepSeek via OpenAI-compatible SDK
// ============================================================

import OpenAI from "openai";

// ---- Configuration ----

function getClient(apiKeyOverride?: string): OpenAI {
  const apiKey = apiKeyOverride || process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error(
      "未配置 DeepSeek API Key。请在页面中输入你的 API Key，或在 .env.local 中设置 DEEPSEEK_API_KEY。"
    );
  }

  return new OpenAI({
    apiKey,
    baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
  });
}

const MODEL = process.env.DEEPSEEK_MODEL || "deepseek-chat";
const MAX_OUTPUT_TOKENS = parseInt(
  process.env.AI_MAX_TOKENS || "16000",
  10
);

// ---- Retry Configuration ----

const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000]; // ms, exponential

// ---- Token Estimation ----

/** Conservative estimate for Chinese text: ~0.5 tokens per character */
export function estimateTokens(text: string): number {
  // Chinese characters ~= 0.5 tokens each
  // ASCII ~= 0.25 tokens each
  let tokens = 0;
  for (const char of text) {
    tokens += /[一-鿿㐀-䶿]/.test(char) ? 0.5 : 0.25;
  }
  return Math.ceil(tokens);
}

/** Maximum characters per chunk (est. ~4000 tokens worth of Chinese) */
const MAX_CHUNK_CHARS = 8000;

// ---- Core AI Call ----

export interface AiGenerateParams {
  systemPrompt: string;
  userMessage: string;
  /** If provided, enables JSON mode and validates against this schema */
  outputIsJson?: boolean;
  maxTokens?: number;
  /** Override API key (from UI config), falls back to DEEPSEEK_API_KEY env var */
  apiKey?: string;
}

/**
 * Call DeepSeek with retry logic.
 * Uses JSON mode when outputIsJson is true.
 */
export async function aiGenerate<T = string>(
  params: AiGenerateParams
): Promise<T> {
  const { systemPrompt, userMessage, outputIsJson, maxTokens, apiKey } = params;
  const client = getClient(apiKey);

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.chat.completions.create({
        model: MODEL,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.3, // Low temperature for structured output
        max_tokens: maxTokens || MAX_OUTPUT_TOKENS,
        ...(outputIsJson
          ? { response_format: { type: "json_object" as const } }
          : {}),
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("AI 返回空响应");
      }

      if (outputIsJson) {
        try {
          return JSON.parse(content) as T;
        } catch {
          // JSON parse failed — if we have retries left, retry with stronger instruction
          if (attempt < MAX_RETRIES) {
            // Will be caught below and retried
            throw new Error("AI 返回了无效的 JSON 格式");
          }
          throw new Error("AI 返回格式异常（非有效 JSON），请重试。");
        }
      }

      return content as unknown as T;
    } catch (error: unknown) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on JSON parse errors with stronger prompt
      if (
        lastError.message.includes("JSON") &&
        attempt >= MAX_RETRIES
      ) {
        throw lastError;
      }

      // Don't retry on auth errors
      if (
        lastError.message.includes("401") ||
        lastError.message.includes("403") ||
        lastError.message.includes("API Key")
      ) {
        throw lastError;
      }

      // Retry on rate limits and server errors
      if (attempt < MAX_RETRIES) {
        const delay = RETRY_DELAYS[attempt] || 2000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
    }
  }

  throw lastError || new Error("AI 调用失败");
}

/**
 * Process text that may be too long for a single AI call.
 * Splits into chunks, processes each, merges results.
 */
export async function aiGenerateChunked<T>(
  chunkFn: (chunk: string, index: number, total: number) => Promise<T>,
  text: string
): Promise<T[]> {
  if (text.length <= MAX_CHUNK_CHARS) {
    return [await chunkFn(text, 0, 1)];
  }

  // Split into chunks at paragraph boundaries
  const paragraphs = text.split(/\n\s*\n/);
  const chunks: string[] = [];
  let current = "";

  for (const para of paragraphs) {
    if (
      current.length + para.length > MAX_CHUNK_CHARS &&
      current.length > 0
    ) {
      chunks.push(current.trim());
      current = para;
    } else {
      current += (current ? "\n\n" : "") + para;
    }
  }
  if (current.trim()) {
    chunks.push(current.trim());
  }

  const results: T[] = [];
  for (let i = 0; i < chunks.length; i++) {
    results.push(await chunkFn(chunks[i], i, chunks.length));
  }

  return results;
}

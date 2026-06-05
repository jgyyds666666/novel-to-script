// ============================================================
// Phase 1: AI Chapter Parsing
// Splits novel text into chapters, extracts structured summaries
// ============================================================

import {
  aiGenerate,
  aiGenerateChunked,
  estimateTokens,
} from "./ai-client";
import {
  CHAPTER_PARSING_SYSTEM_PROMPT,
  PARSE_FEW_SHOT_USER,
  PARSE_FEW_SHOT_ASSISTANT,
} from "./prompts";
import type {
  ChapterSummary,
  PipelineProgress,
} from "./types";

// ---- Regex Pre-splitting ----

interface RawChapter {
  chapter_number: number;
  title?: string;
  content: string;
}

/**
 * Fast regex-based splitting to identify chapter boundaries.
 * This is deterministic and free — AI only processes individual chapters.
 */
function splitIntoChapters(text: string): RawChapter[] {
  const chapterPattern =
    /(?:^|\n)\s*(第[一二三四五六七八九十百千\d]+[章回]|Chapter\s*\d+|CHAPTER\s*\d+|卷[一二三四五六七八九十百千\d]+|篇[一二三四五六七八九十百千\d]+)[：:\s]*([^\n]*)/gi;

  const matches: { index: number; marker: string; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chapterPattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      marker: match[1].trim(),
      title: match[2]?.trim() || "",
    });
  }

  // No markers: entire text as one chapter
  if (matches.length === 0) {
    return [{ chapter_number: 1, content: text.trim() }];
  }

  const chapters: RawChapter[] = [];

  // Prologue text before first chapter
  if (matches[0].index > 0) {
    const preText = text.slice(0, matches[0].index).trim();
    if (preText.length > 50) {
      chapters.push({
        chapter_number: 0,
        title: "序言/前言",
        content: preText,
      });
    }
  }

  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextMatch = matches[i + 1];
    const startPos = current.index;
    const endPos = nextMatch ? nextMatch.index : text.length;
    const chapterText = text.slice(startPos, endPos).trim();

    const label = current.title
      ? `${current.marker} — ${current.title}`
      : current.marker;

    chapters.push({
      chapter_number: chapters.length + (chapters[0]?.chapter_number === 0 ? 1 : 1) + i - (chapters[0]?.chapter_number === 0 ? 1 : 0),
      title: label,
      content: chapterText,
    });
  }

  // Fix chapter numbers
  chapters.forEach((ch, idx) => {
    ch.chapter_number = idx;
  });

  return chapters;
}

// ---- AI Parsing ----

interface ParseResult {
  chapters: ChapterSummary[];
}

/**
 * Parse a single chapter using AI.
 */
async function parseOneChapter(
  raw: RawChapter,
  index: number,
  total: number,
  language: string
): Promise<ChapterSummary> {
  const userMessage = [
    `请分析以下小说片段（这是第 ${index + 1}/${total} 章）：`,
    "",
    raw.content.slice(0, 6000), // Limit to ~6000 chars per chapter
    "",
    `语言：${language}`,
  ].join("\n");

  const result = await aiGenerate<ParseResult>({
    systemPrompt: CHAPTER_PARSING_SYSTEM_PROMPT,
    userMessage,
    outputIsJson: true,
    maxTokens: 8000,
  });

  // The AI returns { chapters: [...] }, we take the first (and usually only) chapter
  const chapter = result.chapters?.[0];
  if (!chapter) {
    throw new Error(`AI 未能解析第 ${index + 1} 章`);
  }

  return {
    ...chapter,
    chapter_number: raw.chapter_number,
    title: chapter.title || raw.title,
    content: raw.content,
  };
}

// ---- Public API ----

/**
 * Parse novel text into chapter summaries using AI.
 * Reports progress via onProgress callback for SSE streaming.
 */
export async function aiParseChapters(
  text: string,
  language: string,
  onProgress: (p: PipelineProgress) => void
): Promise<ChapterSummary[]> {
  // Step 1: Regex split
  onProgress({
    stage: "splitting",
    message: "正在切分章节...",
    current: 0,
    total: 0,
  });

  const rawChapters = splitIntoChapters(text);

  onProgress({
    stage: "splitting",
    message: `已识别 ${rawChapters.length} 个章节`,
    current: rawChapters.length,
    total: rawChapters.length,
  });

  // Step 2: AI parse each chapter
  const summaries: ChapterSummary[] = [];

  for (let i = 0; i < rawChapters.length; i++) {
    onProgress({
      stage: "parsing",
      message: `正在分析第 ${i + 1}/${rawChapters.length} 章：${rawChapters[i].title || "无标题"}`,
      current: i + 1,
      total: rawChapters.length,
    });

    const summary = await parseOneChapter(
      rawChapters[i],
      i,
      rawChapters.length,
      language
    );
    summaries.push(summary);
  }

  onProgress({
    stage: "done",
    message: `章节解析完成，共 ${summaries.length} 章`,
    current: summaries.length,
    total: summaries.length,
  });

  return summaries;
}

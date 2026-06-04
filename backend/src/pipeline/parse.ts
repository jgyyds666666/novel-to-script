// ============================================================
// Phase 1: Chapter Parsing
// Splits novel text into chapters, extracts structured summaries
// ============================================================

import type { NovelInput, ChapterSummary } from "../types";

/**
 * Parse raw novel text into per-chapter structured summaries.
 * This is Phase 1 of the 4-phase pipeline.
 *
 * Responsibilities:
 * - Split text into chapters (by chapter markers or heuristics)
 * - Extract plot events per chapter
 * - Identify characters mentioned
 * - Extract dialogue segments with speaker inference
 * - Identify raw scene candidates (location/time hints)
 */
export async function parseNovel(input: NovelInput): Promise<ChapterSummary[]> {
  // TODO: Implement chapter splitting and per-chapter AI extraction
  const chapters = splitIntoChapters(input.text);

  const summaries: ChapterSummary[] = [];

  for (let i = 0; i < chapters.length; i++) {
    // Placeholder — each chapter will be processed in parallel in the real impl
    summaries.push({
      chapter_number: i + 1,
      paragraph_count: countParagraphs(chapters[i]),
      plot_events: [],
      characters_mentioned: [],
      dialogue_segments: [],
      scenes_identified: [],
    });
  }

  return summaries;
}

/** Split full text into chapters by common chapter markers */
function splitIntoChapters(text: string): string[] {
  // Match patterns like "第X章", "Chapter X", "CHAPTER X", etc.
  const chapterPattern =
    /(?:^|\n)(?:第[一二三四五六七八九十百千\d]+章|Chapter\s+\d+|CHAPTER\s+\d+)/gi;

  const segments = text.split(chapterPattern).filter((s) => s.trim().length > 0);

  // If no chapter markers found, treat entire text as one segment
  if (segments.length <= 1) {
    // Try to split by large gaps or volume markers
    return [text];
  }

  return segments;
}

/** Count paragraphs (separated by blank lines) */
function countParagraphs(text: string): number {
  return text.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
}

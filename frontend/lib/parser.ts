// ============================================================
// Client-side Chapter Parser (MVP — regex-based)
// @deprecated Use AI pipeline at /api/pipeline/parse instead.
//   Kept for backward compatibility and type exports.
// ============================================================

export interface ParsedChapter {
  index: number;
  title: string;
  content: string;
  paragraphCount: number;
  charCount: number;
  /** First 200 chars as preview */
  preview: string;
}

export interface ParseResult {
  chapters: ParsedChapter[];
  totalParagraphs: number;
  totalChars: number;
}

/**
 * Split novel text into chapters using regex pattern matching.
 * Supports Chinese (第X章) and English (Chapter X) markers.
 * @deprecated Use AI-powered apiParseChapters via /api/pipeline/parse instead.
 */
export function parseChapters(text: string): ParseResult {
  if (!text.trim()) {
    return { chapters: [], totalParagraphs: 0, totalChars: 0 };
  }

  // Combined pattern for Chinese and English chapter markers
  const chapterPattern =
    /(?:^|\n)[#\s]*(第[一二三四五六七八九十百千\d]+章|Chapter\s*\d+|CHAPTER\s*\d+)[：:\s]*(.*?)(?=\n|$)/gi;

  const matches: { index: number; marker: string; title: string }[] = [];
  let match: RegExpExecArray | null;

  while ((match = chapterPattern.exec(text)) !== null) {
    matches.push({
      index: match.index,
      marker: match[1].trim(),
      title: match[2]?.trim() || "",
    });
  }

  // If no chapter markers found, treat entire text as one chapter
  if (matches.length === 0) {
    const chapter = buildChapter(text, 0, "全文");
    return {
      chapters: [chapter],
      totalParagraphs: chapter.paragraphCount,
      totalChars: chapter.charCount,
    };
  }

  // Split text by chapter boundaries
  const chapters: ParsedChapter[] = [];
  for (let i = 0; i < matches.length; i++) {
    const current = matches[i];
    const nextMatch = matches[i + 1];
    const startPos = current.index;
    const endPos = nextMatch ? nextMatch.index : text.length;
    const chapterText = text.slice(startPos, endPos).trim();

    const label = current.title
      ? `${current.marker} — ${current.title}`
      : current.marker;

    chapters.push(buildChapter(chapterText, i, label));
  }

  // Check if there's text before the first chapter marker (prologue/preface)
  if (matches.length > 0 && matches[0].index > 0) {
    const preText = text.slice(0, matches[0].index).trim();
    if (preText.length > 100) {
      const prologue = buildChapter(preText, -1, "序言/前言");
      chapters.unshift(prologue);
      // Re-index
      chapters.forEach((ch, idx) => {
        ch.index = idx;
      });
    }
  }

  return {
    chapters,
    totalParagraphs: chapters.reduce((sum, ch) => sum + ch.paragraphCount, 0),
    totalChars: chapters.reduce((sum, ch) => sum + ch.charCount, 0),
  };
}

function buildChapter(text: string, index: number, label: string): ParsedChapter {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const preview = text.replace(/\s+/g, " ").slice(0, 200);

  return {
    index,
    title: label,
    content: text,
    paragraphCount: paragraphs.length,
    charCount: text.length,
    preview,
  };
}

/** SessionStorage keys for passing data between upload pages */
export const STORAGE_KEYS = {
  NOVEL_TEXT: "novel-to-script:text",
  NOVEL_META: "novel-to-script:meta",
} as const;

export interface UploadMeta {
  fileName: string;
  scriptType: string;
  language: string;
  title: string;
}

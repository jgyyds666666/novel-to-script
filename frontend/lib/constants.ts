// ============================================================
// Novel-to-Script — Application Constants
// ============================================================

export const APP_NAME = "Novel to Script";
export const APP_DESCRIPTION = "AI 小说转剧本工具";

/** Supported input text encodings */
export const SUPPORTED_ENCODINGS = ["utf-8", "utf-16"] as const;

/** Max novel text length (characters) for processing */
export const MAX_INPUT_LENGTH = 500_000;

/** Estimated max tokens per chapter for individual processing */
export const MAX_TOKENS_PER_CHAPTER = 8000;

/** Supported export formats */
export const EXPORT_FORMATS = ["yaml", "json", "fountain"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

/** Script type display labels */
export const SCRIPT_TYPE_LABELS: Record<string, string> = {
  movie: "电影",
  tv_series: "电视剧",
  short_drama: "短剧",
};

/** Character role display labels */
export const CHARACTER_ROLE_LABELS: Record<string, string> = {
  protagonist: "主角",
  antagonist: "反派",
  supporting: "配角",
  minor: "次要角色",
};

/** Attribution confidence display labels */
export const CONFIDENCE_LABELS: Record<string, string> = {
  high: "高",
  medium: "中",
  low: "低",
};

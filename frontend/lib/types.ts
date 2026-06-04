// ============================================================
// Novel-to-Script — TypeScript Type Definitions
// Mirrors the YAML Schema defined in docs/SCHEMA-RFC.md
// ============================================================

// ---- Enums ----

export type ScriptType = "movie" | "tv_series" | "short_drama";

export type CharacterRole =
  | "protagonist"
  | "antagonist"
  | "supporting"
  | "minor";

export type AttributionConfidence = "high" | "medium" | "low";

export type AdaptationNoteType =
  | "internal_monologue_conversion"
  | "narrative_summary_adaptation"
  | "description_to_action"
  | "exposition_redistribution"
  | "pacing_adjustment"
  | "dialogue_synthesis"
  | "character_merging"
  | "scene_splitting"
  | "other";

export type UncertaintyType =
  | "dialogue_attribution"
  | "ending_ambiguity"
  | "character_motivation"
  | "timeline_gap"
  | "tone_shift"
  | "scene_boundary"
  | "dialogue_content"
  | "cultural_specific";

export type UncertaintySeverity = "high" | "medium" | "low";

export type ShotType = "CLOSE UP" | "MEDIUM SHOT" | "WIDE SHOT" | "LONG SHOT" | string;

// ---- Meta ----

export interface ScriptMeta {
  /** 剧本名称 */
  title: string;
  /** 目标脚本类型 */
  script_type: ScriptType;
  /** 原著小说标题 */
  source_title: string;
  /** 原著作者 */
  source_author?: string;
  /** 原著章节数 */
  source_chapters?: number;
  /** BCP 47 语言标签 */
  language: string;
  /** Schema 版本 */
  version: string;
  /** 生成工具标识 */
  generated_by: string;
  /** ISO 8601 时间戳 */
  generated_at: string;
}

// ---- Character ----

export interface CharacterRelationship {
  /** 关联角色 ID */
  to: string;
  /** 关系类型 */
  type: string;
  /** 关系动态描述 */
  dynamic?: string;
}

export interface Character {
  /** 全局唯一标识符 */
  id: string;
  /** 显示名称 */
  name: string;
  /** 角色定位 */
  role: CharacterRole;
  /** 别名/昵称 */
  aliases?: string[];
  /** 性格特征 */
  traits: string[];
  /** 角色弧光 */
  arc?: string;
  /** 与其他角色的关系 */
  relationships?: CharacterRelationship[];
  /** 编剧备注 */
  notes?: string;
  /** 原著引用 */
  source_refs?: string[];
}

// ---- Content Blocks ----

export interface ActionBlock {
  type: "action";
  /** 可拍摄的动作描述 */
  text: string;
  source_ref?: string;
}

export interface DialogueBlock {
  type: "dialogue";
  /** 说话者 ID 或名称 */
  character: string;
  /** 台词 */
  line: string;
  /** AI 归属置信度 */
  attribution_confidence: AttributionConfidence;
  /** 表演提示（parenthetical） */
  delivery?: string;
  source_ref?: string;
}

export interface VoiceoverBlock {
  type: "voiceover";
  /** 画外音角色 */
  character: string;
  /** 画外音文本 */
  line: string;
  source_ref?: string;
  adaptation_rationale?: string;
}

export interface MontageBlock {
  type: "montage";
  /** 蒙太奇概述 */
  description: string;
  /** 蒙太奇子场景 */
  beats: string[];
  /** 配乐建议 */
  music_suggestion?: string;
  source_ref?: string;
}

export interface TransitionBlock {
  type: "transition";
  /** 转场类型，如 "CUT TO:", "FADE OUT." */
  value: string;
}

export interface ShotBlock {
  type: "shot";
  /** 景别 */
  shot_type: ShotType;
  /** 拍摄对象 */
  subject: string;
  /** 镜头内动作 */
  description: string;
  source_ref?: string;
}

export type ContentBlock =
  | ActionBlock
  | DialogueBlock
  | VoiceoverBlock
  | MontageBlock
  | TransitionBlock
  | ShotBlock;

// ---- Scene ----

export interface Scene {
  /** 全局唯一场景 ID */
  id: string;
  /** 场景标题 (Fountain 格式) */
  heading: string;
  /** 拍摄地点 */
  location?: string;
  /** 时间 */
  time_of_day?: string;
  /** 内景/外景 */
  interior?: boolean;
  /** 出场人物 ID 列表 */
  characters_present?: string[];
  /** 场景概要 */
  summary?: string;
  /** 对应原著段落 */
  source_ref?: string;
  /** 有序内容块 */
  content: ContentBlock[];
}

// ---- Structure ----

export interface SequenceRef {
  sequence: number;
  title?: string;
  scene_ids: string[];
}

export interface ActRef {
  act: number;
  title?: string;
  sequences?: SequenceRef[];
  /** 无 Sequence 层级时直接引用场景 */
  scene_ids?: string[];
}

export interface MovieStructure {
  type: "movie";
  acts: ActRef[];
}

export interface EpisodeActRef {
  act: number;
  scene_ids: string[];
}

export interface EpisodeRef {
  episode: number;
  title?: string;
  cold_open?: { scene_ids: string[] };
  acts?: EpisodeActRef[];
  /** 短剧或简单结构直接引用场景 */
  scene_ids?: string[];
}

export interface SeasonRef {
  season: number;
  episodes: EpisodeRef[];
}

export interface TvSeriesStructure {
  type: "tv_series";
  seasons: SeasonRef[];
}

export interface ShortDramaStructure {
  type: "short_drama";
  episodes: EpisodeRef[];
}

export type Structure = MovieStructure | TvSeriesStructure | ShortDramaStructure;

// ---- Adaptation Metadata ----

export interface AdaptationNote {
  id: string;
  source_ref?: string;
  /** 改写类型 */
  type: AdaptationNoteType;
  /** 原文片段 */
  original: string;
  /** 改写结果 */
  converted_to: string;
  /** 改写理由 */
  rationale: string;
  /** AI 自信度 */
  confidence: AttributionConfidence;
}

export interface UncertaintyFlag {
  id: string;
  source_ref?: string;
  /** 关联场景 ID */
  scene_ref?: string;
  type: UncertaintyType;
  severity: UncertaintySeverity;
  description: string;
  /** 备选方案 */
  suggestions?: string[];
}

export interface AdaptationReport {
  source_chapters_processed: number;
  total_scenes: number;
  total_characters: number;
  total_dialogue_lines: number;
  uncertainty_count: number;
  adaptation_note_count: number;
  generated_at: string;
  summary: string;
}

// ---- Top-Level Script ----

export interface Script {
  meta: ScriptMeta;
  characters: Character[];
  structure: Structure;
  scenes: Scene[];
  adaptation_notes?: AdaptationNote[];
  uncertainty_flags?: UncertaintyFlag[];
  adaptation_report?: AdaptationReport;
}

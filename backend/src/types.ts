// ============================================================
// Backend — Shared Type Definitions
// Mirrors the YAML Schema: docs/SCHEMA-RFC.md
// ============================================================

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

export type ShotType = string;

// ---- Content Blocks ----

export interface ActionBlock {
  type: "action";
  text: string;
  source_ref?: string;
}

export interface DialogueBlock {
  type: "dialogue";
  character: string;
  line: string;
  attribution_confidence: AttributionConfidence;
  delivery?: string;
  source_ref?: string;
}

export interface VoiceoverBlock {
  type: "voiceover";
  character: string;
  line: string;
  source_ref?: string;
  adaptation_rationale?: string;
}

export interface MontageBlock {
  type: "montage";
  description: string;
  beats: string[];
  music_suggestion?: string;
  source_ref?: string;
}

export interface TransitionBlock {
  type: "transition";
  value: string;
}

export interface ShotBlock {
  type: "shot";
  shot_type: ShotType;
  subject: string;
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
  id: string;
  heading: string;
  location?: string;
  time_of_day?: string;
  interior?: boolean;
  characters_present?: string[];
  summary?: string;
  source_ref?: string;
  content: ContentBlock[];
}

// ---- Character ----

export interface CharacterRelationship {
  to: string;
  type: string;
  dynamic?: string;
}

export interface Character {
  id: string;
  name: string;
  role: CharacterRole;
  aliases?: string[];
  traits: string[];
  arc?: string;
  relationships?: CharacterRelationship[];
  notes?: string;
  source_refs?: string[];
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
  type: AdaptationNoteType;
  original: string;
  converted_to: string;
  rationale: string;
  confidence: AttributionConfidence;
}

export interface UncertaintyFlag {
  id: string;
  source_ref?: string;
  scene_ref?: string;
  type: UncertaintyType;
  severity: UncertaintySeverity;
  description: string;
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

// ---- Top-Level ----

export interface Script {
  meta: ScriptMeta;
  characters: Character[];
  structure: Structure;
  scenes: Scene[];
  adaptation_notes?: AdaptationNote[];
  uncertainty_flags?: UncertaintyFlag[];
  adaptation_report?: AdaptationReport;
}

export interface ScriptMeta {
  title: string;
  script_type: ScriptType;
  source_title: string;
  source_author?: string;
  source_chapters?: number;
  language: string;
  version: string;
  generated_by: string;
  generated_at: string;
}

// ---- Pipeline Types ----

/** Raw novel input */
export interface NovelInput {
  /** Full novel text */
  text: string;
  /** Target script type */
  script_type: ScriptType;
  /** Language */
  language: string;
  /** Optional title override */
  title?: string;
  /** Optional author */
  author?: string;
}

/** Chapter-level parse result */
export interface ChapterSummary {
  chapter_number: number;
  title?: string;
  paragraph_count: number;
  /** Key plot events */
  plot_events: string[];
  /** Characters appearing in this chapter */
  characters_mentioned: string[];
  /** Key dialogue segments extracted */
  dialogue_segments: DialogueSegment[];
  /** Scene-level breakdown */
  scenes_identified: RawSceneCandidate[];
}

/** Raw dialogue segment from novel text */
export interface DialogueSegment {
  /** The quoted text */
  text: string;
  /** Inferred speaker (may be null) */
  speaker: string | null;
  /** Paragraph reference */
  paragraph_index: number;
  /** Attribution confidence */
  confidence: AttributionConfidence;
}

/** Raw scene candidate before AI refinement */
export interface RawSceneCandidate {
  /** Paragraph range */
  paragraph_range: string;
  /** Inferred location */
  location_hint: string | null;
  /** Time of day hint */
  time_hint: string | null;
  /** Interior/exterior hint */
  interior_hint: boolean | null;
  /** Summary of what happens */
  summary: string;
}

/** Global analysis result (phase 2 aggregation) */
export interface GlobalAnalysis {
  /** All identified characters with profiles */
  characters: Character[];
  /** Main conflict line */
  main_conflict: string;
  /** Themes identified */
  themes: string[];
  /** Foreshadowing / setups to preserve */
  setups_to_preserve: string[];
  /** Suggested structure outline */
  structure_outline: Structure;
}

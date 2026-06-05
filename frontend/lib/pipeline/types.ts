// ============================================================
// Pipeline-specific types for AI processing stages
// ============================================================

import type { Character, Structure } from "../types";

// ---- Pipeline Input ----

/** Raw novel input for the pipeline */
export interface NovelInput {
  text: string;
  script_type: string;
  language: string;
  title?: string;
  author?: string;
}

// ---- Phase 1: Chapter Parsing ----

/** Raw dialogue segment from novel text */
export interface DialogueSegment {
  text: string;
  speaker: string | null;
  paragraph_index: number;
  confidence: "high" | "medium" | "low";
}

/** Raw scene candidate before AI refinement */
export interface RawSceneCandidate {
  paragraph_range: string;
  location_hint: string | null;
  time_hint: string | null;
  interior_hint: boolean | null;
  summary: string;
}

/** Chapter-level parse result */
export interface ChapterSummary {
  chapter_number: number;
  title?: string;
  paragraph_count: number;
  plot_events: string[];
  characters_mentioned: string[];
  dialogue_segments: DialogueSegment[];
  scenes_identified: RawSceneCandidate[];
  /** Full text content of this chapter (for downstream processing) */
  content?: string;
}

// ---- Phase 2: Global Analysis (for future use) ----

export interface GlobalAnalysis {
  characters: Character[];
  main_conflict: string;
  themes: string[];
  setups_to_preserve: string[];
  structure_outline: Structure;
}

// ---- SSE Progress Events ----

export type PipelineStage =
  | "splitting"
  | "parsing"
  | "analyzing"
  | "generating"
  | "checking"
  | "done"
  | "error";

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
  current?: number;
  total?: number;
}

export interface SSEEvent {
  type: "progress" | "result" | "error";
  data: PipelineProgress | unknown;
  message?: string;
}

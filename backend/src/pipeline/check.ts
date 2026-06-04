// ============================================================
// Phase 4: Consistency Check
// Validates generated scenes for character voice, plot, and format
// ============================================================

import type { Scene, Character, AdaptationNote, UncertaintyFlag } from "../types";

export interface ConsistencyResult {
  /** Whether the script passes consistency checks */
  passed: boolean;
  /** Issues found */
  issues: ConsistencyIssue[];
  /** Adaptation notes generated during check */
  adaptation_notes: AdaptationNote[];
  /** Uncertainty flags */
  uncertainty_flags: UncertaintyFlag[];
}

export interface ConsistencyIssue {
  type: "character_voice" | "plot_continuity" | "format" | "pacing";
  severity: "error" | "warning";
  scene_ref?: string;
  description: string;
  suggestion?: string;
}

/**
 * Validate generated scenes for consistency.
 * This is Phase 4 of the 4-phase pipeline.
 *
 * Responsibilities:
 * - Check character voice consistency across scenes
 * - Verify plot continuity (no gaps or contradictions)
 * - Validate format compliance (headings, required fields)
 * - Flag pacing issues (too many/few scenes per act)
 * - Generate adaptation notes and uncertainty flags
 */
export async function checkConsistency(
  scenes: Scene[],
  characters: Character[]
): Promise<ConsistencyResult> {
  // TODO: AI-powered consistency validation
  return {
    passed: true,
    issues: [],
    adaptation_notes: [],
    uncertainty_flags: [],
  };
}

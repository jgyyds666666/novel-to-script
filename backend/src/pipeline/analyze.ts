// ============================================================
// Phase 2: Global Analysis
// Aggregates chapter summaries into global character arcs, themes, structure
// ============================================================

import type { ChapterSummary, GlobalAnalysis, Structure } from "../types";

/**
 * Aggregate all chapter summaries into a global analysis.
 * This is Phase 2 of the 4-phase pipeline.
 *
 * Responsibilities:
 * - Merge per-chapter character mentions into full character profiles
 * - Identify main conflict and themes
 * - Track foreshadowing across chapters
 * - Propose overall structure outline (acts/episodes)
 */
export async function analyzeGlobal(
  chapters: ChapterSummary[],
  scriptType: string
): Promise<GlobalAnalysis> {
  // TODO: AI-powered global aggregation
  return {
    characters: [],
    main_conflict: "",
    themes: [],
    setups_to_preserve: [],
    structure_outline: buildDefaultStructure(scriptType),
  };
}

/** Build a minimal default structure outline based on script type */
function buildDefaultStructure(scriptType: string): Structure {
  switch (scriptType) {
    case "movie":
      return {
        type: "movie",
        acts: [
          { act: 1, title: "建置", sequences: [] },
          { act: 2, title: "对抗", sequences: [] },
          { act: 3, title: "解决", sequences: [] },
        ],
      };
    case "tv_series":
      return {
        type: "tv_series",
        seasons: [{ season: 1, episodes: [] }],
      };
    case "short_drama":
      return {
        type: "short_drama",
        episodes: [],
      };
    default:
      return { type: "short_drama", episodes: [] };
  }
}

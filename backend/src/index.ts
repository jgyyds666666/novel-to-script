// ============================================================
// Backend — Pipeline Entry Point
// ============================================================

export * from "./types";

// Pipeline stages (to be implemented)
export { parseNovel } from "./pipeline/parse";
export { analyzeGlobal } from "./pipeline/analyze";
export { generateScenes } from "./pipeline/generate";
export { checkConsistency } from "./pipeline/check";

// Export utilities
export { toYaml } from "./export/yaml";
export { toFountain } from "./export/fountain";

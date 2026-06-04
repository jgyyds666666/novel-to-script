// ============================================================
// YAML Export
// Serializes Script object to YAML string
// ============================================================

import type { Script } from "../types";

/**
 * Convert a Script object to YAML string.
 * Uses js-yaml for serialization.
 */
export async function toYaml(script: Script): Promise<string> {
  const yaml = await import("js-yaml");
  return yaml.dump(script, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    sortKeys: false,
    quotingType: '"',
    forceQuotes: false,
  });
}

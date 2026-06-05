// ============================================================
// Phase 3: AI Script Generation
// Converts chapter summaries into screenplay Script
// ============================================================

import { aiGenerate } from "./ai-client";
import { SCENE_GENERATION_SYSTEM_PROMPT } from "./prompts";
import type { ChapterSummary, PipelineProgress } from "./types";
import type {
  Script,
  ScriptMeta,
  Scene,
  Character,
  Structure,
  AdaptationNote,
  UncertaintyFlag,
  AdaptationReport,
} from "../types";

// ---- Types for AI response ----

interface AIGenerationResult {
  characters: Character[];
  scenes: Scene[];
  adaptation_notes: AdaptationNote[];
  uncertainty_flags: UncertaintyFlag[];
}

// ---- Chapter Batching ----

const CHAPTERS_PER_BATCH = 3;

function batchChapters(
  chapters: ChapterSummary[]
): ChapterSummary[][] {
  const batches: ChapterSummary[][] = [];
  for (let i = 0; i < chapters.length; i += CHAPTERS_PER_BATCH) {
    batches.push(chapters.slice(i, i + CHAPTERS_PER_BATCH));
  }
  return batches;
}

// ---- AI Generation ----

async function generateScenesForBatch(
  batch: ChapterSummary[],
  batchIndex: number,
  totalBatches: number,
  scriptType: string,
  language: string,
  apiKey?: string
): Promise<AIGenerationResult> {
  // Build context from chapter summaries
  const chapterContext = batch
    .map((ch) => {
      const parts: string[] = [];
      const chapterLabel = ch.chapter_number === 0
        ? (ch.title || "序言")
        : `第 ${ch.chapter_number} 章${ch.title ? ` — ${ch.title}` : ""}`;
      parts.push(`### ${chapterLabel}`);
      parts.push(`情节点: ${ch.plot_events.join("；")}`);
      if (ch.characters_mentioned.length > 0) {
        parts.push(`出场角色: ${ch.characters_mentioned.join("、")}`);
      }
      if (ch.dialogue_segments.length > 0) {
        parts.push("对白片段:");
        ch.dialogue_segments.forEach((d) => {
          const speaker = d.speaker || "未知";
          parts.push(`  - [${speaker}][置信度:${d.confidence}] "${d.text}"`);
        });
      }
      if (ch.scenes_identified.length > 0) {
        parts.push("场景提示:");
        ch.scenes_identified.forEach((s) => {
          parts.push(
            `  - ${s.summary} (${s.location_hint || "未知地点"}, ${s.time_hint || "未知时间"})`
          );
        });
      }
      if (ch.content) {
        parts.push(`原文片段: ${ch.content.slice(0, 800)}`);
      }
      return parts.join("\n");
    })
    .join("\n\n---\n\n");

  const userMessage = [
    `请将以下小说章节改编为剧本格式（第 ${batchIndex + 1}/${totalBatches} 批）：`,
    "",
    `目标类型: ${scriptType}`,
    `语言: ${language}`,
    "",
    chapterContext,
    "",
    "请输出符合要求的 JSON。",
  ].join("\n");

  return aiGenerate<AIGenerationResult>({
    systemPrompt: SCENE_GENERATION_SYSTEM_PROMPT,
    userMessage,
    outputIsJson: true,
    maxTokens: 32000,
    apiKey,
  });
}

// ---- Structure Builder ----

function buildStructure(
  scriptType: string,
  scenes: Scene[]
): Structure {
  const sceneIds = scenes.map((s) => s.id);

  switch (scriptType) {
    case "movie": {
      const third = Math.ceil(sceneIds.length / 3);
      return {
        type: "movie",
        acts: [
          {
            act: 1,
            title: "建置",
            scene_ids: sceneIds.slice(0, third),
          },
          {
            act: 2,
            title: "对抗",
            scene_ids: sceneIds.slice(third, third * 2),
          },
          {
            act: 3,
            title: "解决",
            scene_ids: sceneIds.slice(third * 2),
          },
        ].filter((a) => a.scene_ids.length > 0),
      };
    }
    case "tv_series":
      return {
        type: "tv_series",
        seasons: [
          {
            season: 1,
            episodes: [
              {
                episode: 1,
                title: "第一集",
                scene_ids: sceneIds,
              },
            ],
          },
        ],
      };
    case "short_drama":
    default:
      return {
        type: "short_drama",
        episodes: sceneIds.map((id, i) => ({
          episode: i + 1,
          title: `第 ${i + 1} 集`,
          scene_ids: [id],
        })),
      };
  }
}

// ---- Deduplicate Characters ----

function deduplicateCharacters(
  allCharacters: Character[][]
): Character[] {
  const seen = new Map<string, Character>();

  for (const chars of allCharacters) {
    for (const char of chars) {
      const key = char.name || char.id;
      if (!seen.has(key)) {
        seen.set(key, char);
      } else {
        // Merge traits and source_refs
        const existing = seen.get(key)!;
        existing.traits = [
          ...new Set([...existing.traits, ...char.traits]),
        ];
        if (char.arc && !existing.arc) {
          existing.arc = char.arc;
        }
      }
    }
  }

  return Array.from(seen.values());
}

// ---- Public API ----

export interface GenerateOptions {
  scriptType: string;
  title: string;
  language: string;
  fileName?: string;
  apiKey?: string;
}

/**
 * Generate a screenplay Script from chapter summaries.
 * Reports progress via onProgress for SSE streaming.
 */
export async function aiGenerateScript(
  chapters: ChapterSummary[],
  options: GenerateOptions,
  onProgress: (p: PipelineProgress) => void
): Promise<Script> {
  const now = new Date().toISOString();

  const meta: ScriptMeta = {
    title: options.title || "未命名剧本",
    script_type: options.scriptType as ScriptMeta["script_type"],
    source_title: options.fileName || "",
    language: options.language,
    version: "0.2.0",
    generated_by: "novel-to-script (AI)",
    generated_at: now,
  };

  // Phase 1 (already done): chapters are parsed — skip to Phase 3

  // Phase 3: Generate scenes per batch
  onProgress({
    stage: "generating",
    message: "正在准备生成场景...",
    current: 0,
    total: chapters.length,
  });

  const batches = batchChapters(chapters);
  const allResults: AIGenerationResult[] = [];

  for (let b = 0; b < batches.length; b++) {
    onProgress({
      stage: "generating",
      message: `正在生成场景（第 ${b + 1}/${batches.length} 批）...`,
      current: b + 1,
      total: batches.length,
    });

    const result = await generateScenesForBatch(
      batches[b],
      b,
      batches.length,
      options.scriptType,
      options.language,
      options.apiKey
    );
    allResults.push(result);
  }

  // Merge results
  const allCharacters = allResults.map((r) => r.characters);
  const characters = deduplicateCharacters(allCharacters);

  const scenes = allResults.flatMap((r, batchIdx) =>
    r.scenes.map((s, sIdx) => ({
      ...s,
      id: s.id || `scene_${String(batchIdx * CHAPTERS_PER_BATCH + sIdx + 1).padStart(3, "0")}`,
    }))
  );

  // Re-index scene IDs
  scenes.forEach((s, i) => {
    s.id = `scene_${String(i + 1).padStart(3, "0")}`;
  });

  const adaptationNotes = allResults.flatMap(
    (r) => r.adaptation_notes || []
  );
  const uncertaintyFlags = allResults.flatMap(
    (r) => r.uncertainty_flags || []
  );

  // Assign IDs to notes and flags
  adaptationNotes.forEach((n, i) => {
    n.id = n.id || `note_${i + 1}`;
  });
  uncertaintyFlags.forEach((f, i) => {
    f.id = f.id || `flag_${i + 1}`;
  });

  // Build structure
  const structure = buildStructure(options.scriptType, scenes);

  // Total dialogue lines
  const totalDialogueLines = scenes.reduce(
    (sum, s) =>
      sum +
      s.content.filter((b) => b.type === "dialogue").length,
    0
  );

  const report: AdaptationReport = {
    source_chapters_processed: chapters.length,
    total_scenes: scenes.length,
    total_characters: characters.length,
    total_dialogue_lines: totalDialogueLines,
    uncertainty_count: uncertaintyFlags.length,
    adaptation_note_count: adaptationNotes.length,
    generated_at: now,
    summary: [
      `AI 深度改编完成：${chapters.length} 章 → ${scenes.length} 个场景。`,
      totalDialogueLines > 0
        ? `共生成 ${totalDialogueLines} 行对白。`
        : "",
      uncertaintyFlags.length > 0
        ? `${uncertaintyFlags.length} 处不确定标记需人工确认。`
        : "",
    ]
      .filter(Boolean)
      .join(""),
  };

  onProgress({
    stage: "done",
    message: `剧本生成完成：${scenes.length} 个场景，${totalDialogueLines} 行对白`,
    current: scenes.length,
    total: scenes.length,
  });

  return {
    meta,
    characters,
    structure,
    scenes,
    adaptation_notes: adaptationNotes,
    uncertainty_flags: uncertaintyFlags,
    adaptation_report: report,
  };
}

// ============================================================
// MVP Script Generator — Template-based
// Real AI deep rewrite will replace this in round 2
// ============================================================

import type { Script, ScriptMeta, Scene, ContentBlock, Structure, Character } from "./types";
import type { UploadMeta, ParsedChapter } from "./parser";

/**
 * Generate a basic Script from parsed chapters.
 * MVP: creates simple action-based scenes from chapter content.
 */
export function generateScript(
  chapters: ParsedChapter[],
  meta: UploadMeta
): Script {
  const now = new Date().toISOString();

  const scriptMeta: ScriptMeta = {
    title: meta.title || "未命名剧本",
    script_type: meta.scriptType as ScriptMeta["script_type"],
    source_title: meta.fileName,
    language: meta.language,
    version: "0.1.0",
    generated_by: "novel-to-script (MVP)",
    generated_at: now,
  };

  const characters: Character[] = buildPlaceholderCharacters(chapters);

  const scenes: Scene[] = chapters
    .filter((ch) => ch.index >= 0)
    .map((ch, idx) => buildScene(ch, idx, chapters.length));

  const structure: Structure = buildStructure(
    meta.scriptType as ScriptMeta["script_type"],
    scenes
  );

  return {
    meta: scriptMeta,
    characters,
    structure,
    scenes,
    adaptation_notes: [],
    uncertainty_flags: [],
    adaptation_report: {
      source_chapters_processed: chapters.length,
      total_scenes: scenes.length,
      total_characters: characters.length,
      total_dialogue_lines: 0,
      uncertainty_count: 0,
      adaptation_note_count: 0,
      generated_at: now,
      summary: `MVP 模板生成：${chapters.length} 章 → ${scenes.length} 个场景。真实 AI 深度改写将在第二轮实现。`,
    },
  };
}

function buildScene(chapter: ParsedChapter, index: number, total: number): Scene {
  const sceneId = `scene_${String(index + 1).padStart(3, "0")}`;

  // Simple scene heading from chapter title
  const heading = index === 0
    ? "INT. 开场场景 - 日"
    : index === total - 1
      ? "EXT. 结尾场景 - 黄昏"
      : `INT. 场景 ${index + 1} - 日`;

  const content: ContentBlock[] = [];

  // Add action from chapter preview
  content.push({
    type: "action",
    text: `[待 AI 深度改写] ${chapter.preview.slice(0, 300)}...`,
    source_ref: `ch${chapter.index + 1}`,
  });

  // Add a transition between scenes
  if (index < total - 1) {
    content.push({ type: "transition", value: "CUT TO:" });
  }

  return {
    id: sceneId,
    heading,
    summary: chapter.title,
    source_ref: `ch${chapter.index + 1}.p1-end`,
    content,
  };
}

function buildPlaceholderCharacters(chapters: ParsedChapter[]): Character[] {
  // MVP: return a minimal placeholder character
  return [
    {
      id: "char_protagonist",
      name: "主角",
      role: "protagonist",
      traits: ["[待 AI 分析]"],
      arc: "[待 AI 分析]",
      source_refs: chapters.slice(0, 1).map((_, i) => `ch${i + 1}`),
    },
  ];
}

function buildStructure(
  scriptType: ScriptMeta["script_type"],
  scenes: Scene[]
): Structure {
  const sceneIds = scenes.map((s) => s.id);

  switch (scriptType) {
    case "movie":
      return {
        type: "movie",
        acts: [
          { act: 1, title: "建置", scene_ids: sceneIds.slice(0, Math.ceil(sceneIds.length / 3)) },
          { act: 2, title: "对抗", scene_ids: sceneIds.slice(Math.ceil(sceneIds.length / 3), Math.ceil(2 * sceneIds.length / 3)) },
          { act: 3, title: "解决", scene_ids: sceneIds.slice(Math.ceil(2 * sceneIds.length / 3)) },
        ].filter((a) => a.scene_ids.length > 0),
      };
    case "tv_series":
      return {
        type: "tv_series",
        seasons: [
          {
            season: 1,
            episodes: [
              { episode: 1, title: "第一集", scene_ids: sceneIds },
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

import type { ChapterSummary } from "@/lib/pipeline/types";

interface ChapterCardProps {
  chapter: ChapterSummary;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  const dialogueCount = chapter.dialogue_segments?.length || 0;
  const sceneCount = chapter.scenes_identified?.length || 0;

  return (
    <div className="rounded-lg border p-4 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {chapter.chapter_number === 0
            ? (chapter.title || "序言/前言")
            : `第 ${chapter.chapter_number} 章`}
        </h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{chapter.paragraph_count} 段</span>
          {dialogueCount > 0 && <span>{dialogueCount} 句对白</span>}
          {sceneCount > 0 && <span>{sceneCount} 场景</span>}
        </div>
      </div>

      {chapter.title && (
        <p className="text-xs text-muted-foreground font-medium">
          {chapter.title}
        </p>
      )}

      {/* Characters */}
      {chapter.characters_mentioned?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {chapter.characters_mentioned.map((name, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
            >
              {name}
            </span>
          ))}
        </div>
      )}

      {/* Plot events */}
      {chapter.plot_events?.length > 0 && (
        <div className="space-y-0.5">
          {chapter.plot_events.slice(0, 3).map((event, i) => (
            <p
              key={i}
              className="text-xs text-muted-foreground line-clamp-1"
            >
              · {event}
            </p>
          ))}
          {chapter.plot_events.length > 3 && (
            <p className="text-xs text-muted-foreground">
              ...还有 {chapter.plot_events.length - 3} 个情节点
            </p>
          )}
        </div>
      )}
    </div>
  );
}

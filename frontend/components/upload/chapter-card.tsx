import type { ParsedChapter } from "@/lib/parser";

interface ChapterCardProps {
  chapter: ParsedChapter;
}

export function ChapterCard({ chapter }: ChapterCardProps) {
  return (
    <div className="rounded-lg border p-4 space-y-2 hover:border-primary/30 transition-colors">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-sm">
          {chapter.index >= 0 ? `第 ${chapter.index + 1} 章` : chapter.title}
        </h3>
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span>{chapter.paragraphCount} 段</span>
          <span>{chapter.charCount.toLocaleString()} 字</span>
        </div>
      </div>
      {chapter.title && chapter.index >= 0 && (
        <p className="text-xs text-muted-foreground">{chapter.title}</p>
      )}
      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
        {chapter.preview}
      </p>
    </div>
  );
}

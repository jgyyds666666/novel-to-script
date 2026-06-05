import { useState } from "react";
import yaml from "js-yaml";
import type { Script } from "@/lib/types";
import { SCRIPT_TYPE_LABELS } from "@/lib/constants";

interface ScriptPreviewProps {
  script: Script;
}

export function ScriptPreview({ script }: ScriptPreviewProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "scenes" | "yaml">("summary");

  const yamlString = yaml.dump(script, {
    indent: 2,
    lineWidth: 120,
    noRefs: true,
    quotingType: '"',
  });

  const handleDownload = () => {
    const blob = new Blob([yamlString], { type: "text/yaml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${script.meta.title || "script"}.yaml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const tabs = [
    { key: "summary" as const, label: "摘要" },
    { key: "scenes" as const, label: `场景 (${script.scenes.length})` },
    { key: "yaml" as const, label: "YAML" },
  ];

  return (
    <div className="space-y-4">
      {/* Tabs + download */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                activeTab === tab.key
                  ? "bg-background shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleDownload}
          className="inline-flex items-center gap-1.5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          ↓ 下载 YAML
        </button>
      </div>

      {activeTab === "summary" && <SummaryView script={script} />}
      {activeTab === "scenes" && <ScenesView script={script} />}
      {activeTab === "yaml" && (
        <pre className="max-h-[60vh] overflow-auto rounded-lg border bg-muted/30 p-4 text-xs leading-relaxed font-mono">
          {yamlString}
        </pre>
      )}
    </div>
  );
}

// ---- Summary Tab ----

function SummaryView({ script }: { script: Script }) {
  const report = script.adaptation_report;
  return (
    <div className="space-y-4">
      {/* Stats grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="剧本类型" value={SCRIPT_TYPE_LABELS[script.meta.script_type] || script.meta.script_type} />
        <StatCard label="场景数" value={String(report?.total_scenes ?? script.scenes.length)} />
        <StatCard label="人物数" value={String(script.characters.length)} />
        <StatCard label="对白行数" value={String(report?.total_dialogue_lines ?? 0)} />
      </div>

      {/* Report */}
      {report?.summary && (
        <div className="rounded-lg border p-4 space-y-1">
          <h4 className="text-sm font-medium">改编摘要</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">{report.summary}</p>
        </div>
      )}

      {/* Characters */}
      {script.characters.length > 0 && (
        <div className="rounded-lg border p-4 space-y-2">
          <h4 className="text-sm font-medium">人物表 ({script.characters.length})</h4>
          <div className="space-y-1.5">
            {script.characters.map((char) => (
              <div key={char.id} className="flex items-start gap-3 text-xs">
                <span className="font-medium min-w-[4rem]">{char.name}</span>
                <span className="text-muted-foreground capitalize">{char.role}</span>
                {char.traits.length > 0 && (
                  <span className="text-muted-foreground">· {char.traits.slice(0, 2).join("、")}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Uncertainty flags */}
      {(report?.uncertainty_count ?? 0) > 0 && (
        <div className="rounded-lg border border-warning/30 bg-warning/5 p-4 space-y-2">
          <h4 className="text-sm font-semibold text-warning">
            {report!.uncertainty_count} 处需人工确认
          </h4>
          <div className="space-y-1.5">
            {script.uncertainty_flags?.slice(0, 3).map((flag) => (
              <div key={flag.id} className="text-xs text-muted-foreground">
                <span className={`inline-block mr-1 ${flag.severity === "high" ? "text-destructive" : flag.severity === "medium" ? "text-warning" : "text-muted-foreground"}`}>
                  [{flag.severity}]
                </span>
                {flag.description}
              </div>
            ))}
            {(script.uncertainty_flags?.length ?? 0) > 3 && (
              <p className="text-xs text-muted-foreground">…还有 {script.uncertainty_flags!.length - 3} 处（见 YAML）</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---- Scenes Tab ----

function ScenesView({ script }: { script: Script }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="max-h-[60vh] overflow-y-auto space-y-2 pr-1">
      {script.scenes.map((scene) => {
        const dialogueCount = scene.content.filter((b) => b.type === "dialogue").length;
        const actionCount = scene.content.filter((b) => b.type === "action").length;
        const isOpen = expanded === scene.id;

        return (
          <div key={scene.id} className="rounded-lg border overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : scene.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="space-y-0.5">
                <p className="text-xs font-mono font-medium">{scene.heading}</p>
                {scene.summary && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{scene.summary}</p>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0 ml-4">
                {dialogueCount > 0 && <span>{dialogueCount} 句对白</span>}
                {actionCount > 0 && <span>{actionCount} 个动作</span>}
                <span className="text-muted-foreground/50">{isOpen ? "▲" : "▼"}</span>
              </div>
            </button>

            {isOpen && (
              <div className="border-t px-4 py-3 space-y-2 bg-muted/20">
                {scene.content.map((block, idx) => (
                  <SceneBlock key={idx} block={block} />
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SceneBlock({ block }: { block: { type: string; [key: string]: unknown } }) {
  if (block.type === "action") {
    return (
      <p className="text-xs text-muted-foreground leading-relaxed">
        {block.text as string}
      </p>
    );
  }
  if (block.type === "dialogue") {
    return (
      <div className="text-xs">
        <span className="font-medium">{block.character as string}</span>
        {block.delivery && (
          <span className="text-muted-foreground ml-1">({block.delivery as string})</span>
        )}
        <p className="mt-0.5 pl-3 border-l-2 border-primary/30">
          {block.line as string}
        </p>
      </div>
    );
  }
  if (block.type === "voiceover") {
    return (
      <div className="text-xs italic text-muted-foreground">
        <span className="font-medium not-italic">{block.character as string} (V.O.)</span>
        <p className="mt-0.5 pl-3">{block.line as string}</p>
      </div>
    );
  }
  if (block.type === "transition") {
    return (
      <p className="text-xs font-mono text-right text-muted-foreground">{block.value as string}</p>
    );
  }
  return null;
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border p-3 text-center">
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

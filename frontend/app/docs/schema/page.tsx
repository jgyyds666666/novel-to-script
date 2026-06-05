// ============================================================
// /docs/schema — Schema 参考文档页
// Renders the SCHEMA-RFC.md inline as styled HTML
// ============================================================

import { readFileSync } from "fs";
import { resolve } from "path";

/**
 * Minimal Markdown-to-HTML converter.
 * Handles headers, lists, code fences, bold, italic, links, tables.
 * Designed for SCHEMA-RFC.md — not a general-purpose parser.
 */
function mdToHtml(md: string): string {
  let html = md;

  // Escape HTML first
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Fenced code blocks (```yaml ... ```)
  html = html.replace(
    /```(\w*)\n([\s\S]*?)```/g,
    (_: string, lang: string, code: string) =>
      `<pre class="code-block"><code class="language-${lang || "text"}">${code.trim()}</code></pre>`
  );

  // Headers (must come after code blocks to avoid matching # inside code)
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Inline code `backticks`
  html = html.replace(/`([^`]+)`/g, "<code class=\"inline-code\">$1</code>");

  // Bold and italic
  html = html.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Images ![alt](url)
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img alt="$1" src="$2" />'
  );

  // Horizontal rules
  html = html.replace(/^---$/gm, "<hr />");

  // Unordered lists (handle nested via indentation)
  html = html.replace(/^(\s*)- (.+)$/gm, (_: string, indent: string, content: string) => {
    const level = Math.floor(indent.length / 2);
    return `${"  ".repeat(level)}<li>${content}</li>`;
  });

  // Wrap consecutive <li> in <ul>
  html = html.replace(
    /((?:<li>[\s\S]*?<\/li>\n?)+)/g,
    "<ul>$1</ul>"
  );

  // Ordered lists (1. 2. etc)
  html = html.replace(/^\d+\. (.+)$/gm, "<li>$1</li>");
  // Re-wrap any loosies (careful with nested)
  html = html.replace(
    /(?<!<\/ul>\n)((?:<li>[\s\S]*?<\/li>\n?)+)(?!\s*<\/ul>)/g,
    "<ol>$1</ol>"
  );

  // Tables — convert pipe tables to HTML
  html = html.replace(
    /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,
    (_: string, header: string, body: string) => {
      const headerCells = header.split("|").map((c) => c.trim()).filter(Boolean);
      const bodyRows = body
        .trim()
        .split("\n")
        .map((row: string) => {
          const cells = row.split("|").map((c) => c.trim()).filter(Boolean);
          return `<tr>${cells.map((c: string) => `<td>${c}</td>`).join("")}</tr>`;
        })
        .join("");
      return `<table><thead><tr>${headerCells.map((c: string) => `<th>${c}</th>`).join("")}</tr></thead><tbody>${bodyRows}</tbody></table>`;
    }
  );

  // Blockquotes
  html = html.replace(
    /^> (.+)$/gm,
    "<blockquote>$1</blockquote>"
  );
  // Merge adjacent blockquotes
  html = html.replace(
    /<\/blockquote>\n<blockquote>/g,
    "\n"
  );

  // Paragraphs: wrap remaining text blocks
  html = html.replace(
    /^(?!<[a-zA-Z/!])(.+)$/gm,
    "<p>$1</p>"
  );

  // Clean up empty paragraphs
  html = html.replace(/<p>\s*<\/p>/g, "");

  // Remove trailing backslash before newlines (line continuations)
  html = html.replace(/\\\n/g, "\n");

  return html;
}

export default function SchemaPage() {
  let content = "";
  let error = "";

  try {
    const filePath = resolve(process.cwd(), "..", "docs", "SCHEMA-RFC.md");
    const raw = readFileSync(filePath, "utf-8");

    // Remove the front section (we'll render our own header)
    const mainContent = raw
      // Strip the RFC header block
      .replace(
        /^# Novel-to-Script YAML Schema — RFC[\s\S]*?---\n\n?/,
        ""
      );

    content = mdToHtml(mainContent);
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <main className="min-h-screen">
      {/* Header */}
      <div className="border-b sticky top-0 bg-background/95 backdrop-blur z-10">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold tracking-tight">
              YAML Schema 参考文档
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              v0.1 · Novel-to-Script 剧本输出格式规范
            </p>
          </div>
          <a
            href="https://gitee.com/jgyyds666666/novel-to-script/blob/main/docs/SCHEMA-RFC.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            查看源文件 →
          </a>
        </div>
      </div>

      {/* Content */}
      {error ? (
        <div className="mx-auto max-w-3xl px-6 py-16 text-center">
          <p className="text-sm text-destructive">无法加载 Schema 文档</p>
          <p className="text-xs text-muted-foreground mt-2 font-mono">{error}</p>
        </div>
      ) : (
        <div
          className="schema-content mx-auto max-w-3xl px-6 py-8"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}

      {/* Inject styles for rendered markdown */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .schema-content h1 { font-size: 1.75rem; font-weight: 700; margin: 2.5rem 0 1rem; letter-spacing: -0.02em; }
        .schema-content h1:first-child { margin-top: 0; }
        .schema-content h2 { font-size: 1.35rem; font-weight: 600; margin: 2rem 0 0.75rem; padding-bottom: 0.375rem; border-bottom: 1px solid hsl(var(--border)); }
        .schema-content h3 { font-size: 1.1rem; font-weight: 600; margin: 1.5rem 0 0.5rem; }
        .schema-content h4 { font-size: 1rem; font-weight: 600; margin: 1.25rem 0 0.375rem; }
        .schema-content p { font-size: 0.875rem; line-height: 1.75; margin: 0.75rem 0; color: hsl(var(--foreground)); }
        .schema-content ul, .schema-content ol { margin: 0.75rem 0; padding-left: 1.5rem; font-size: 0.875rem; line-height: 1.75; }
        .schema-content li { margin: 0.25rem 0; }
        .schema-content code.inline-code { background: hsl(var(--muted)); padding: 0.125rem 0.375rem; border-radius: 0.25rem; font-size: 0.8125rem; font-family: ui-monospace, monospace; }
        .schema-content pre.code-block { background: hsl(var(--muted)/0.6); border: 1px solid hsl(var(--border)); border-radius: 0.5rem; padding: 1rem 1.25rem; overflow-x: auto; font-size: 0.8125rem; line-height: 1.65; margin: 1rem 0; font-family: ui-monospace, monospace; }
        .schema-content table { width: 100%; border-collapse: collapse; font-size: 0.84375rem; margin: 1rem 0; }
        .schema-content th { background: hsl(var(--muted)); padding: 0.5rem 0.75rem; text-align: left; font-weight: 600; border: 1px solid hsl(var(--border)); }
        .schema-content td { padding: 0.5rem 0.75rem; border: 1px solid hsl(var(--border)); }
        .schema-content tr:nth-child(even) td { background: hsl(var(--muted)/0.2); }
        .schema-content hr { border: none; border-top: 1px solid hsl(var(--border)); margin: 2rem 0; }
        .schema-content blockquote { border-left: 3px solid hsl(var(--primary)/0.4)); padding: 0.25rem 1rem; margin: 1rem 0; color: hsl(var(--muted-foreground)); font-size: 0.84375rem; }
        .schema-content strong { font-weight: 600; color: hsl(var(--foreground)); }
        .schema-content a { color: hsl(var(--primary)); text-decoration: underline; }
        .schema-content a:hover { opacity: 0.8; }
      `,
        }}
      />
    </main>
  );
}

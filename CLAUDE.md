# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Novel-to-Script is an AI-powered tool that converts novels into structured screenplays (YAML format), supporting movie, TV series, and short drama formats. It uses DeepSeek's chat API for AI-driven chapter analysis and scene generation, with real-time progress streaming via SSE.

## Commands

### Root (monorepo)

```bash
npm run dev              # Start frontend dev server (Next.js)
npm run build            # Build frontend
npm run build:backend    # Compile backend TypeScript
npm run lint             # Lint frontend (ESLint)
npm run install:all      # Install dependencies for both workspaces
```

### Frontend (`cd frontend`)

```bash
npm run dev              # next dev --turbopack → http://localhost:3000
npm run build            # next build
npm run lint             # next lint
npm install --legacy-peer-deps   # Required due to peer dependency conflicts
```

### Backend (`cd backend`)

```bash
npm run build            # tsc → dist/
npm run dev              # tsc --watch
```

No test suite or test runner is configured in this project.

## Architecture

### Data Flow (User Path)

```
/upload (file drop + script type + API key + title)
  → /upload/parsing (SSE-streamed AI chapter analysis → chapter cards)
  → /upload/generate (SSE-streamed AI scene generation → 3-tab preview + YAML download)
```

### Pipeline (Two-Stage AI Processing)

Both stages live in `frontend/lib/pipeline/` and are invoked via Next.js API Routes that stream progress over SSE:

1. **Parse Stage** (`parse-stage.ts` → `POST /api/pipeline/parse`):
   - Regex pre-splits novel text into chapters by detecting Chinese/English chapter markers
   - Each chapter is sent to DeepSeek AI for structured extraction (plot events, characters, dialogue, scene candidates)
   - Returns `ChapterSummary[]`

2. **Generate Stage** (`generate-stage.ts` → `POST /api/pipeline/generate`):
   - Takes `ChapterSummary[]`, batches chapters in groups of 3
   - Each batch goes to DeepSeek AI for screenplay adaptation (characters, scenes with content blocks, adaptation notes, uncertainty flags)
   - Merges results, deduplicates characters, builds structure (acts/episodes based on script type)
   - Returns a full `Script` object

### Key Architectural Decisions

- **SSE over WebSockets**: Both API routes return `text/event-stream` with `ReadableStream`. The custom `useSSEStream<T>` hook (in `frontend/hooks/`) consumes SSE events on the client, managing `idle → loading → done → error` state with timeout handling and abort support.
- **API Key resolution**: Priority chain: UI input (sent in request body) → `DEEPSEEK_API_KEY` env var → error. API key from UI is stored in `localStorage` and injected at runtime.
- **DeepSeek via OpenAI SDK**: The `ai-client.ts` wrapper uses `openai` package pointed at `https://api.deepseek.com` with `deepseek-chat` model. Includes retry logic (2 retries with delays), token estimation for Chinese text, and chunking support for long inputs.
- **JSON mode**: AI calls use `response_format: { type: "json_object" }` for structured output. Failed JSON parsing triggers retries with stronger formatting instructions.
- **SessionStorage for state transfer**: Between upload pages, novel text and metadata are passed via `sessionStorage` (keys defined in `parser.ts`), not URL params or server state.
- **Dual type systems**: Both frontend (`frontend/lib/types.ts`) and backend (`backend/src/types.ts`) define independent but near-identical type definitions mirroring the YAML Schema in `docs/SCHEMA-RFC.md`. The backend types are NOT imported by the frontend — the backend is a standalone module.

### Deprecated/Legacy Code

- `frontend/lib/parser.ts` — Regex-only chapter parser from MVP (round 1). Marked `@deprecated`, kept for backward compatibility and type exports (`ParseResult`, `STORAGE_KEYS`, `UploadMeta`).
- `frontend/lib/generator.ts` — Template-based script generator from MVP (round 1). Returns placeholder `Script` with `"[待 AI 深度改写]"` markers. Not used in current AI pipeline flow.

### Backend (`backend/`)

The backend is an independent TypeScript module with a four-phase pipeline design (`parse → analyze → generate → check`) and export modules (`yaml.ts`, `fountain.ts`). **It is not currently integrated with the frontend** — the frontend has inlined equivalent logic in its own pipeline. The `fountain.ts` Fountain format converter is the most useful backend module for potential frontend integration.

### Script Type → Structure Mapping

| Script Type | Structure |
|---|---|
| `movie` | 3 acts (建置/对抗/解决), scenes evenly split |
| `tv_series` | Season → Episode → scenes |
| `short_drama` | 1 episode per scene |

### Content Block Types

The YAML Schema defines 6 content block types that compose scenes: `action`, `dialogue`, `voiceover`, `montage`, `transition`, `shot`. See `docs/SCHEMA-RFC.md` for the full specification.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DEEPSEEK_API_KEY` | Yes* | DeepSeek API key (* optional if provided via UI) |
| `DEEPSEEK_BASE_URL` | No | Defaults to `https://api.deepseek.com` |
| `DEEPSEEK_MODEL` | No | Defaults to `deepseek-chat` |
| `AI_MAX_TOKENS` | No | Max output tokens per call, defaults to 16000 |

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS 3.4, shadcn/ui components
- **AI**: DeepSeek Chat API via OpenAI-compatible SDK (`openai` v6)
- **Serialization**: js-yaml (YAML generation/parsing)
- **Backend**: TypeScript 5.7, js-yaml
- **Package manager**: npm with `--legacy-peer-deps` for frontend

## Skills & Automation Rules

### Competition Skill (MANDATORY)

This is a competition entry project. **Before every git commit, push, or PR creation**, you MUST invoke the `competition-submit` skill via:

```
Skill({ skill: "competition-submit" })
```

The skill enforces:
- Conventional Commits (`feat:`, `fix:`, `refactor:`, etc.)
- Small granularity PRs (one feature per PR)
- PR descriptions must follow the template (功能描述 + 实现思路 + 测试方式 + 依赖声明)
- Commit timestamps must fall within the competition window (2026-06-05 ~ 2026-06-08)
- README must be complete with dependency table and demo video link

### Auto-Update PROJECT_STATUS.md + README.md (MANDATORY)

After completing any feature, bug fix, or significant change:
1. **Always** update `PROJECT_STATUS.md` to reflect the new status (✅ done, with branch/commit reference)
2. **Always** check and update `README.md` if the change affects: core features, tech stack, dependencies, directory structure, local run steps, or team info
3. Commit both updates with `docs: update project status and README`

### Auto PR Creation

When working on a feature branch and ready to merge:
1. Ensure all changes are committed and pushed
2. Create a PR via Gitee API (use curl or PowerShell, see memory `[[gitee-token]]`)
3. PR title and body MUST follow the competition skill's template

PR creation command template:
```bash
curl -s -X POST "https://gitee.com/api/v5/repos/jgyyds666666/novel-to-script/pulls" \
  -H "Content-Type: application/json" \
  -H "Authorization: bearer $GITEE_TOKEN" \
  -d '{"title":"feat(scope): description","head":"feat/branch-name","base":"main","body":"...per template..."}'
```

## UI Components (shadcn/ui)

This project uses shadcn/ui with the following installed components:
- `button` — buttons with variants (default, outline, ghost, etc.)
- `card` — Card, CardHeader, CardContent, CardFooter
- `tabs` — Tabs, TabsList, TabsTrigger, TabsContent
- `select` — Select, SelectTrigger, SelectContent, SelectItem
- `input` — styled <input>
- `textarea` — styled <textarea>
- `badge` — inline badge/tag
- `progress` — progress bar

To add more components:
```bash
cd frontend
npx shadcn@latest add <component-name> --yes
```

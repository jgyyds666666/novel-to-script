# Novel to Script — AI 小说转剧本工具

> 针对 **AI 小说转剧本工具** 议题，将小说自动转换为结构化剧本（YAML 格式），
> 支持电影、电视剧、短剧三种目标格式，AI 深度改写，输出可导入专业编剧软件。

## 🎬 Demo 视频

- **B 站链接**：[https://www.bilibili.com/video/BV1vw7y6hEME/](https://www.bilibili.com/video/BV1vw7y6hEME/)
- **内容**：AI 小说转剧本全链路演示（上传 → AI 分章解析 → AI 剧本生成 → YAML 导出），含人声讲解

## ✨ 核心功能

- **小说上传**：拖拽或点击上传 .txt 纯文本小说，支持中英文
- **章节自动识别**：正则 + AI 双重解析，自动识别章节边界、段落分布
- **剧本自动生成**：AI 将小说叙述转化为可拍摄的剧本场景（动作描述 + 对白 + 转场）
- **结构化输出**：YAML 格式剧本，符合自定义 Schema（详见 `docs/SCHEMA-RFC.md`）
- **多格式导出**：YAML 下载 + Fountain 格式（可导入 Final Draft、Fade In 等）
- **原著对照回溯**：每条剧本内容标注对应的原文章节段落

## 🧱 技术栈与依赖

### 原创部分

| 模块 | 说明 |
|------|------|
| `frontend/lib/parser.ts` | 自研章节解析引擎，支持中英文章节标记正则匹配 |
| `frontend/lib/types.ts` | 完整剧本 YAML Schema 的 TypeScript 类型定义 |
| `frontend/lib/pipeline/ai-client.ts` | 自研 DeepSeek AI 调用封装，含重试/分块/Token 估算 |
| `frontend/lib/pipeline/parse-stage.ts` | 自研 AI 分章解析阶段，逐章提取情节/对白/场景 |
| `frontend/lib/pipeline/generate-stage.ts` | 自研 AI 剧本生成阶段，小说→结构化 Script 对象 |
| `frontend/lib/pipeline/types.ts` | Pipeline 阶段类型定义（ChapterSummary、SSE 事件等） |
| `frontend/app/api/pipeline/parse/route.ts` | SSE 流式分章 API，实时推送进度 |
| `frontend/app/api/pipeline/generate/route.ts` | SSE 流式生成 API，实时推送进度 |
| `frontend/hooks/use-sse-stream.ts` | 自研 SSE 流式进度 Hook，统一管理 loading/result/error |
| `frontend/components/upload/progress-display.tsx` | 自研实时进度展示组件 |
| `backend/src/pipeline/` | 自研四阶段处理管线（分章→聚合→生成→检查） |
| `backend/src/export/fountain.ts` | 自研 YAML→Fountain 格式转换器 |
| `docs/SCHEMA-RFC.md` | 自研剧本 YAML Schema 设计文档 |
| `frontend/app/docs/schema/page.tsx` | Schema 在线参考页，渲染 SCHEMA-RFC.md 为可读 HTML |

### 第三方依赖

#### 前端 (frontend/)

| 依赖 | 版本 | 用途 |
|------|------|------|
| next | ^15.0 | React 全栈框架，App Router |
| react | ^19.0 | UI 框架 |
| react-dom | ^19.0 | React DOM 渲染 |
| openai | ^6.42 | DeepSeek API 调用（OpenAI 兼容接口） |
| lucide-react | ^0.460 | 图标库 |
| js-yaml | ^4.1 | 前端 YAML 序列化（剧本预览/下载） |
| class-variance-authority | ^0.7 | 组件 variant 管理（shadcn/ui 依赖） |
| clsx | ^2.1 | CSS 类名合并 |
| tailwind-merge | ^2.6 | Tailwind 类名去重合并 |
| tailwindcss-animate | ^1.0 | Tailwind 动画插件 |
| tailwindcss | ^3.4 | CSS 原子化框架 |
| shadcn/ui | latest | UI 组件库（button, card, tabs, select, input, textarea, badge, progress） |
| typescript | ^5.7 | 类型系统 |

#### 后端 (backend/)

| 依赖 | 版本 | 用途 |
|------|------|------|
| js-yaml | ^4.1 | YAML 序列化与解析 |
| typescript | ^5.7 | 类型系统与编译 |

### 自有代码复用声明

本项目为全新开发，未复用已有仓库代码。

## 🚀 本地运行

```bash
# 1. 克隆仓库
git clone https://gitee.com/jgyyds666666/novel-to-script.git
cd novel-to-script

# 2. 前端
cd frontend
npm install --legacy-peer-deps
npm run dev          # → http://localhost:3000

# 3. 后端（另一个终端）
cd backend
npm install
npm run build        # 编译 TypeScript
```

## 📁 目录结构

```
novel-to-script/
├── frontend/                    # Next.js 全栈应用（UI + API Routes）
│   ├── app/
│   │   ├── page.tsx             # 首页（开始转换 / 查看 Schema）
│   │   ├── layout.tsx           # 根布局
│   │   ├── globals.css          # 全局样式 + shadcn/ui 主题
│   │   ├── docs/
│   │   │   └── schema/page.tsx  # Schema 在线参考文档
│   │   ├── upload/
│   │   │   ├── page.tsx         # 小说上传页
│   │   │   ├── parsing/page.tsx # 分章解析页（SSE 流式）
│   │   │   └── generate/page.tsx# 剧本生成页（SSE 流式）
│   │   └── api/pipeline/
│   │       ├── parse/route.ts   # AI 分章 API（SSE）
│   │       └── generate/route.ts# AI 生成 API（SSE）
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   └── upload/              # 上传流程组件（含 progress-display）
│   ├── hooks/
│   │   └── use-sse-stream.ts    # SSE 流式进度 Hook
│   ├── lib/
│   │   ├── types.ts             # Schema 类型定义
│   │   ├── parser.ts            # 章节解析引擎（向后兼容）
│   │   ├── constants.ts         # 常量
│   │   ├── utils.ts             # 工具函数
│   │   └── pipeline/            # AI 管线核心
│   │       ├── ai-client.ts     # DeepSeek 客户端封装
│   │       ├── parse-stage.ts   # 分章解析阶段
│   │       ├── generate-stage.ts# 剧本生成阶段
│   │       ├── prompts.ts       # AI Prompt 模板
│   │       └── types.ts         # 管线类型定义
│   └── package.json
├── backend/                     # 独立 AI 处理管线
│   ├── src/
│   │   ├── pipeline/            # 四阶段管线
│   │   │   ├── parse.ts         # Phase 1: 分章解析
│   │   │   ├── analyze.ts       # Phase 2: 全局分析
│   │   │   ├── generate.ts      # Phase 3: 场景生成
│   │   │   └── check.ts         # Phase 4: 一致性检查
│   │   ├── export/              # 导出模块
│   │   │   ├── yaml.ts          # → YAML
│   │   │   └── fountain.ts      # → Fountain
│   │   └── types.ts             # 后端类型定义
│   └── package.json
├── docs/
│   └── SCHEMA-RFC.md            # YAML Schema 设计文档
├── .env.local.example           # API Key 配置示例
├── PROJECT_STATUS.md            # 项目进度追踪
└── README.md
```

## 👥 团队成员与分工

| 成员 | Gitee | 负责模块 |
|------|-------|---------|
| jgyyds666666 | @jgyyds666666 | 全栈开发（前端 UI + 后端管线 + Schema 设计） |

## 📜 议题与原创性声明

本项目针对 **AI 小说转剧本工具** 议题，由团队成员在比赛开发周期（2026-06-05 ~ 2026-06-08）内自主完成。

- 所有第三方依赖已在上方表格中列明用途与版本
- 未复用已有仓库代码
- 核心算法（章节解析、剧本生成、Fountain 转换）为原创实现
- YAML Schema（`docs/SCHEMA-RFC.md`）为自主设计

---

> **当前状态**：第二轮已完成（DeepSeek AI 真实接入，SSE 流式进度，API Key UI 配置，Schema 在线文档，剧本预览三 Tab），Demo 视频已录制并上传 B 站。


# Novel to Script — AI 小说转剧本工具

> 针对 **AI 小说转剧本工具** 议题，将小说自动转换为结构化剧本（YAML 格式），
> 支持电影、电视剧、短剧三种目标格式，AI 深度改写，输出可导入专业编剧软件。

## 🎬 Demo 视频

> [待录制] 将在第二轮 AI 深化完成后录制

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
| `lib/parser.ts` | 自研章节解析引擎，支持中英文章节标记正则匹配 |
| `lib/generator.ts` | 自研剧本生成器，小说→结构化 Script 对象 |
| `lib/types.ts` | 完整剧本 YAML Schema 的 TypeScript 类型定义 |
| `backend/src/pipeline/` | 自研四阶段处理管线（分章→聚合→生成→检查） |
| `backend/src/export/fountain.ts` | 自研 YAML→Fountain 格式转换器 |
| `docs/SCHEMA-RFC.md` | 自研剧本 YAML Schema 设计文档 |

### 第三方依赖

#### 前端 (frontend/)

| 依赖 | 版本 | 用途 |
|------|------|------|
| next | ^15.0 | React 全栈框架，App Router |
| react | ^19.0 | UI 框架 |
| react-dom | ^19.0 | React DOM 渲染 |
| lucide-react | ^0.460 | 图标库 |
| class-variance-authority | ^0.7 | 组件 variant 管理（shadcn/ui 依赖） |
| clsx | ^2.1 | CSS 类名合并 |
| tailwind-merge | ^2.6 | Tailwind 类名去重合并 |
| tailwindcss-animate | ^1.0 | Tailwind 动画插件 |
| tailwindcss | ^3.4 | CSS 原子化框架 |
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
│   │   ├── page.tsx             # 首页
│   │   ├── layout.tsx           # 根布局
│   │   ├── globals.css          # 全局样式 + shadcn/ui 主题
│   │   └── upload/
│   │       ├── page.tsx         # 小说上传页
│   │       ├── parsing/page.tsx # 分章解析页
│   │       └── generate/page.tsx# 剧本生成页
│   ├── components/
│   │   ├── ui/                  # shadcn/ui 基础组件
│   │   └── upload/              # 上传流程组件
│   ├── lib/
│   │   ├── types.ts             # Schema 类型定义
│   │   ├── parser.ts            # 章节解析引擎
│   │   ├── generator.ts         # 剧本生成器
│   │   ├── constants.ts         # 常量
│   │   └── utils.ts             # 工具函数
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

> **当前状态**：MVP 第一轮已完成（上传 → 分章 → 生成 → 下载），第二轮 AI 深化进行中。

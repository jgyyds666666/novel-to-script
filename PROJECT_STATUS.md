# Project Status — Novel to Script

> 最后更新: 2026-06-05
> 当前阶段: 第二轮 MVP — DeepSeek AI 全链路已接入

## 开发策略

- **第一轮**: MVP 最简实现（正则分章 + 模板生成，端到端跑通）
- **第二轮**: 接入真实 AI 管线（DeepSeek + SSE 流式 + 剧本预览优化）
- **第三轮**: 导出深化（Fountain UI 集成）+ 体验打磨 + Demo 视频

## 进度

### 第一轮 MVP — ✅ 完成

| 环节 | 状态 | 分支 | 说明 |
|------|------|------|------|
| 上传页面 UI | ✅ done | `feat/upload-page-ui` | 文件拖拽 + 类型选择 + 步骤指示器 |
| 分章解析 | ✅ done | `feat/chapter-parsing` | 正则分章 + 章节列表展示 |
| 剧本生成 | ✅ done | `feat/script-generate` | 模板生成 + YAML 预览 + 下载 |
| 导出下载 | ✅ done | (同上) | YAML 文件下载，集成在生成页 |

### 第二轮 DeepSeek AI — ✅ 已完成

| 功能 | 状态 | 分支 | 说明 |
|------|------|------|------|
| AI Client 封装 | ✅ done | `feat/deepseek-pipeline` | OpenAI SDK → DeepSeek，含重试/Token 估算/分块 |
| SSE 流式分章 API | ✅ done | (同上) | `POST /api/pipeline/parse` → SSE 实时进度 |
| SSE 流式生成 API | ✅ done | (同上) | `POST /api/pipeline/generate` → SSE 实时进度 |
| AI System Prompts | ✅ done | (同上) | 分章解析 Prompt + 场景改写 Prompt + Few-Shot |
| SSE 流式 Hook | ✅ done | (同上) | `useSSEStream<T>` 泛型 Hook，统一管理状态 |
| 进度展示组件 | ✅ done | (同上) | `ProgressDisplay` 实时显示 AI 处理进度 |
| API Key UI 配置 | ✅ done | `feat/api-key-ui-and-ux` | localStorage 持久化 + 运行时注入 |
| 剧本预览优化 | ✅ done | `feat/api-key-ui-and-ux` | 三 Tab（摘要/场景/YAML）+ js-yaml 序列化 |
| Schema 参考页 | ✅ done | `feat/api-key-ui-and-ux` | `/docs/schema` 渲染 SCHEMA-RFC.md |
| Anthropic 设计系统 | ✅ done | `main` (5a3e89f) | 全站 Anthropic 暖色调主题 + Poppins/Lora 字体 + 组件精修 |
| 设计 Skill | ✅ done | `main` (5a3e89f) | `.claude/skills/anthropic-design/SKILL.md` 完整设计系统文档 |
| TypeScript 修复 | ✅ done | `main` (待提交) | `script-preview.tsx` ContentBlock 类型修复 |

### 用户完整流程
```
/ → 首页（开始转换 / 查看 Schema）
  → /upload（拖文件 + 选类型 + API Key + 标题）
  → /upload/parsing（SSE 流式 AI 分章 → 章节卡片）
  → /upload/generate（SSE 流式 AI 生成 → 三 Tab 剧本预览 + YAML 下载）
```

### 第三轮 计划

| 功能 | 状态 | 说明 |
|------|------|------|
| Fountain 导出 UI | ⬜ | 前端接入 Fountain 格式下载 |
| 分镜脚本扩展 | ⬜ | 可选 shot 块生成 |
| UI 打磨 | ⬜ | 加载骨架屏/暗色模式/响应式优化 |
| 🎬 Demo 视频 | ⬜ | 用户自行录制（人声讲解 + B 站上传） |
| README 补全 | ⬜ | 汇总 Demo 链接 |

## Known Issues

| 问题 | 严重度 | 状态 |
|------|--------|------|
| ~~`/docs/schema` 404 → 首页"查看 Schema"链接无路由~~ | — | ✅ 已修复 (2026-06-05) |
| ~~分章页面章节编号显示错误（无标记时显示"第2章"）~~ | — | ✅ 已修复 (2026-06-05, `497533e`) |
| ~~`##第3章` Markdown 格式章节标记无法识别~~ | — | ✅ 已修复 (2026-06-05, `497533e`) |
| ~~`script-preview.tsx` ContentBlock 类型不兼容~~ | — | ✅ 已修复 (2026-06-05) |
| 后端 `backend/src/` 管线未与前端 Next.js API Routes 同步 | low | ⬜ 后端代码为独立模块，前端已内联同等逻辑 |
| 文件超大时 AI 批处理 token 可能溢出 | medium | ⬜ 需增加 chunk 策略优化 |

## 自动化与工具

| 项 | 状态 | 说明 |
|----|------|------|
| CLAUDE.md | ✅ 已配置 | 含比赛 skill 强制调用、PROJECT_STATUS/README 自动更新、PR 模板 |
| settings.local.json hooks | ✅ 已配置 | PostToolUse: git commit 后自动检查文档更新；git push 后提示 PR 创建 |
| shadcn/ui 组件 | ✅ 已安装 | card, tabs, select, input, textarea, badge, progress (共7个) |
| anthropic-design skill | ✅ 已创建 | `.claude/skills/anthropic-design/SKILL.md` 可复用设计系统 |

## 技术栈

| 层 | 技术 |
|----|------|
| 前端框架 | Next.js 15 (App Router) |
| AI 服务 | DeepSeek Chat API（OpenAI 兼容 SDK） |
| 数据流 | SSE (Server-Sent Events) 流式进度 |
| 样式 | Tailwind CSS 3.4 + shadcn/ui 基础组件 |
| 序列化 | js-yaml（剧本 YAML 导出） |
| 类型系统 | TypeScript 5.7（完整 Schema 类型定义） |
| 包管理 | npm（含 legacy-peer-deps 标记） |

## 快速启动

```bash
# 克隆
git clone https://gitee.com/jgyyds666666/novel-to-script.git
cd novel-to-script

# 前端
cd frontend
npm install --legacy-peer-deps
npm run dev          # → http://localhost:3000

# 配置 API Key（二选一）
# 方式 1：在页面 UI 的 API Key 输入框中填入
# 方式 2：创建 frontend/.env.local 写入 DEEPSEEK_API_KEY=sk-xxx
```

## 会话恢复

如果上下文中断，告诉我"继续"或"看 PROJECT_STATUS.md 恢复进度"。

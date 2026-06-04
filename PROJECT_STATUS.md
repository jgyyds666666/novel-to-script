# Project Status — Novel to Script

> 最后更新: 2026-06-05
> 当前阶段: 第一轮 MVP（全链路跑通）

## 开发策略

- **第一轮**: MVP 全功能（每个环节最简实现，端到端跑通）
- **第二轮**: 逐功能深化（AI 集成、UI 打磨、导出优化）

## 进度

### 第一轮 MVP — ✅ 全链路已跑通！

| 环节 | 状态 | 分支 | 说明 |
|------|------|------|------|
| 上传页面 UI | ✅ done | `feat/upload-page-ui` | 文件拖拽 + 类型选择 + 步骤指示器 |
| 分章解析 | ✅ done | `feat/chapter-parsing` | 正则分章 + 章节列表展示 |
| 剧本生成 | ✅ done | `feat/script-generate` | 模板生成 + YAML 预览 + 下载 |
| 导出下载 | ✅ done | (同上) | YAML 文件下载，集成在生成页 |

### 用户完整流程
```
/ → /upload（拖文件+选类型）→ /upload/parsing（章节列表）
  → /upload/generate（摘要+YAML预览+下载）
```

### 第二轮 细化

| 功能 | 状态 | 说明 |
|------|------|------|
| AI 分章解析 | ⬜ | 替换正则为 AI |
| AI 深度改写 | ⬜ | 心理→动作、对话归属 |
| 人物小传提取 | ⬜ | 从原文识别角色 |
| 改编报告 | ⬜ | adaptation_notes + uncertainty_flags |
| Fountain 导出 | ⬜ | 可导入 Final Draft |
| UI 完善 | ⬜ | 加载态/错误态/暗色模式 |

## 技术决策

详见 `docs/SCHEMA-RFC.md` 和 memory 文件。

## 快速启动

```bash
# 前端
cd frontend && npm run dev    # http://localhost:3000

# 后端构建
cd backend && npm run build
```

## 会话恢复

如果上下文中断，告诉我"继续"或"看 PROJECT_STATUS.md 恢复进度"。

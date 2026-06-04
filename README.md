# Novel to Script — AI 小说转剧本工具

将小说自动转换为结构化剧本（YAML 格式），支持电影、电视剧、短剧三种目标格式。

## 项目结构

```
novel-to-script/
├── frontend/               # Next.js 全栈应用（UI + API Routes）
│   ├── app/                # App Router 页面
│   │   ├── globals.css     # 全局样式 + shadcn/ui 主题
│   │   ├── layout.tsx      # 根布局
│   │   └── page.tsx        # 首页
│   ├── components/ui/      # shadcn/ui 组件
│   ├── lib/                # 前端工具函数 & 类型定义
│   ├── package.json
│   └── next.config.ts
├── backend/                # AI 处理管线（独立 TypeScript 模块）
│   ├── src/
│   │   ├── pipeline/       # 四阶段处理管线
│   │   │   ├── parse.ts    # Phase 1: 分章解析
│   │   │   ├── analyze.ts  # Phase 2: 全局聚合
│   │   │   ├── generate.ts # Phase 3: 场景生成
│   │   │   └── check.ts    # Phase 4: 一致性检查
│   │   ├── export/         # 输出格式导出
│   │   │   ├── yaml.ts     # → YAML
│   │   │   └── fountain.ts # → Fountain
│   │   ├── types.ts        # 共享类型定义
│   │   └── index.ts        # 入口
│   ├── package.json
│   └── tsconfig.json
└── docs/
    └── SCHEMA-RFC.md       # YAML Schema 设计文档（RFC）
```

## 模块说明

| 模块 | 技术栈 | 职责 |
|------|--------|------|
| `frontend/` | Next.js 15 + React 19 + shadcn/ui + Tailwind CSS | Web UI，文件上传，剧本预览，格式导出 |
| `backend/` | TypeScript + Node.js | 四阶段 AI 管线：分章→全局分析→场景生成→一致性检查 |

## 快速开始

```bash
# 1. 安装前端依赖
cd frontend
npm install --legacy-peer-deps
npm run dev        # 启动开发服务器 → http://localhost:3000

# 2. 安装后端依赖
cd backend
npm install
npm run build      # 编译 TypeScript
```

## Schema 文档

详见 [docs/SCHEMA-RFC.md](docs/SCHEMA-RFC.md) — 包含完整的 YAML Schema 定义、字段说明和设计决策记录。

## License

TBD

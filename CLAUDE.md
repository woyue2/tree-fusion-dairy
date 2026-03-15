# anti-huihuan-kaifa · L1 Root

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L1 层（项目宪法），任何目录结构或技术栈变更必须同步更新本文件。

---

## 技术栈

| 层 | 技术 |
|---|---|
| 框架     | Next.js (App Router) · TypeScript |
| 样式     | TailwindCSS v4 |
| 数据库   | Supabase (PostgreSQL · Auth · Storage) |
| 服务端   | Next.js Server Actions + Route Handlers（无独立后端） |
| 状态管理 | Zustand（按业务域拆分为 `hooks/use{Domain}Store.ts`） |
| 验证     | Zod |
| 部署     | Vercel（前端 + Serverless）+ Supabase（数据） |
| UI Lib  | lucide-react · @dnd-kit（按需引入） |

---

## 目录结构

```
anti-huihuan-kaifa/
│
├── app/                            ← Next.js App Router
│   ├── layout.tsx                  ← Server Component · 全局字体 / metadata（禁止 'use client'）
│   ├── page.tsx                    ← 首页（async Server Component · SSR 取数）
│   ├── globals.css                 ← 全局样式 + CSS 变量
│   ├── error.tsx                   ← 全局错误边界（Client Component）
│   ├── loading.tsx                 ← 全局 loading fallback
│   │
│   ├── actions/                    ← ⭐ Server Actions（数据变更入口）
│   │   ├── index.ts                ← re-export 聚合
│   │   └── sync.ts                 ← 离线同步专属 Actions
│   │
│   ├── api/                        ← Route Handlers（Webhook / 文件上传等）
│   │   └── health/route.ts         ← GET /api/health
│   │
│   └── auth/
│       └── callback/route.ts       ← Supabase OAuth 回调
│
├── components/                     ← 公共 UI 组件（跨路由复用）
│   └── ui/                         ← 原子组件（Button, Input, Modal...）
│
├── hooks/                          ← 自定义 React Hooks
│   ├── useSyncWorker.ts            ← 离线同步引擎 Hook
│   └── useAppStore.ts              ← 全局状态（在线状态/同步状态）
├── lib/                            ← 业务逻辑 + 外部服务
│   ├── db.ts                       ← Dexie.js (IDB) 本地数据库定义
│   ├── supabase.ts                 ← 客户端 Supabase 实例（浏览器）
│   ├── supabase-server.ts          ← ⭐ 服务端 Supabase client（Server Actions 专用）
│   ├── supabase-db.ts              ← Supabase 数据操作封装（CRUD）
│   ├── constants.ts                ← 全局常量（路由 · 配置）
│   ├── api-utils.ts                ← Route Handler 响应格式工具
│   └── validation.ts               ← Zod schemas
│
├── types/                          ← 全局 TypeScript 类型（独立目录）
│   └── index.ts
│
├── utils/                          ← 纯工具函数（无副作用）
│   └── index.ts
│
├── middleware.ts                   ← Supabase Auth 路由守卫
├── .env.local.example              ← 环境变量模板（提交 git）
├── .env.local                      ← 实际环境变量（不提交 git）
│
├── docs/                           ← 项目文档
├── supabase_schema.sql             ← Supabase 数据库建表语句
├── CLAUDE.md                       ← GEB L1 根文档（本文件）
├── AGENTS.md                       ← Agent 配置
├── 前后端目录规范.md                ← 目录规范检查参照
└── .antigravity/                   ← Skill / Workflow 配置
```

---

## 数据流（核心约定）

### 读取（SSR）
```
page.tsx（async Server Component）
  → lib/supabase-server.ts（服务端 client，携带 cookies）
  → Supabase PostgreSQL
  → props 传给 Client Components
```

### 写入（Mutation）
```
Client Component（用户操作）
  → app/actions/{domain}.ts（'use server' Server Action）
  → lib/supabase-server.ts（服务端 client，鉴权）
  → Supabase PostgreSQL
  → revalidatePath() 刷新 SSR 数据
```

---

## 开发约定

- **`layout.tsx` 永远是 Server Component**（禁止 `'use client'`）
- **`page.tsx` 默认 Server Component**，只有需要交互才在子组件中加 `'use client'`
- **Server Actions** 放 `app/actions/`，每个业务域一个文件
- **Route Handlers** 仅用于：Webhook 接收、文件上传、第三方回调等无法用 Server Actions 处理的场景
- **数据操作** 统一通过 `lib/supabase-db.ts` 封装，不在 actions 里直接写 SQL
- **两种 Supabase client** 严禁混用：
  - 客户端（`lib/supabase.ts`）→ 浏览器 Auth、Realtime
  - 服务端（`lib/supabase-server.ts`）→ Server Actions、SSR 取数
- **命名规范**：
  - 组件：PascalCase（`UserCard.tsx`）
  - 工具/Hook：camelCase（`useEditorStore.ts`）
  - API 路由：kebab-case（`/api/health`）
- **代码质量红线**（来自 GEB 协议）：
  - 单文件不超过 800 行
  - 单目录不超过 8 个文件
  - 缩进不超过 3 层
  - 单函数不超过 20 行

---

## 质量红线检查清单

- [ ] 新增模块目录 → 创建对应 `{module}/CLAUDE.md`（L2）
- [ ] 新增文件 → 写入 L3 头部注释（INPUT/OUTPUT/POS/DEPS）
- [ ] 删除文件 → 从 L2 成员清单中移除
- [ ] 重构目录 → 更新本 L1 目录结构图

---

_Last updated: 2026-03-08 (架构重建：混合架构 fusion-todo 数据流 + tree-index Supabase 分层，移除 FastAPI 后端)_

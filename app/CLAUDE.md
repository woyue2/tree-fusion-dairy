# app/ · L2 局部地图

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，变更时更新此文件，然后检查根 CLAUDE.md。

## 职责

Next.js App Router 路由层。Server Components 读数据，Server Actions 写数据，Route Handlers 处理外部回调。

## 成员清单

| 路径 | 职责 | 备注 |
|---|---|---|
| `layout.tsx` | 根 layout（Server Component） | 禁止 'use client' |
| `page.tsx` | 首页（async Server Component · SSR 取数） | |
| `globals.css` | 全局样式 + CSS 变量 | |
| `error.tsx` | 全局错误边界 | Client Component |
| `loading.tsx` | 全局 loading fallback | |
| `actions/index.ts` | Server Actions re-export 聚合 | |
| `api/health/route.ts` | GET /api/health 健康检查 | |
| `auth/callback/route.ts` | Supabase OAuth 回调 | |

## 新增规范

- 新增路由子目录 → 必须配套 `loading.tsx` + `error.tsx` + `metadata`
- 新增 `actions/{domain}.ts` → 必须有 `'use server'` 文件顶部声明
- 新增 Route Handler → 确认确实无法用 Server Action 替代

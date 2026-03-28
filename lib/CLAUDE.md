# lib/ · L2 局部地图

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，变更时更新此文件，然后检查根 CLAUDE.md。

## 职责

外部服务接入层 + 业务工具层。所有与 Supabase、验证、API 格式相关的逻辑集中在此，与 UI 和路由完全解耦。

## 成员清单

| 文件 | 职责 | 备注 |
|---|---|---|
| `supabase.ts` | 浏览器端 Supabase client 单例 | 仅用于客户端 Auth / Realtime |
| `supabase-server.ts` | 服务端 Supabase client 工厂函数 | Server Actions / SSR 取数专用 |
| `supabase-db.ts` | Supabase 数据操作封装（CRUD） | 所有表操作集中于此 |
| `constants.ts` | 全局常量（路由、配置、行间距） | 新增 `LineSpacingType`, `LINE_SPACING_CONFIG` |
| `utils.ts` | Markdown 渲染工具 | `renderMarkdown`, `sanitizeHTML`（DOMPurify） |
| `api-utils.ts` | Route Handler 统一响应格式 | `createSuccessResponse` / `handleApiError` |
| `validation.ts` | Zod schema 集中管理 | 表单 + API 参数验证 |

## 暴露接口

```typescript
// Supabase（客户端）
export { supabase } from './supabase'

// Supabase（服务端）
export { createSupabaseServerClient } from './supabase-server'

// 数据操作
export { supabaseDb } from './supabase-db'

// 工具
export { createSuccessResponse, createErrorResponse, handleApiError } from './api-utils'
export { PaginationSchema } from './validation'
export { API_BASE, AUTH_ROUTES, PUBLIC_PATHS } from './constants'
```

## 约束

- 单文件不超过 800 行（GEB 质量红线）
- 文件数超过 8 个时必须提取子目录（如 `lib/prompts/`）
- `supabase.ts` 和 `supabase-server.ts` 严禁混用（见前后端目录规范.md S-01/S-02）

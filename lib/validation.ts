// INPUT: 原始输入（表单数据、API 参数等）
// OUTPUT: 验证后的类型安全数据（Zod parse）
// POS: lib/validation.ts — GEB L3 · Zod schema 集中管理
// DEPS: zod
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { z } from 'zod'

// TODO: 按业务需要添加 Schema
// 示例：
// export const CreateItemSchema = z.object({
//   title: z.string().min(1).max(200),
//   description: z.string().optional(),
// })
// export type CreateItemInput = z.infer<typeof CreateItemSchema>

/** 通用分页参数 Schema */
export const PaginationSchema = z.object({
  limit:  z.coerce.number().min(1).max(100).default(50),
  offset: z.coerce.number().min(0).default(0),
})
export type PaginationInput = z.infer<typeof PaginationSchema>

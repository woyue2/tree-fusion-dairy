// INPUT: 无（纯类型定义）
// OUTPUT: 全局 TypeScript 类型
// POS: types/index.ts — GEB L3 · 全局类型定义（独立目录，与逻辑解耦）
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

// ─── 通用 ────────────────────────────────────────────────

/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
}

// ─── 业务类型（按项目需要在此扩展）────────────────────────

// 示例：
// export interface User {
//   id:        string
//   email:     string
//   createdAt: string
// }

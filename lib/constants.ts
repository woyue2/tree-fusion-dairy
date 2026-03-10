// INPUT: 无
// OUTPUT: 全局常量（路由 · API 前缀 · 其他配置）
// POS: lib/constants.ts — GEB L3 · 全局常量
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

/** API 路由前缀 */
export const API_BASE = '/api'

/** 认证相关路由 */
export const AUTH_ROUTES = {
  LOGIN:    '/login',
  CALLBACK: '/auth/callback',
} as const

/** 公开路由（不需要 Auth 守卫） */
export const PUBLIC_PATHS = new Set([
  AUTH_ROUTES.LOGIN,
  AUTH_ROUTES.CALLBACK,
  `${API_BASE}/health`,
])

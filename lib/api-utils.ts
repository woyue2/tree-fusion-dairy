// INPUT: data: unknown · statusCode?: number（可选，默认 200）
// OUTPUT: NextResponse（统一格式：{ success, data } 或 { success, error }）
// POS: lib/api-utils.ts — GEB L3 · API 响应格式工具
// DEPS: next/server
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { NextResponse } from 'next/server'

/** 统一成功响应 */
export function createSuccessResponse(data: unknown, statusCode = 200) {
  return NextResponse.json({ success: true, data }, { status: statusCode })
}

/** 统一错误响应 */
export function createErrorResponse(message: string, statusCode = 500) {
  return NextResponse.json({ success: false, error: message }, { status: statusCode })
}

/** Route Handler 统一错误处理 */
export function handleApiError(error: unknown) {
  const message = error instanceof Error ? error.message : '未知错误'
  console.error('[API Error]', error)
  return createErrorResponse(message, 500)
}

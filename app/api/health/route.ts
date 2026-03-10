// INPUT: GET 请求
// OUTPUT: { status: 'ok', timestamp: string }
// POS: app/api/health/route.ts — GEB L3 · 健康检查 Route Handler
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  })
}

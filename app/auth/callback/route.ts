// INPUT: GET 请求（Supabase OAuth 回调，携带 code 参数）
// OUTPUT: 重定向到首页（exchangeCodeForSession 后）
// POS: app/auth/callback/route.ts — GEB L3 · Supabase Auth PKCE 回调
// DEPS: @supabase/ssr · next/headers
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { NextRequest, NextResponse } from 'next/server'
// TODO: 安装 @supabase/ssr 后取消注释
// import { createServerClient } from '@supabase/ssr'
// import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    // TODO: exchangeCodeForSession(code)
  }

  return NextResponse.redirect(new URL('/', request.url))
}

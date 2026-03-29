// INPUT: NextRequest（每次请求自动触发）
// OUTPUT: NextResponse（放行 / 重定向到 /login）
// POS: middleware.ts — GEB L3 · Supabase Auth 路由守卫
// DEPS: @supabase/ssr · next/server · lib/constants
// ⭐ 关键：刷新 Supabase session cookie，防止 token 过期后 SSR 取数失败
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { NextRequest, NextResponse } from 'next/server'
import { PUBLIC_PATHS, AUTH_ROUTES } from '@/lib/constants'

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── 静态资源直接放行 ──────────────────────────────────
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next()
  }

  // ── 登录页直接放行 ────────────────────────────────────
  if (pathname === AUTH_ROUTES.LOGIN || PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next()
  }

  // ── 单密码保护：检查 app-auth cookie ─────────────────
  const authed = req.cookies.get('app-auth')?.value === '1'
  if (!authed) {
    return NextResponse.redirect(new URL(AUTH_ROUTES.LOGIN, req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}

// INPUT: cookies()（Next.js 请求上下文，自动读取）
// OUTPUT: serverSupabase — 服务端 Supabase client（每次请求新建，携带用户 session）
// POS: lib/supabase-server.ts — GEB L3 · 服务端 Supabase 实例
// DEPS: @supabase/ssr · next/headers
// 用途: Server Actions 写入、Server Components SSR 取数
// ⭐ 核心：通过 cookies() 自动携带用户身份，实现服务端 RLS 鉴权
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createSupabaseServerClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: any[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )
}

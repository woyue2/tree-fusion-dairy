// INPUT: NEXT_PUBLIC_SUPABASE_URL · NEXT_PUBLIC_SUPABASE_ANON_KEY（环境变量）
// OUTPUT: supabase — 浏览器端 Supabase client 单例
// POS: lib/supabase.ts — GEB L3 · 客户端 Supabase 实例（持久 session）
// DEPS: @supabase/supabase-js
// 用途: 客户端 Auth 操作、实时订阅（Realtime）
// ⚠️ 不可在 Server Actions / Server Components 中直接使用，请用 lib/supabase-server.ts
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'sb-auth-token',
  },
})

// INPUT: createSupabaseServerClient()（服务端 client）
// OUTPUT: supabaseDb — 数据操作封装对象（CRUD 函数集）
// POS: lib/supabase-db.ts — GEB L3 · Supabase 数据操作层
// DEPS: lib/supabase-server · types/index
// ⭐ 所有 Supabase 表操作封装在此，Server Actions 通过本模块访问数据
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { createSupabaseServerClient } from '@/lib/supabase-server'

// TODO: 按业务需要添加 CRUD 函数
// 示例结构：
//
// export async function listItems(userId: string) {
//   const supabase = createSupabaseServerClient()
//   const { data, error } = await supabase
//     .from('items')
//     .select('*')
//     .eq('user_id', userId)
//     .order('created_at', { ascending: false })
//   if (error) throw error
//   return data
// }

export const supabaseDb = {
  // CRUD 函数将在此对象中添加
}

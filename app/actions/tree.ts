/**
 * [INPUT]:    依赖 lib/supabase-server 获取服务端凭证
 * [OUTPUT]:   导出针对目录树节点的业务级变更 Action
 * [POS]:      app/actions/tree.ts - 知识树模块服务端操作
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use server'
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// NOTE: tree-index 采用 Zustand + Dexie 本地优先策略
// Server Actions 仅作为"同步引擎"的推送端点，不做实时 UI 响应
// 客户端 useSyncEngine 负责将 _dirty 记录批量 upsert 此处

export async function upsertTreeNode(input: {
  id: string
  parent_id: string | null
  title: string
  content?: string
  order?: number
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('tree_nodes')
    .upsert({ ...input, user_id: user.id }, { onConflict: 'id' })
  if (error) throw new Error(error.message)
  revalidatePath('/tree')
}

export async function deleteTreeNode(id: string) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  // NOTE: 子节点的级联删除由 Supabase DB 的 ON DELETE CASCADE 保证
  const { error } = await supabase
    .from('tree_nodes')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/tree')
}

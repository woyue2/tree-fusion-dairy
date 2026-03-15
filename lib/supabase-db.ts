// INPUT: createSupabaseServerClient()（服务端 client）
// OUTPUT: supabaseDb — 数据操作封装对象（CRUD 函数集）
// POS: lib/supabase-db.ts — GEB L3 · Supabase 数据操作层
// DEPS: lib/supabase-server · types/index
// ⭐ 所有 Supabase 表操作封装在此，Server Actions 通过本模块访问数据
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { createSupabaseServerClient } from '@/lib/supabase-server'

export const supabaseDb = {
  // ── Moods ──────────────────────────────────────────────────
  async upsertMood(mood: any) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('moods')
      .upsert({
        id: mood.id,
        user_id: mood.userId,
        date: mood.date,
        score: mood.score,
        note: mood.note,
        updated_at: new Date().toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  // ── Tasks ──────────────────────────────────────────────────
  async upsertTask(task: any) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('todo_tasks')
      .upsert({
        id: task.id,
        user_id: task.userId,
        title: task.title,
        status_id: task.statusId,
        context_id: task.contextId,
        color: task.color,
        tags: task.tags,
        order_index: task.orderIndex,
        deleted_at: task.deletedAt,
        updated_at: new Date().toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  async upsertDocument(doc: any) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('tree_documents')
      .upsert({
        id: doc.id,
        user_id: doc.userId,
        title: doc.title,
        root: doc.root,
        metadata: doc.metadata,
        updated_at: new Date(doc.updatedAt || Date.now()).toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  // ── Board Config (Statuses/Contexts) ───────────────────────
  async upsertStatus(status: any) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('todo_statuses')
      .upsert({
        id: status.id,
        user_id: status.userId,
        title: status.title,
        color: status.color,
        collapsed: status.collapsed,
        order_index: status.orderIndex,
        updated_at: new Date().toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  async upsertContext(context: any) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('todo_contexts')
      .upsert({
        id: context.id,
        user_id: context.userId,
        title: context.title,
        color: context.color,
        collapsed: context.collapsed,
        order_index: context.orderIndex,
        updated_at: new Date().toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  // ── Batch Fetch (Initial Sync) ─────────────────────────────
  async fetchUserData(userId: string) {
    const supabase = createSupabaseServerClient()
    
    const [moods, tasks, docs] = await Promise.all([
      supabase.from('moods').select('*').eq('user_id', userId),
      supabase.from('todo_tasks').select('*').eq('user_id', userId),
      supabase.from('tree_documents').select('*').eq('user_id', userId)
    ])

    return {
      moods: moods.data || [],
      tasks: tasks.data || [],
      documents: docs.data || []
    }
  }
}

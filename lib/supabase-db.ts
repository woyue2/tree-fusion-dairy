/**
 * [INPUT]:    依赖 createSupabaseServerClient()（服务端 client）
 * [OUTPUT]:   supabaseDb — 数据操作封装对象（CRUD 函数集）
 * [POS]:      lib/supabase-db.ts - Supabase 数据操作抽象层
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { createSupabaseServerClient } from '@/lib/supabase-server'

export const supabaseDb = {
  // ── Moods ──────────────────────────────────────────────────
  async upsertMood(mood: any) {
    const supabase = createSupabaseServerClient()
    const userId = mood.userId || 'default-user'
    const { data, error } = await supabase
      .from('moods')
      .upsert({
        id: mood.id,
        user_id: userId,
        date: mood.date,
        score: mood.score,
        note: mood.note,
        updated_at: new Date(mood.updatedAt || Date.now()).toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  async fetchMoods(userId: string) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('moods')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  },

  // ── Tasks ──────────────────────────────────────────────────
  async upsertTask(task: any) {
    const supabase = createSupabaseServerClient()
    const userId = task.userId || 'default-user'
    const { data, error } = await supabase
      .from('todo_tasks')
      .upsert({
        id: task.id,
        user_id: userId,
        title: task.title,
        status_id: task.statusId,
        context_id: task.contextId,
        color: task.color,
        tags: task.tags,
        order_index: task.orderIndex,
        deleted_at: task.deletedAt,
        updated_at: new Date(task.updatedAt || Date.now()).toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  async upsertDocument(doc: any) {
    const supabase = createSupabaseServerClient()
    const userId = doc.userId || 'default-user'
    const { data, error } = await supabase
      .from('tree_documents')
      .upsert({
        id: doc.id,
        user_id: userId,
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
    const userId = status.userId || 'default-user'
    const { data, error } = await supabase
      .from('todo_statuses')
      .upsert({
        id: status.id,
        user_id: userId,
        title: status.title,
        color: status.color,
        collapsed: status.collapsed,
        order_index: status.orderIndex,
        updated_at: new Date(status.updatedAt || Date.now()).toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  async upsertContext(context: any) {
    const supabase = createSupabaseServerClient()
    const userId = context.userId || 'default-user'
    const { data, error } = await supabase
      .from('todo_contexts')
      .upsert({
        id: context.id,
        user_id: userId,
        title: context.title,
        color: context.color,
        collapsed: context.collapsed,
        order_index: context.orderIndex,
        updated_at: new Date(context.updatedAt || Date.now()).toISOString()
      })
      .select()
    if (error) throw error
    return data
  },

  // ── Batch Fetch (Initial Sync) ─────────────────────────────
  async fetchUserData(userId: string) {
    const supabase = createSupabaseServerClient()
    
    const [moods, tasks, docs, diaries, statuses, contexts] = await Promise.all([
      supabase.from('moods').select('*').eq('user_id', userId),
      supabase.from('todo_tasks').select('*').eq('user_id', userId),
      supabase.from('tree_documents').select('*').eq('user_id', userId),
      supabase.from('diaries').select('*').eq('user_id', userId),
      supabase.from('todo_statuses').select('*').eq('user_id', userId),
      supabase.from('todo_contexts').select('*').eq('user_id', userId)
    ])

    return {
      moods: moods.data || [],
      tasks: tasks.data || [],
      documents: docs.data || [],
      diaries: diaries.data || [],
      statuses: statuses.data || [],
      contexts: contexts.data || []
    }
  },

  async upsertDiary(diary: any) {
    const supabase = createSupabaseServerClient()
    const userId = diary.userId || 'default-user'
    const { data, error } = await supabase
      .from('diaries')
      .upsert({
        id: diary.id,
        user_id: userId,
        date: diary.date,
        title: diary.title,
        content: diary.content,
        images: diary.images,
        footer_images: diary.footerImages,
        analysis: diary.aiAnalysis,
        updated_at: new Date(diary.updatedAt || Date.now()).toISOString(),
        deleted_at: diary.deletedAt
      })
      .select()
    if (error) throw error
    return data
  },

  async fetchDiaries(userId: string) {
    const supabase = createSupabaseServerClient()
    const { data, error } = await supabase
      .from('diaries')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    if (error) throw error
    return data
  }
}

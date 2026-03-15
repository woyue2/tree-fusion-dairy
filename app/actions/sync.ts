/**
 * [INPUT]:    依赖 lib/supabase-db 进行云端取数和存数
 * [OUTPUT]:   封装 Server Actions 供客户端调用
 * [POS]:      app/actions/sync.ts - 服务端同步入口
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use server'

import { supabaseDb } from '@/lib/supabase-db'

export async function syncMoodAction(mood: any) {
  return await supabaseDb.upsertMood(mood)
}

export async function syncTaskAction(task: any) {
  return await supabaseDb.upsertTask(task)
}

export async function syncDocAction(doc: any) {
  return await supabaseDb.upsertDocument(doc)
}

export async function syncDiaryAction(diary: any) {
  return await supabaseDb.upsertDiary(diary)
}

export async function pullMoodsAction(userId: string) {
  return await supabaseDb.fetchMoods(userId)
}

export async function pullDiariesAction(userId: string) {
  return await supabaseDb.fetchDiaries(userId)
}

export async function fetchUserDataAction(userId: string) {
  return await supabaseDb.fetchUserData(userId)
}

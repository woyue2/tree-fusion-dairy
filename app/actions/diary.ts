'use server'
// INPUT: CreateDiaryInput | entry id
// OUTPUT: void（成功）或 throw Error（失败）
// POS: app/actions/diary.ts — GEB L3 · Diary 模块 Server Actions
// DEPS: lib/supabase-server · lib/supabase-db · next/cache
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

export async function createDiaryEntry(input: {
  content: string
  date: string  // ISO 8601 YYYY-MM-DD
  tags?: string[]
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('diary_entries').insert({
    ...input,
    user_id: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/diary')
}

export async function updateDiaryEntry(id: string, patch: Partial<{
  content: string
  tags: string[]
}>) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('diary_entries')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/diary')
}

export async function deleteDiaryEntry(id: string) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('diary_entries')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/diary')
}

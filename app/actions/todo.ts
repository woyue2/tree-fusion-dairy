'use server'
// INPUT: CreateTaskInput | UpdateTaskInput | task id
// OUTPUT: void（成功）或 throw Error（失败）
// POS: app/actions/todo.ts — GEB L3 · Todo 模块 Server Actions
// DEPS: lib/supabase-server · lib/supabase-db · lib/validation · next/cache
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { revalidatePath } from 'next/cache'
import { createSupabaseServerClient } from '@/lib/supabase-server'

// TODO: 从 lib/validation.ts 引入 Zod schema 做参数校验

export async function createTask(input: {
  title: string
  status: string
  context: string
  tags?: string[]
  color?: string
}) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase.from('tasks').insert({
    ...input,
    user_id: user.id,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/todo')
}

export async function updateTask(id: string, patch: Partial<{
  title: string
  status: string
  context: string
  tags: string[]
  color: string
}>) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('tasks')
    .update(patch)
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/todo')
}

export async function deleteTask(id: string) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) throw new Error(error.message)
  revalidatePath('/todo')
}

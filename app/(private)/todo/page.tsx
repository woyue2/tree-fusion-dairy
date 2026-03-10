// INPUT: Supabase session（服务端取数）
// OUTPUT: Todo 看板 SSR 页面
// POS: app/(private)/todo/page.tsx — GEB L3 · fusion-todo 模块入口
// DEPS: lib/supabase-server · lib/supabase-db
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Todo · Tree-Fusion-Diary',
  description: '任务看板 — 管理你今天要做的事',
}

import BoardContainer from '@/components/todo/BoardContainer'

export default async function TodoPage() {
  return (
    <BoardContainer />
  )
}

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

export default async function TodoPage() {
  // TODO: 从 supabase-db.ts 取数后传给 Client Component
  return (
    <div className="fusion-theme p-6">
      <h1 className="text-2xl font-bold">Todo 看板</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        fusion-todo 模块迁移中 — 请在此实现 BoardContainer 组件
      </p>
    </div>
  )
}

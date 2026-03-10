// INPUT: params.id — diary_entries.id
// OUTPUT: 单篇日记编辑器页面
// POS: app/(private)/diary/edit/[id]/page.tsx — GEB L3 · 日记编辑器路由
// DEPS: lib/supabase-server · lib/supabase-db
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'

interface EditPageProps {
  params: { id: string }
}

export const metadata: Metadata = {
  title: '编辑日记 · Tree-Fusion-Diary',
}

export default async function DiaryEditPage({ params }: EditPageProps) {
  const { id } = params
  // TODO: 从 supabase-db.ts 取单条 diary_entry(id) 后传给 Editor Client Component
  return (
    <div className="diary-theme p-6">
      <h1 className="text-2xl font-bold">编辑日记 #{id}</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        Editor 组件迁移中 — 请在此实现 useDiaryEditor Hook + Editor 受控组件
      </p>
    </div>
  )
}

// INPUT: Supabase session（服务端取数）
// OUTPUT: 日记列表 SSR 页面
// POS: app/(private)/diary/page.tsx — GEB L3 · diary-app 模块入口
// DEPS: lib/supabase-server · lib/supabase-db
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Diary · Tree-Fusion-Diary',
  description: '日记本 — 记录今天发生的事',
}

export default async function DiaryPage() {
  // TODO: 从 supabase-db.ts 取 diary_entries 列表后传给 Client Component
  return (
    <div className="diary-theme p-6">
      <h1 className="text-2xl font-bold">日记</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        diary-app 模块迁移中 — 请在此实现 DiaryList 组件
      </p>
    </div>
  )
}

// INPUT: Supabase session（服务端取数）
// OUTPUT: 树状索引 SSR 页面
// POS: app/(private)/tree/page.tsx — GEB L3 · tree-index 模块入口
// DEPS: lib/supabase-server · lib/supabase-db
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tree · Tree-Fusion-Diary',
  description: '知识树索引 — 整理你的碎片化思考',
}

export default async function TreePage() {
  // TODO: 从 supabase-db.ts 取数后传给 Client Component
  return (
    <div className="tree-theme p-6">
      <h1 className="text-2xl font-bold">Knowledge Tree</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        tree-index 模块迁移中 — 请在此实现 TreeContainer 组件
      </p>
    </div>
  )
}

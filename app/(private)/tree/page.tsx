// INPUT: Supabase session（服务端取数）
// OUTPUT: 树状索引 SSR 页面
// POS: app/(private)/tree/page.tsx — GEB L3 · tree-index 模块入口
// DEPS: lib/supabase-server · lib/supabase-db
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'
import TreeContainer from '@/components/tree/TreeContainer'

export const metadata: Metadata = {
  title: 'Tree · Tree-Fusion-Diary',
  description: '知识树索引 — 整理你的碎片化思考',
}

export default function TreePage() {
  return (
    <TreeContainer />
  )
}

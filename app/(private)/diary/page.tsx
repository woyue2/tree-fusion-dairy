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

import DiaryContainer from '@/components/diary/DiaryContainer'

export default async function DiaryPage() {
  return (
    <DiaryContainer />
  )
}


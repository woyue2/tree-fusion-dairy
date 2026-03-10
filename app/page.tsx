// INPUT: 无（数据从 Supabase 服务端获取）
// OUTPUT: 首页 JSX（Server Component · SSR 取数）
// POS: app/page.tsx — GEB L3 · 应用主入口
// DEPS: lib/supabase-server · app/actions/
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { redirect } from 'next/navigation'

export const metadata = {
  title: 'Tree-Fusion-Diary',
  description: 'Integrated workspace for Todo, Knowledge Tree, and Diary',
}

export default async function Home() {
  redirect('/todo')
}

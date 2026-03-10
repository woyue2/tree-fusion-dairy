// INPUT: 无（数据从 Supabase 服务端获取）
// OUTPUT: 首页 JSX（Server Component · SSR 取数）
// POS: app/page.tsx — GEB L3 · 应用主入口
// DEPS: lib/supabase-server · app/actions/
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Suspense } from 'react'

// TODO: 替换为实际的 Server Actions 和 Client Components
export const metadata = {
  title: 'Anti-Huihuan | Home',
  description: '...',
}

export default async function Home() {
  // 服务端直接取数（无 HTTP 开销）
  // const data = await fetchFromSupabase()

  return (
    <Suspense fallback={<div>加载中...</div>}>
      <main>
        {/* TODO: 挂载 Client Components，将 data 作为 initialData 传入 */}
        <h1>Anti-Huihuan</h1>
      </main>
    </Suspense>
  )
}

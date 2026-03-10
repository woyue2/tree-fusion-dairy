// INPUT: 无
// OUTPUT: 全局 loading fallback UI
// POS: app/loading.tsx — GEB L3 · Next.js Suspense fallback
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

export default function Loading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <span>加载中...</span>
    </div>
  )
}

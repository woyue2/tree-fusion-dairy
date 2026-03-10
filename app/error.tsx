'use client'

// INPUT: error: Error · reset: () => void
// OUTPUT: 全局错误边界 UI
// POS: app/error.tsx — GEB L3 · Next.js 全局错误边界
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>出现了一些问题</h2>
      <p style={{ color: '#5e6c84' }}>{error.message}</p>
      <button onClick={reset}>重试</button>
    </div>
  )
}

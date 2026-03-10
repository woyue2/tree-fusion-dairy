'use client'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <p className="text-sm text-red-500">{error.message || '发生了未知错误'}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-[var(--app-primary)] px-4 py-2 text-sm text-white"
      >
        重试
      </button>
    </div>
  )
}

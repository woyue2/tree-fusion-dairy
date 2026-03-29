// INPUT: 无
// OUTPUT: 密码登录页（单密码保护）
// POS: app/login/page.tsx — GEB L3 · 访问密码验证入口
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

'use client'

import { useState } from 'react'
import { loginAction } from '@/app/actions/auth'

export default function LoginPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const fd = new FormData(e.currentTarget)
    const result = await loginAction(fd.get('password') as string)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-xl shadow-xl w-80 flex flex-col gap-4">
        <h1 className="text-white text-xl font-semibold text-center">Tree-Fusion-Diary</h1>
        <input
          name="password"
          type="password"
          placeholder="访问密码"
          autoFocus
          required
          className="bg-gray-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg py-2 font-medium transition-colors"
        >
          {loading ? '验证中...' : '进入'}
        </button>
      </form>
    </div>
  )
}

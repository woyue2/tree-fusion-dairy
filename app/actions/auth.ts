// INPUT: password string
// OUTPUT: 设置 app-auth cookie 并跳转，或返回错误
// POS: app/actions/auth.ts — GEB L3 · 密码验证 Server Action
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export async function loginAction(password: string) {
  const correct = process.env.APP_PASSWORD
  if (!correct) return { error: '未配置访问密码，请联系管理员' }
  if (password !== correct) return { error: '密码错误' }

  const cookieStore = cookies()
  cookieStore.set('app-auth', '1', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7天
    path: '/'
  })

  redirect('/')
}

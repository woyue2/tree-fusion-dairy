// INPUT: children: React.ReactNode
// OUTPUT: HTML 根布局（Server Component · 无 'use client'）
// POS: app/layout.tsx — GEB L3 · 全局字体/metadata/body 包裹
// DEPS: next/font/google · globals.css
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Anti-Huihuan',
  description: '...',
}

import { Toaster } from 'sonner'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        {children}
        <Toaster position="top-center" richColors />
      </body>
    </html>
  )
}

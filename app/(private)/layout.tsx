// INPUT: children（受保护的各模块页面）
// OUTPUT: 带侧边导航的应用主壳 JSX
// POS: app/(private)/layout.tsx — GEB L3 · 私有路由组 Root Layout
// DEPS: next/link · lucide-react
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import Link from 'next/link'
import { CheckSquare, GitBranch, BookOpen, Settings } from 'lucide-react'

interface PrivateLayoutProps {
  children: React.ReactNode
}

const NAV_ITEMS = [
  { href: '/todo',  icon: CheckSquare, label: 'Todo',  theme: 'fusion-theme' },
  { href: '/tree',  icon: GitBranch,   label: 'Tree',  theme: 'tree-theme'   },
  { href: '/diary', icon: BookOpen,    label: 'Diary', theme: 'diary-theme'  },
]

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  return (
    <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)]">
      {/* ── 侧边导航 ─────────────────────────────────── */}
      <nav className="flex w-16 flex-col items-center gap-4 border-r border-[var(--sidebar-border)] bg-[var(--sidebar-bg)] py-6">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => (
          <Link
            key={href}
            href={href}
            title={label}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-active)]"
          >
            <Icon size={20} />
          </Link>
        ))}
        {/* 底部设置 */}
        <div className="mt-auto">
          <Link
            href="/settings/import"
            title="Settings"
            className="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--nav-muted)] transition-colors hover:bg-[var(--nav-hover)] hover:text-[var(--nav-active)]"
          >
            <Settings size={20} />
          </Link>
        </div>
      </nav>

      {/* ── 主内容区 ─────────────────────────────────── */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}

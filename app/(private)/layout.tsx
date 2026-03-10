'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface PrivateLayoutProps {
  children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const pathname = usePathname() || ''
  
  return (
    <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans overflow-hidden">
      {/* ── Sidebar nav ── */}
      <nav id="sidebar">
        <div className="nav-logo">
          <div className="nav-logo-icon">🌳</div>
          Tree-Fusion
        </div>
        
        <div className="nav-section">
          <div className="nav-section-label">工作区</div>
          
          <Link href="/todo" className={`nav-item ${pathname.includes('todo') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24"><rect x="3" y="5" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><line x1="13" y1="8" x2="21" y2="8"/><line x1="13" y1="16" x2="21" y2="16"/></svg>
            Fusion Todo
          </Link>
          
          <Link href="/tree" className={`nav-item ${pathname.includes('tree') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24"><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" strokeWidth="1.5"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="10" y1="17.5" x2="14" y2="17.5"/><line x1="17.5" y1="10" x2="17.5" y2="14"/></svg>
            知识树
          </Link>
          
          <Link href="/diary" className={`nav-item ${pathname.includes('diary') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            日记本
          </Link>
          
          <Link href="/stats" className={`nav-item ${pathname.includes('stats') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24"><path d="M18 20V10M12 20V4M6 20v-6" fill="none" strokeWidth="2"/></svg>
            情绪统计
          </Link>
        </div>
        
        <div className="nav-spacer"></div>
        
        <div className="nav-section">
          <Link href="/settings" className={`nav-item ${pathname.includes('settings') ? 'active' : ''}`}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            设置 / 导入
          </Link>
        </div>
        
        <div className="nav-bottom">
          <div className="sync-row"><div className="sync-dot"></div>已同步 Supabase</div>
        </div>
      </nav>

      {/* ── 主内容区 ─────────────────────────────────── */}
      <main id="main">
        {children}
      </main>
    </div>
  )
}


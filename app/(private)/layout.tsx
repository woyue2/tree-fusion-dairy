/**
 * [INPUT]:    React Node (children), store hooks (Sync/Todo/Mood)
 * [OUTPUT]:   带侧边栏及同步引擎初始化的私有布局
 * [POS]:      app/(private)/layout.tsx - 整体私有域流量入口, 负责水和与同步引导
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import ToastContainer from '@/components/ui/ToastContainer'
import { useAppStore } from '@/hooks/useAppStore'
import { useSyncEngine } from '@/hooks/syncEngine'
import { useTodoStore } from '@/hooks/useTodoStore'
import { useMoodStore } from '@/hooks/useMoodStore'
import { useFrogStore } from '@/hooks/useFrogStore'

interface PrivateLayoutProps {
  children: React.ReactNode
}

export default function PrivateLayout({ children }: PrivateLayoutProps) {
  const pathname = usePathname() || ''
  const isOnline = useAppStore(s => s.isOnline)
  const setIsOnline = useAppStore(s => s.setIsOnline)
  const syncStatus = useAppStore(s => s.syncStatus)
  const [isCollapsed, setIsCollapsed] = useState(false)

  // [FIX] 根因: Render 体内 require 会阻塞 Hydration，改为标准 Hook 调用
  useSyncEngine()
  const loadTodo = useTodoStore((s: any) => s.loadAll)
  const loadMoods = useMoodStore((s: any) => s.loadMoods)
  const loadPomodoros = useFrogStore((s: any) => s.loadPomodoros)

  useEffect(() => {
    loadTodo()
    loadMoods()
    loadPomodoros()
  }, [loadTodo, loadMoods, loadPomodoros])

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        window.dispatchEvent(new CustomEvent('global-escape'))
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [setIsOnline])
  
  return (
    <div className="flex h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans overflow-hidden">
      {/* ── Sidebar nav ── */}
      <nav id="sidebar" style={{ width: isCollapsed ? '64px' : '220px', transition: 'width 0.2s', overflow: 'hidden' }}>
        <div className="nav-logo" style={{ display: 'flex', alignItems: 'center', justifyContent: isCollapsed ? 'center' : 'space-between', padding: isCollapsed ? '16px 0' : '16px 20px' }}>
          {!isCollapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className="nav-logo-icon">🌳</div>
              <span style={{ whiteSpace: 'nowrap' }}>Tree-Fusion</span>
            </div>
          )}
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px', color: '#5e6c84' }}
            title={isCollapsed ? "展开侧边栏" : "收起侧边栏"}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <line x1="9" x2="9" y1="3" y2="21"/>
            </svg>
          </button>
        </div>
        
        <div className="nav-section">
          {!isCollapsed && <div className="nav-section-label">工作区</div>}
          
          <Link href="/todo" className={`nav-item ${pathname.includes('todo') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="Fusion Todo">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }}><rect x="3" y="5" width="6" height="6" rx="1"/><rect x="3" y="13" width="6" height="6" rx="1"/><line x1="13" y1="8" x2="21" y2="8"/><line x1="13" y1="16" x2="21" y2="16"/></svg>
            {!isCollapsed && <span>Fusion Todo</span>}
          </Link>
          
          <Link href="/tree" className={`nav-item ${pathname.includes('tree') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="知识树">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }}><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" strokeWidth="1.5"/><line x1="10" y1="6.5" x2="14" y2="6.5"/><line x1="10" y1="17.5" x2="14" y2="17.5"/><line x1="17.5" y1="10" x2="17.5" y2="14"/></svg>
            {!isCollapsed && <span>知识树</span>}
          </Link>
          
          <Link href="/diary" className={`nav-item ${pathname.includes('diary') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="日记本">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
            {!isCollapsed && <span>日记本</span>}
          </Link>
          
          <Link href="/stats" className={`nav-item ${pathname.includes('stats') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="情绪统计">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }}><path d="M18 20V10M12 20V4M6 20v-6" fill="none" strokeWidth="2"/></svg>
            {!isCollapsed && <span>情绪统计</span>}
          </Link>
          
          <Link href="/frogs" className={`nav-item ${pathname.includes('frogs') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="青蛙没关系">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }} fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
            {!isCollapsed && <span>青蛙没关系</span>}
          </Link>
        </div>
        
        <div className="nav-spacer"></div>
        
        <div className="nav-section">
          <Link href="/settings" className={`nav-item ${pathname.includes('settings') ? 'active' : ''}`} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '8px 0' : '8px 12px' }} title="设置 / 导入">
            <svg viewBox="0 0 24 24" style={{ margin: isCollapsed ? 0 : '0 10px 0 0' }}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            {!isCollapsed && <span>设置 / 导入</span>}
          </Link>
        </div>
        
        <div className="nav-bottom" style={{ justifyContent: isCollapsed ? 'center' : 'flex-start', padding: isCollapsed ? '16px 0' : '16px 20px' }}>
          <div className="sync-row" style={{ width: isCollapsed ? 'auto' : '100%', justifyContent: 'center' }}>
            <div className="sync-dot" title="已同步 Supabase"></div>
            {!isCollapsed && <span>已同步 Supabase</span>}
          </div>
        </div>
      </nav>

      {/* ── 主内容区 ─────────────────────────────────── */}
      <main id="main">
        {children}
      </main>
      
      <ToastContainer />
    </div>
  )
}


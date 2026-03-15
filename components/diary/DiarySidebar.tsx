/**
 * [INPUT]:    依赖 diaryEntries (Array) 和 activeEntryId
 * [OUTPUT]:   渲染日记列表侧边栏，支持过滤和项选择
 * [POS]:      components/diary/DiarySidebar.tsx - 导航辅助组件
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React from 'react'
import { DiaryEntry } from '@/types'

interface DiarySidebarProps {
  entries: DiaryEntry[]
  activeEntryId?: string
  onSelectEntry: (id: string) => void
  onNewEntry: () => void
  onWeeklyModal: () => void
  tab: 'list' | 'select'
  onTabChange: (tab: 'list' | 'select') => void
  selectedEntries: Set<string>
}

export default function DiarySidebar({ 
  entries, 
  activeEntryId, 
  onSelectEntry, 
  onNewEntry, 
  onWeeklyModal,
  tab,
  onTabChange,
  selectedEntries
}: DiarySidebarProps) {
  return (
    <div className="diary-sidebar">
      <div className="diary-sidebar-header">
        <span style={{ fontSize: '16px' }}>📖</span>
        <h2>日记本</h2>
        <button className="diary-btn-secondary" onClick={onWeeklyModal} title="生成周记">📝 周记</button>
        <button className="diary-btn-small" onClick={onNewEntry}>+ 新建</button>
      </div>

      <div className="diary-sidebar-tabs">
        <div 
          className={`diary-sidebar-tab ${tab === 'list' ? 'active' : ''}`}
          onClick={() => onTabChange('list')}
        >
          列表
        </div>
        <div 
          className={`diary-sidebar-tab ${tab === 'select' ? 'active' : ''}`}
          onClick={() => onTabChange('select')}
        >
          选择
        </div>
      </div>

      {tab === 'select' && (
        <div className="diary-select-bar">
          <span id="diary-selected-count">已选 {selectedEntries.size} 篇</span>
          <button onClick={() => {
            const allIds = new Set(entries.map(e => e.id))
            allIds.forEach(id => onSelectEntry(id)) // This might need a bulk select prop instead of multiple calls, but let's keep it simple
          }}>全选</button>
          <button onClick={() => onTabChange('list')}>取消</button>
          <button 
            style={{ background: 'var(--diary-accent)', color: '#fff', borderColor: 'var(--diary-accent)' }}
            onClick={onWeeklyModal}
            disabled={selectedEntries.size === 0}
          >
            周记
          </button>
        </div>
      )}

      <div className="diary-list-inner">
        {entries.map((entry) => (
          <div 
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className={`diary-item ${entry.id === activeEntryId ? 'active' : ''}`}
          >
            {tab === 'select' && (
              <input 
                type="checkbox" 
                className="diary-item-check" 
                checked={selectedEntries.has(entry.id)}
                onChange={() => {}} // Handled by parent onClick
              />
            )}
            <div className="diary-item-date">{entry.createdAt.split('T')[0]}</div>
            <div className="diary-item-title">{entry.title}</div>
            <div className="diary-item-preview">{entry.content.original.substring(0, 30)}...</div>
          </div>
        ))}
      </div>
    </div>
  )
}

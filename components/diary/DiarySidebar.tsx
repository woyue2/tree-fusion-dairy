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
}

export default function DiarySidebar({ 
  entries, 
  activeEntryId, 
  onSelectEntry, 
  onNewEntry, 
  onWeeklyModal,
  tab,
  onTabChange
}: DiarySidebarProps) {
  return (
    <div className="diary-sidebar">
      <div className="diary-sidebar-header">
        <span style={{ fontSize: '16px' }}>📖</span>
        <h2>日记本</h2>
        <button className="diary-btn-secondary" onClick={onWeeklyModal}>📝 周记</button>
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
          筛选
        </div>
      </div>

      <div className="diary-list-inner">
        {entries.map((entry) => (
          <div 
            key={entry.id}
            onClick={() => onSelectEntry(entry.id)}
            className={`diary-item ${entry.id === activeEntryId ? 'active' : ''}`}
          >
            {tab === 'select' && (
              <input type="checkbox" className="diary-item-check" />
            )}
            <div className="diary-item-date">{new Date(entry.createdAt).toLocaleDateString()}</div>
            <div className="diary-item-title">{entry.title}</div>
            <div className="diary-item-preview">{entry.content.substring(0, 30)}...</div>
          </div>
        ))}
      </div>
    </div>
  )
}

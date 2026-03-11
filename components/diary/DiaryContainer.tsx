'use client'

import React, { useState, useEffect } from 'react'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import DiarySidebar from './DiarySidebar'
import { Sparkles, X } from 'lucide-react'

export default function DiaryContainer() {
  const { entries, activeEntry, setActiveEntry, updateEntry, addEntry, setEntries } = useDiaryStore()
  const [tab, setTab] = useState<'list' | 'select'>('list')
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [showAi, setShowAi] = useState(false)

  // Mock initial data if none
  useEffect(() => {
    if (entries.length === 0) {
      const mockEntry = {
        id: 'e1',
        title: '今天下午过得很充实',
        content: '今天下午花了三个小时整理知识树，把最近看的几本书的笔记做了归纳。\n\n发现学习效率比之前高了很多，主要是因为用了番茄钟工作法，每 25 分钟专注，5 分钟休息。\n\n晚上和朋友打了一局篮球，虽然输了，但心情很好。回来之后泡了一杯茶，感觉生活很有仪式感。\n\n明天要完成 Tree-Fusion-Diary 前端原型的确认，期待！',
        date: '2026-03-11',
        preview: '番茄钟 + 篮球 + 茶...',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setEntries([mockEntry])
      setActiveEntry(mockEntry)
    }
  }, [entries.length, setActiveEntry, setEntries])

  // Clear selection when leaving select mode
  useEffect(() => {
    if (tab === 'list') {
      setSelectedEntries(new Set())
    }
  }, [tab])

  return (
    <div id="view-diary" className="view active">
      <DiarySidebar 
        entries={entries}
        activeEntryId={activeEntry?.id}
        onSelectEntry={(id) => {
          if (tab === 'select') {
            const next = new Set(selectedEntries)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            setSelectedEntries(next)
          } else {
            const entry = entries.find(e => e.id === id)
            if (entry) setActiveEntry(entry)
          }
        }}
        onNewEntry={() => {
          const newEntry = {
            id: 'e_' + Date.now(),
            title: '',
            content: '',
            date: new Date().toISOString().split('T')[0],
            preview: '新日记...',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
          addEntry(newEntry)
          setActiveEntry(newEntry)
        }}
        onWeeklyModal={() => {}}
        tab={tab}
        onTabChange={setTab}
        selectedEntries={selectedEntries}
      />

      {tab === 'select' && (
        <div style={{ position: 'absolute', bottom: 0, left: 240, width: 300, display: 'flex', alignItems: 'center', padding: '12px 16px', background: '#fff', borderTop: '1px solid #e0e0e0', zIndex: 10, boxSizing: 'border-box' }}>
          <span style={{ fontSize: '12px', color: '#666' }}>已选择 {selectedEntries.size} 篇日记</span>
          <div style={{ flex: 1 }}></div>
          <button style={{ marginRight: '8px', padding: '4px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid #ccc', background: '#fff', cursor: 'pointer' }} disabled={selectedEntries.size === 0}>周记</button>
          <button 
            style={{ borderColor: selectedEntries.size > 0 ? '#eb5a46' : '#ccc', color: selectedEntries.size > 0 ? '#eb5a46' : '#ccc' }}
            disabled={selectedEntries.size === 0}
            onClick={() => {
              if (confirm(`确定删除这 ${selectedEntries.size} 篇日记吗？`)) {
                Array.from(selectedEntries).forEach(id => {
                  useDiaryStore.getState().deleteEntry(id)
                })
                setTab('list')
              }
            }}
          >
            删除
          </button>
        </div>
      )}

      <div className="diary-main">
        {/* Editor Header */}
        <div className="diary-editor-header">
          <input 
            type="text" 
            className="diary-title-input" 
            placeholder="日记标题..." 
            value={activeEntry?.title || ''}
            onChange={(e) => activeEntry && updateEntry(activeEntry.id, { title: e.target.value })}
          />
          <button 
            className="btn-modal-ghost" 
            style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '4px 8px' }}
            onClick={() => setShowAi(!showAi)}
          >
            <Sparkles size={14} style={{ color: 'var(--diary-accent)' }} /> AI
          </button>
        </div>

        {/* Toolbar */}
        <div className="diary-toolbar">
          <button className="toolbar-btn" style={{ fontWeight: 700 }} onClick={() => alert('加粗 (B)')}>B</button>
          <button className="toolbar-btn" style={{ fontStyle: 'italic' }} onClick={() => alert('斜体 (I)')}>I</button>
          <button className="toolbar-btn" style={{ textDecoration: 'underline' }} onClick={() => alert('下划线 (U)')}>U</button>
          <div className="toolbar-sep"></div>
          <button className="toolbar-btn" onClick={() => alert('标题 1 (H1)')}>H1</button>
          <button className="toolbar-btn" onClick={() => alert('标题 2 (H2)')}>H2</button>
          <div className="toolbar-sep"></div>
          <button className="toolbar-btn" onClick={() => alert('无序列表 (●)')}>● 列表</button>
          <button className="toolbar-btn" onClick={() => alert('有序列表 (1.)')}>1. 排序</button>
          <button className="toolbar-btn" onClick={() => alert('待办列表 ([])')}>[] 待办</button>
          <div className="toolbar-sep"></div>
          <button className="toolbar-btn blockquote" onClick={() => alert('引用块 (❝)')}>❝ 引用</button>
          <button className="toolbar-btn" onClick={() => alert('分割线 (--)')}>-- 分割线</button>
        </div>

        {/* Editor Body */}
        <div className="diary-editor-body">
          <textarea 
            className="diary-textarea" 
            placeholder="今天发生了什么？有什么想记录的..."
            value={activeEntry?.content || ''}
            onChange={(e) => activeEntry && updateEntry(activeEntry.id, { content: e.target.value })}
          />
        </div>

        {/* Editor Footer */}
        <div className="diary-editor-footer">
          <div className="word-count">字数: {activeEntry?.content.length || 0}</div>
          <div className="diary-actions">
            <button 
              className="btn-diary btn-diary-ghost"
              onClick={() => {
                if (activeEntry && confirm('确定要删除这篇日记吗？')) {
                  useDiaryStore.getState().deleteEntry(activeEntry.id)
                }
              }}
            >删除</button>
            <button className="btn-diary btn-diary-primary" onClick={() => alert('日记已保存')}>保存 (Ctrl+S)</button>
          </div>
        </div>

        {/* AI Panel */}
        <div className={`ai-panel ${showAi ? 'open' : ''}`}>
          <div className="ai-panel-header">
            <div className="ai-panel-title">✨ AI 洞察</div>
            <button className="ai-close" onClick={() => setShowAi(false)}>&times;</button>
          </div>
          <div className="ai-content">
            <p>这段日记体现了你很强的<strong>行动力</strong>和<strong>自我反思能力</strong>。番茄钟工作法显然对你很有效，这可以作为长期的习惯固化下来。</p>
            <br />
            <div>
              <span className="ai-tag">行动力 +1</span>
              <span className="ai-tag">番茄钟工作法</span>
              <span className="ai-tag">生活仪式感</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

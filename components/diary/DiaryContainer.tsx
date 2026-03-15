// INPUT: 无 (状态读取自 useDiaryStore)
// OUTPUT: 渲染日记主容器组件
// POS: components/diary/DiaryContainer.tsx - 日记模块入口组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import { useAppStore } from '@/hooks/useAppStore'
import DiarySidebar from './DiarySidebar'
import WeeklySummaryModal from './WeeklySummaryModal'
import { Sparkles, X, Image as ImageIcon } from 'lucide-react'

export default function DiaryContainer() {
  const { entries, activeEntry, setActiveEntry, updateEntry, addEntry, setEntries } = useDiaryStore()
  const [tab, setTab] = useState<'list' | 'select'>('list')
  const [selectedEntries, setSelectedEntries] = useState<Set<string>>(new Set())
  const [showAi, setShowAi] = useState(false)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)
  const [showWeeklyModal, setShowWeeklyModal] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertFormat = (prefix: string, suffix: string) => {
    if (!activeEntry || !textareaRef.current) return
    const el = textareaRef.current
    const start = el.selectionStart
    const end = el.selectionEnd
    const text = activeEntry.content
    const before = text.substring(0, start)
    const selected = text.substring(start, end)
    const after = text.substring(end)
    
    const newText = before + prefix + selected + suffix + after
    updateEntry(activeEntry.id, { content: newText })
    
    setTimeout(() => {
      el.focus()
      el.setSelectionRange(start + prefix.length, end + prefix.length)
    }, 0)
  }

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
        onWeeklyModal={() => setShowWeeklyModal(true)}
        tab={tab}
        onTabChange={setTab}
        selectedEntries={selectedEntries}
      />

      <div className="diary-main">
        {/* Editor Header */}
        <div className="diary-editor-header">
          <input 
            type="text" 
            className="diary-title-input" 
            placeholder="今天下午过得很充实" 
            value={activeEntry?.title || ''}
            onChange={(e) => activeEntry && updateEntry(activeEntry.id, { title: e.target.value })}
          />
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            {activeEntry?.date || new Date().toISOString().split('T')[0]}
          </span>
        </div>

        {/* Toolbar - Restored from prototype.html */}
        <div className="diary-toolbar">
          <button className="toolbar-btn" onClick={() => insertFormat('**', '**')}><b>B</b></button>
          <button className="toolbar-btn" onClick={() => insertFormat('*', '*')}><i>I</i></button>
          <button className="toolbar-btn" onClick={() => insertFormat('<u>', '</u>')}><u>U</u></button>
          <div className="toolbar-sep"></div>
          <button className="toolbar-btn" onClick={() => insertFormat('\n# ', '\n')}>H1</button>
          <button className="toolbar-btn" onClick={() => insertFormat('\n## ', '\n')}>H2</button>
          <button className="toolbar-btn" onClick={() => insertFormat('\n- ', '')}>≡</button>
          <div className="toolbar-sep"></div>
          <button className="toolbar-btn" onClick={() => insertFormat('\n> ', '\n')}>❝</button>
          <button className="toolbar-btn" onClick={() => insertFormat('\n---\n', '\n')}>--</button>
        </div>

        {/* Editor Body */}
        <div className="diary-editor-body">
          <textarea 
            ref={textareaRef}
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
            <button className="btn-diary btn-diary-ghost" onClick={() => useAppStore.getState().addToast('日记已保存', 'success')}>保存</button>
            <button className="btn-diary btn-diary-ghost" onClick={() => useAppStore.getState().addToast('结构优化完成', 'info')}>结构优化</button>
            <button 
              className="btn-diary btn-diary-primary"
              onClick={() => {
                if (!showAi) {
                  setIsGeneratingAi(true)
                  setShowAi(true)
                  setTimeout(() => setIsGeneratingAi(false), 1500)
                } else {
                  setShowAi(false)
                }
              }}
            >✨ 乐观分析</button>
          </div>
        </div>

        {/* AI Panel - Absolute slide-up from prototype */}
        <div className={`ai-panel ${showAi ? 'open' : ''}`}>
          <div className="ai-panel-header">
            <div className="ai-panel-title">✨ AI 乐观分析</div>
            <button className="ai-close" onClick={() => setShowAi(false)}>&times;</button>
          </div>
          <div className="ai-content">
            {isGeneratingAi ? (
              <div style={{ padding: '20px 0', textAlign: 'center', color: '#666' }}>
                <Sparkles size={20} className="animate-spin" style={{ margin: '0 auto 12px', color: '#eb5a46' }} />
                AI 正在生成洞察...
              </div>
            ) : (
              <div>
                <p>这段日记体现了你很强的<strong>行动力</strong>和<strong>自律性</strong>。继续保持这种积极的节奏！</p>
                <div style={{ marginTop: '12px' }}>
                  <span className="ai-tag">行动力 +1</span>
                  <span className="ai-tag">番茄钟工作法</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <WeeklySummaryModal 
        isOpen={showWeeklyModal} 
        onClose={() => setShowWeeklyModal(false)}
        selectedCount={selectedEntries.size > 0 ? selectedEntries.size : entries.length}
      />
    </div>
  )
}

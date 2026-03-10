'use client'

import React, { useState, useEffect } from 'react'
import { useTodoStore } from '@/hooks/useTodoStore'
import TodoColumn from './TodoColumn'
import { Plus, Lightbulb } from 'lucide-react'
import IdeaModal from './IdeaModal'

export default function BoardContainer() {
  const { tasks, statuses, contexts, viewMode, setViewMode } = useTodoStore()
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false)
  
  // Columns to display based on viewMode
  const columns = React.useMemo(() => {
    if (viewMode === 'status') {
      return statuses.map(s => ({
        id: s.id,
        title: s.title,
        color: s.color,
        tasks: tasks.filter(t => t.statusId === s.id)
      }))
    } else if (viewMode === 'context') {
      return contexts.map(c => ({
        id: c.id,
        title: c.title,
        color: c.color,
        tasks: tasks.filter(t => t.contextId === c.id)
      }))
    } else if (viewMode === 'date') {
      const dateGroups: Record<string, typeof tasks> = {}
      tasks.forEach(t => {
        // Fallback to today if createdAt is missing, though it shouldn't be
        const dateStr = t.createdAt ? t.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        if (!dateGroups[dateStr]) dateGroups[dateStr] = []
        dateGroups[dateStr].push(t)
      })
      
      const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a))
      
      return sortedDates.map(date => ({
        id: date,
        title: date,
        color: '#0079bf',
        tasks: dateGroups[date]
      }))
    }
    return []
  }, [viewMode, tasks, statuses, contexts])

  return (
    <div id="view-todo" className="view active">
      {/* ── Header ─────────────────────────────────── */}
      <div className="todo-header">
        <h1>Polished Fusion</h1>
        <div className="view-switcher">
          <button 
            onClick={() => setViewMode('status')}
            className={`view-tab ${viewMode === 'status' ? 'active' : ''}`}
          >
            Status
          </button>
          <button 
            onClick={() => setViewMode('context')}
            className={`view-tab ${viewMode === 'context' ? 'active' : ''}`}
          >
            Context
          </button>
          <button 
            onClick={() => setViewMode('date')}
            className={`view-tab ${viewMode === 'date' ? 'active' : ''}`}
          >
            Date
          </button>
        </div>
        <button className="col-action-btn" style={{ marginLeft: '4px' }} title="切换布局 (横向/纵向)">
          <span style={{ fontSize: '14px', filter: 'grayscale(1)', opacity: 0.6 }}>🔃</span>
        </button>

        <div className="header-right">
          <button 
            onClick={() => setIsIdeaModalOpen(true)}
            className="btn-modal-ghost"
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Lightbulb size={16} /> Idea
          </button>
          <button className="btn-primary">
            <span>+</span> New
          </button>
        </div>
      </div>

      {/* ── Board ─────────────────────────────────── */}
      <div className="board-scroll" id="board-scroll">
        {columns.map(col => (
          <TodoColumn 
            key={col.id}
            id={col.id}
            title={col.title}
            color={col.color}
            tasks={col.tasks}
          />
        ))}

        {viewMode === 'context' && (
          <button className="board-add-col">
            + Add List
          </button>
        )}
      </div>

      <IdeaModal isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} />
    </div>
  )
}

'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { TodoTask, TodoStatus, TodoContext } from '@/types'
import TodoCard from '@/components/todo/TodoCard'
import { useTodoStore } from '@/hooks/useTodoStore'

interface TodoColumnProps {
  id: string
  title: string
  tasks: TodoTask[]
  color?: string
  onAddTask?: (colId: string) => void
}

export default function TodoColumn({ id, title, tasks, color, onAddTask }: TodoColumnProps) {
  const { viewMode } = useTodoStore()
  const [isActionOpen, setIsActionOpen] = useState(false)
  const headerStyle = viewMode === 'context' && color ? { borderTop: `4px solid ${color}` } : undefined
  const actionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (actionRef.current && !actionRef.current.contains(event.target as Node)) {
        setIsActionOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="board-col">
      <div className="col-header" style={headerStyle}>
        <input 
          type="text" 
          className="col-title-input" 
          value={title} 
          readOnly
        />
        <div className="col-count">{tasks.length}</div>
        <button className="col-collapse-btn" title="折叠此列">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        </button>
        <div style={{ position: 'relative' }} ref={actionRef}>
          <button 
            className="col-action-btn" 
            onClick={() => setIsActionOpen(!isActionOpen)}
          >
            ⋯
          </button>
          
          {isActionOpen && (
            <div className="col-action-panel" style={{ display: 'flex' }}>
              <button title="向左移动">←</button>
              <button title="向右移动">→</button>
              {viewMode !== 'status' && viewMode !== 'date' && (
                <button className="del-btn" title="删除列表">删除</button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="col-body">
        {tasks.map((task) => (
          <TodoCard key={task.id} task={task} />
        ))}
      </div>

      <button 
        onClick={() => onAddTask?.(id)}
        className="col-add-btn"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Add a card
      </button>
    </div>
  )
}

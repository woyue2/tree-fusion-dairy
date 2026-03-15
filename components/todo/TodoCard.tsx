// INPUT: task
// OUTPUT: 渲染 Todo 单个任务卡片
// POS: components/todo/TodoCard.tsx - Todo 任务展示组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React from 'react'
import { TodoTask } from '@/types'
import { useTodoStore } from '@/hooks/useTodoStore'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TodoCardProps {
  task: TodoTask
}

function strColor(str: string) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = str.charCodeAt(i) + ((h << 5) - h)
  }
  return '#' + (((h & 0xffffff) + 0x1000000).toString(16).slice(-6))
}

export default function TodoCard({ task }: TodoCardProps) {
  const { viewMode, contexts, updateTask, setEditingTaskId } = useTodoStore()
  
  const ctx = contexts.find(c => c.id === task.contextId)
  const isStatusView = viewMode === 'status'
  const statusClass = `status-${task.statusId}`
  const bgColor = task.color && task.color !== '#ffffff' ? task.color : ''
  const dateStr = task.createdAt ? (
    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px' }}>
      🗓️ {task.createdAt.split('T')[0]}
    </div>
  ) : null

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: task.id, 
    data: { type: 'Task', task } 
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    ...(bgColor ? { background: bgColor } : {})
  }

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`task-card ${statusClass}`}
      onClick={() => setEditingTaskId(task.id)}
    >
      {isStatusView && ctx && (
        <div className="task-card-context-bar" style={{ background: ctx.color }}></div>
      )}
      
      <div 
        className="task-card-title" 
        style={task.statusId === 'done' ? { textDecoration: 'line-through', color: '#888' } : undefined}
      >
        {task.title}
      </div>
      
      {task.tags && task.tags.length > 0 && (
        <div className="task-tags">
          {task.tags.map(tag => (
            <span key={tag} className="task-tag" style={{ background: strColor(tag) }}>
              {tag}
            </span>
          ))}
        </div>
      )}
      
      {!isStatusView ? (
        <select 
          className="task-status-select" 
          onClick={e => e.stopPropagation()} 
          value={task.statusId}
          onChange={e => updateTask(task.id, { statusId: e.target.value as any })}
        >
          <option value="todo">To Do</option>
          <option value="doing">In Progress</option>
          <option value="done">Done</option>
          <option value="when-free">When Free</option>
        </select>
      ) : (
        ctx && <div className="task-context-label">📂 {ctx.title}</div>
      )}
      
      {dateStr}
    </div>
  )
}

// INPUT: column properties (id, title, tasks), interactions
// OUTPUT: 渲染 Todo 卡片列/组
// POS: components/todo/TodoColumn.tsx - Todo 状态/上下文分组列组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Plus, MoreHorizontal } from 'lucide-react'
import { TodoTask, TodoStatus, TodoContext } from '@/types'
import TodoCard from '@/components/todo/TodoCard'
import { useTodoStore } from '@/hooks/useTodoStore'
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface TodoColumnProps {
  id: string
  title: string
  tasks: TodoTask[]
  color?: string
  collapsed?: boolean
  onToggleCollapsed?: (id: string, collapsed: boolean) => void
  onAddTask?: (colId: string) => void
  onMoveAbove?: (id: string) => void
  onMoveBelow?: (id: string) => void
  onMoveLeft?: (id: string) => void
  onMoveRight?: (id: string) => void
  canMoveAbove?: boolean
  canMoveBelow?: boolean
  canMoveLeft?: boolean
  canMoveRight?: boolean
}

export default function TodoColumn({ 
  id, title, tasks, color, collapsed = false, onToggleCollapsed, onAddTask, 
  onMoveAbove, onMoveBelow, onMoveLeft, onMoveRight,
  canMoveAbove, canMoveBelow, canMoveLeft, canMoveRight
}: TodoColumnProps) {
  const { viewMode } = useTodoStore()
  const [isActionOpen, setIsActionOpen] = useState(false)
  const headerStyle = viewMode === 'context' && color ? { borderTop: `4px solid ${color}` } : undefined
  const actionRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [title])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { type: 'Column', column: { id, title, color } }
  })

  // same logic as fusion-todo
  const style: React.CSSProperties = {
    width: '260px',
    opacity: isDragging ? 0.6 : (collapsed ? 0.9 : 1),
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div className="board-col" style={style} ref={setNodeRef}>
      <div className="col-header" style={{ ...headerStyle, position: 'relative', padding: '8px', flexDirection: 'row', alignItems: 'flex-start' }}>
        
        <div 
          style={{ flex: 1, display: 'flex', alignItems: 'center', minWidth: 0 }}
        >
          <textarea 
            ref={textareaRef}
            className="col-title-input" 
            defaultValue={title} 
            rows={1}
            onBlur={(e) => useTodoStore.getState().updateColumn(id, viewMode, e.target.value)}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.currentTarget.blur();
              }
              e.stopPropagation();
            }}
            onInput={(e) => {
              const target = e.currentTarget;
              target.style.height = 'auto';
              target.style.height = `${target.scrollHeight}px`;
            }}
            style={{ 
              width: '100%', 
              resize: 'none', 
              overflow: 'hidden',
              minHeight: '1.5em',
              lineHeight: '1.2',
              display: 'block',
              wordBreak: 'break-word'
            }}
          />
        </div>
        
        <button 
          className="col-collapse-btn" 
          onClick={() => onToggleCollapsed?.(id, !collapsed)}
          title={collapsed ? "展开此列" : "折叠此列"}
        >
          {collapsed ? "展开" : "折叠"}
        </button>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flexShrink: 0 }} ref={actionRef}>
              <button 
                className="col-action-btn ml-1" 
                onClick={() => setIsActionOpen(!isActionOpen)}
                title="更多动作"
              >
                ⋯
              </button>
              
              {isActionOpen && (
                <div className="col-action-panel absolute right-0 top-full mt-1 bg-white border border-gray-200 shadow-md rounded flex z-10" style={{ padding: '2px', gap: '2px', width: 'max-content' }}>
                  <button 
                    title={canMoveAbove ? '移到左侧邻列上方或解除堆叠' : '不可用'} 
                    disabled={!canMoveAbove}
                    onClick={() => { onMoveAbove?.(id); setIsActionOpen(false); }}
                    style={{ opacity: canMoveAbove ? 1 : 0.4, padding: '4px 8px', borderRadius: '4px', cursor: canMoveAbove ? 'pointer' : 'not-allowed' }}
                  >↥</button>
                  <button 
                    title={canMoveBelow ? '移到左侧邻列下方' : '不可用'} 
                    disabled={!canMoveBelow}
                    onClick={() => { onMoveBelow?.(id); setIsActionOpen(false); }}
                    style={{ opacity: canMoveBelow ? 1 : 0.4, padding: '4px 8px', borderRadius: '4px', cursor: canMoveBelow ? 'pointer' : 'not-allowed' }}
                  >↧</button>
                  <button 
                    title={canMoveLeft ? '向左移动' : '不可用'} 
                    disabled={!canMoveLeft}
                    onClick={() => { onMoveLeft?.(id); setIsActionOpen(false); }}
                    style={{ opacity: canMoveLeft ? 1 : 0.4, padding: '4px 8px', borderRadius: '4px', cursor: canMoveLeft ? 'pointer' : 'not-allowed' }}
                  >←</button>
                  <button 
                    title={canMoveRight ? '向右移动' : '不可用'} 
                    disabled={!canMoveRight}
                    onClick={() => { onMoveRight?.(id); setIsActionOpen(false); }}
                    style={{ opacity: canMoveRight ? 1 : 0.4, padding: '4px 8px', borderRadius: '4px', cursor: canMoveRight ? 'pointer' : 'not-allowed' }}
                  >→</button>
                  {viewMode !== 'date' && (
                    <button 
                      title="删除列表" 
                      onClick={() => {
                        if (confirm('Delete column?')) {
                          useTodoStore.getState().deleteColumn(id, viewMode)
                          setIsActionOpen(false)
                        }
                      }}
                      style={{ padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', color: 'red', fontWeight: 'bold' }}
                    >删</button>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              {...attributes}
              {...listeners}
              className="col-action-btn ml-1"
              style={{ cursor: 'grab', padding: '0 6px' }}
              title="拖拽列"
            >
              ≡
            </button>

            <div className="col-count" style={{ flexShrink: 0, marginLeft: '4px' }}>{tasks.length}</div>
      </div>

      {!collapsed && (
        <>
          <div className="col-body">
            <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <TodoCard key={task.id} task={task} />
              ))}
            </SortableContext>
          </div>

          <button 
            onClick={() => onAddTask?.(id)}
            className="col-add-btn"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Add a card
          </button>
        </>
      )}
    </div>
  )
}

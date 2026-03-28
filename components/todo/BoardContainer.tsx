// INPUT: 无 (状态读取自 useTodoStore)
// OUTPUT: 渲染 Todo 看板主容器组件
// POS: components/todo/BoardContainer.tsx - Todo 看板模块入口组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState, useEffect, useOptimistic, useTransition, useRef } from 'react'
import { useTodoStore } from '@/hooks/useTodoStore'
import TodoColumn from './TodoColumn'
import TodoCard from './TodoCard'
import TaskModal from './TaskModal'
import { Plus, Lightbulb } from 'lucide-react'
import IdeaModal from './IdeaModal'
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core'
import { arrayMove, sortableKeyboardCoordinates, SortableContext, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { TodoTask } from '@/types'

const dropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: { active: { opacity: '0.4' } }
  })
}

export default function BoardContainer() {
  const { tasks, statuses, contexts, viewMode, setViewMode, setTasks, setStatuses, setContexts, editingTaskId, setEditingTaskId } = useTodoStore()
  const [isIdeaModalOpen, setIsIdeaModalOpen] = useState(false)
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false)
  const [defaultCreateColId, setDefaultCreateColId] = useState<string>('')
  const [isVertical, setIsVertical] = useState(false)
  const [activeTask, setActiveTask] = useState<TodoTask | null>(null)
  const [isPending, startTransition] = useTransition()
  
  // ── Optimistic State ──────────────────────────────────────
  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state, updatedTasks: TodoTask[]) => updatedTasks
  )
  const [optimisticStatuses, setOptimisticStatuses] = useOptimistic(
    statuses,
    (state, updatedStatuses: any[]) => updatedStatuses
  )
  const [optimisticContexts, setOptimisticContexts] = useOptimistic(
    contexts,
    (state, updatedContexts: any[]) => updatedContexts
  )

  // ── Column Calculation ────────────────────────────────────
  const columns = React.useMemo(() => {
    if (viewMode === 'status') {
      return optimisticStatuses.map(s => ({
        id: s.id,
        title: s.title,
        color: s.color,
        collapsed: s.collapsed || false,
        belowOf: s.belowOf || null,
        tasks: optimisticTasks.filter(t => t.statusId === s.id)
      }))
    } else if (viewMode === 'context') {
      return optimisticContexts.map(c => ({
        id: c.id,
        title: c.title,
        color: c.color,
        collapsed: c.collapsed || false,
        belowOf: c.belowOf || null,
        tasks: optimisticTasks.filter(t => t.contextId === c.id)
      }))
    } else if (viewMode === 'date') {
      const dateGroups: Record<string, typeof tasks> = {}
      optimisticTasks.forEach(t => {
        const dateStr = t.createdAt ? t.createdAt.split('T')[0] : new Date().toISOString().split('T')[0]
        if (!dateGroups[dateStr]) dateGroups[dateStr] = []
        dateGroups[dateStr].push(t)
      })
      
      const sortedDates = Object.keys(dateGroups).sort((a, b) => b.localeCompare(a))
      
      return sortedDates.map(date => ({
        id: date,
        title: date,
        color: '#0079bf',
        collapsed: false,
        belowOf: null,
        tasks: dateGroups[date]
      }))
    }
    return []
  }, [viewMode, optimisticTasks, optimisticStatuses, optimisticContexts])

  const stacks = React.useMemo(() => {
    const columnsById = new Map(columns.map(c => [c.id, c]))
    const childrenByParent = new Map<string, typeof columns>()
    columns.forEach(c => {
      if (c.belowOf && columnsById.has(c.belowOf)) {
        const list = childrenByParent.get(c.belowOf) || []
        list.push(c)
        childrenByParent.set(c.belowOf, list)
      }
    })
    
    const anchorColumns = columns.filter(c => !c.belowOf || !columnsById.has(c.belowOf))
    return anchorColumns.map(anchor => {
      const result: typeof columns = []
      const visit = (node: typeof columns[0]) => {
        result.push(node)
        const children = childrenByParent.get(node.id) || []
        children.forEach(child => visit(child))
      }
      visit(anchor)
      return result
    })
  }, [columns])

  const anchorOrder = React.useMemo(() => stacks.map(s => s[0].id), [stacks])
  const anchorById = React.useMemo(() => {
    const map = new Map<string, string>()
    stacks.forEach(stack => {
      const anchorId = stack[0].id
      stack.forEach(col => map.set(col.id, anchorId))
    })
    return map
  }, [stacks])

  // ── Handlers ──────────────────────────────────────────────
  const handleMoveAbove = (columnId: string) => {
    const anchorId = anchorById.get(columnId)
    if (!anchorId) return
    const columnsById = new Map(columns.map(c => [c.id, c]))
    const isStackChild = !!(columnsById.get(columnId)?.belowOf)
    
    startTransition(() => {
      if (isStackChild) {
        if (viewMode === 'status') {
          setOptimisticStatuses(optimisticStatuses.map(s => s.id === columnId ? { ...s, belowOf: null } : s))
        } else if (viewMode === 'context') {
          setOptimisticContexts(optimisticContexts.map(c => c.id === columnId ? { ...c, belowOf: null } : c))
        }
        useTodoStore.getState().updateColumnBelowOf(columnId, viewMode, null)
        return
      }

      const anchorIndex = anchorOrder.indexOf(anchorId)
      if (anchorIndex <= 0) return
      const leftAnchorId = anchorOrder[anchorIndex - 1]
      
      const currentIndex = columns.findIndex(c => c.id === columnId)
      const leftIndex = columns.findIndex(c => c.id === leftAnchorId)
      if (currentIndex === -1 || leftIndex === -1) return
      
      const nextColumns = arrayMove(columns, currentIndex, leftIndex)
      const leftAnchorBelowOf = columnsById.get(leftAnchorId)?.belowOf ?? null
      
      if (viewMode === 'status') {
        const nextStatuses = nextColumns.map(nc => optimisticStatuses.find(s => s.id === nc.id)!).map(s => s.id === columnId ? { ...s, belowOf: leftAnchorBelowOf } : s)
        setOptimisticStatuses(nextStatuses)
      } else if (viewMode === 'context') {
        const nextContexts = nextColumns.map(nc => optimisticContexts.find(c => c.id === nc.id)!).map(c => c.id === columnId ? { ...c, belowOf: leftAnchorBelowOf } : c)
        setOptimisticContexts(nextContexts)
      }
      
      useTodoStore.getState().reorderColumns(nextColumns.map(c => c.id), viewMode)
      useTodoStore.getState().updateColumnBelowOf(columnId, viewMode, leftAnchorBelowOf)
    })
  }

  const handleMoveBelow = (columnId: string) => {
    const anchorId = anchorById.get(columnId)
    if (!anchorId) return
    const anchorIndex = anchorOrder.indexOf(anchorId)
    if (anchorIndex <= 0) return
    const leftAnchorId = anchorOrder[anchorIndex - 1]
    
    const currentIndex = columns.findIndex(c => c.id === columnId)
    const leftIndex = columns.findIndex(c => c.id === leftAnchorId)
    if (currentIndex === -1 || leftIndex === -1) return
    
    const nextColumns = arrayMove(columns, currentIndex, leftIndex + 1)
    
    startTransition(() => {
      if (viewMode === 'status') {
        const nextStatuses = nextColumns.map(nc => optimisticStatuses.find(s => s.id === nc.id)!).map(s => s.id === columnId ? { ...s, belowOf: leftAnchorId } : s)
        setOptimisticStatuses(nextStatuses)
      } else if (viewMode === 'context') {
        const nextContexts = nextColumns.map(nc => optimisticContexts.find(c => c.id === nc.id)!).map(c => c.id === columnId ? { ...c, belowOf: leftAnchorId } : c)
        setOptimisticContexts(nextContexts)
      }
      useTodoStore.getState().reorderColumns(nextColumns.map(c => c.id), viewMode)
      useTodoStore.getState().updateColumnBelowOf(columnId, viewMode, leftAnchorId)
    })
  }

  const handleMoveLeft = (columnId: string) => {
    const anchorId = anchorById.get(columnId)
    if (!anchorId || anchorId !== columnId) return
    const anchorIndex = anchorOrder.indexOf(anchorId)
    if (anchorIndex <= 0) return
    const leftAnchorId = anchorOrder[anchorIndex - 1]
    
    const currentIndex = columns.findIndex(c => c.id === columnId)
    const leftIndex = columns.findIndex(c => c.id === leftAnchorId)
    if (currentIndex === -1 || leftIndex === -1) return
    
    const nextColumns = arrayMove(columns, currentIndex, leftIndex)
    
    startTransition(() => {
      if (viewMode === 'status') {
        const nextStatuses = nextColumns.map(nc => optimisticStatuses.find(s => s.id === nc.id)!).map(s => s.id === columnId ? { ...s, belowOf: null } : s)
        setOptimisticStatuses(nextStatuses)
      } else if (viewMode === 'context') {
        const nextContexts = nextColumns.map(nc => optimisticContexts.find(c => c.id === nc.id)!).map(c => c.id === columnId ? { ...c, belowOf: null } : c)
        setOptimisticContexts(nextContexts)
      }
      useTodoStore.getState().reorderColumns(nextColumns.map(c => c.id), viewMode)
      useTodoStore.getState().updateColumnBelowOf(columnId, viewMode, null)
    })
  }

  const handleMoveRight = (columnId: string) => {
    const anchorId = anchorById.get(columnId)
    if (!anchorId || anchorId !== columnId) return
    const anchorIndex = anchorOrder.indexOf(anchorId)
    if (anchorIndex === -1 || anchorIndex >= anchorOrder.length - 1) return
    const rightAnchorId = anchorOrder[anchorIndex + 1]
    
    const currentIndex = columns.findIndex(c => c.id === columnId)
    const rightIndex = columns.findIndex(c => c.id === rightAnchorId)
    if (currentIndex === -1 || rightIndex === -1) return
    
    const targetIndex = currentIndex < rightIndex ? rightIndex : rightIndex + 1
    const nextColumns = arrayMove(columns, currentIndex, targetIndex)
    
    startTransition(() => {
      if (viewMode === 'status') {
        const nextStatuses = nextColumns.map(nc => optimisticStatuses.find(s => s.id === nc.id)!).map(s => s.id === columnId ? { ...s, belowOf: null } : s)
        setOptimisticStatuses(nextStatuses)
      } else if (viewMode === 'context') {
        const nextContexts = nextColumns.map(nc => optimisticContexts.find(c => c.id === nc.id)!).map(c => c.id === columnId ? { ...c, belowOf: null } : c)
        setOptimisticContexts(nextContexts)
      }
      useTodoStore.getState().reorderColumns(nextColumns.map(c => c.id), viewMode)
      useTodoStore.getState().updateColumnBelowOf(columnId, viewMode, null)
    })
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (e: DragStartEvent) => {
    if (e.active.data.current?.type === 'Task') {
      setActiveTask(e.active.data.current.task)
    }
  }

  const handleDragOver = (e: DragOverEvent) => {
    const { active, over } = e
    if (!over || active.data.current?.type !== 'Task') return

    const activeId = active.id
    const overId = over.id
    if (activeId === overId) return

    const activeTaskData = optimisticTasks.find(t => t.id === activeId)
    const overTaskData = optimisticTasks.find(t => t.id === overId)

    if (!activeTaskData) return

    const getContainer = (t: TodoTask) => {
      if (viewMode === 'status') return t.statusId
      if (viewMode === 'context') return t.contextId
      return t.createdAt ? t.createdAt.split('T')[0] : ''
    }
    
    const activeContainer = getContainer(activeTaskData)
    let overContainer = ''
    
    if (overTaskData) {
      overContainer = getContainer(overTaskData)
    } else if (columns.some(c => c.id === overId)) {
      overContainer = overId as string
    } else {
      return
    }

    if (activeContainer !== overContainer) {
      const activeIdx = optimisticTasks.findIndex(t => t.id === activeId)
      const overIdx = overTaskData ? optimisticTasks.findIndex(t => t.id === overId) : optimisticTasks.length
      
      let newTasks = [...optimisticTasks]
      const t = { ...newTasks[activeIdx] }
      
      if (viewMode === 'status') t.statusId = overContainer as any
      else if (viewMode === 'context') t.contextId = overContainer
      else if (viewMode === 'date') t.createdAt = overContainer
      
      newTasks[activeIdx] = t
      newTasks = arrayMove(newTasks, activeIdx, overIdx)
      
      startTransition(() => {
        setOptimisticTasks(newTasks)
      })
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = e
    if (!over) return

    if (active.data.current?.type === 'Column') {
      const flattened = stacks.flat()
      const oldIdx = flattened.findIndex(c => c.id === active.id)
      const newIdx = flattened.findIndex(c => c.id === over.id)
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        const newColumns = arrayMove(flattened, oldIdx, newIdx)
        startTransition(() => {
          if (viewMode === 'status') {
            setOptimisticStatuses(newColumns.map(nc => optimisticStatuses.find(s => s.id === nc.id)!))
          } else if (viewMode === 'context') {
            setOptimisticContexts(newColumns.map(nc => optimisticContexts.find(c => c.id === nc.id)!))
          }
          useTodoStore.getState().reorderColumns(newColumns.map(c => c.id), viewMode)
        })
      }
      return
    }

    if (active.data.current?.type === 'Task') {
      const finalTask = optimisticTasks.find(t => t.id === active.id)
      if (!finalTask) return

      const oldIdx = optimisticTasks.findIndex(t => t.id === active.id)
      const newIdx = optimisticTasks.findIndex(t => t.id === over.id)

      if (oldIdx !== -1) {
        const reordered = newIdx !== -1 && oldIdx !== newIdx
          ? arrayMove(optimisticTasks, oldIdx, newIdx)
          : optimisticTasks

        startTransition(() => {
          setOptimisticTasks(reordered)
          setTasks(reordered)
        })

        // Persist column change + order
        useTodoStore.getState().moveTask(
          finalTask.id,
          finalTask.statusId,
          finalTask.contextId,
          newIdx !== -1 ? newIdx : oldIdx
        )
      }
    }
  }

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
        <button 
          className="col-action-btn" 
          style={{ marginLeft: '4px' }} 
          title="切换布局 (横向/纵向)"
          onClick={() => setIsVertical(!isVertical)}
        >
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
          <button 
            className="btn-primary" 
            onClick={() => {
              setDefaultCreateColId('')
              setIsCreateTaskOpen(true)
            }}
          >
            <span>+</span> New
          </button>
        </div>
      </div>

      {/* ── Board ─────────────────────────────────── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board-scroll" id="board-scroll" style={{ flexDirection: isVertical ? 'column' : 'row' }}>
          <SortableContext items={stacks.flat().map(c => c.id)} strategy={horizontalListSortingStrategy}>
            {stacks.map(stack => {
              const anchorId = stack[0].id
              const anchorIndex = anchorOrder.indexOf(anchorId)
              const hasLeftAnchor = anchorIndex > 0
              const hasRightAnchor = anchorIndex >= 0 && anchorIndex < anchorOrder.length - 1
              
              return (
                <div key={anchorId} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {stack.map((col: any) => {
                    const isAnchor = col.id === anchorId
                    const columnsById = new Map(columns.map(c => [c.id, c]))
                    const isStackChild = !!(columnsById.get(col.id)?.belowOf)
                    return (
                      <TodoColumn 
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        color={col.color}
                        tasks={col.tasks}
                        collapsed={col.collapsed}
                        onToggleCollapsed={(id: string, collapsed: boolean) => useTodoStore.getState().updateColumnCollapsed(id, viewMode, collapsed)}
                        onAddTask={(colId: string) => {
                          setDefaultCreateColId(colId)
                          setIsCreateTaskOpen(true)
                        }}
                        onMoveAbove={handleMoveAbove}
                        onMoveBelow={handleMoveBelow}
                        onMoveLeft={handleMoveLeft}
                        onMoveRight={handleMoveRight}
                        canMoveAbove={hasLeftAnchor || isStackChild}
                        canMoveBelow={hasLeftAnchor}
                        canMoveLeft={isAnchor && hasLeftAnchor}
                        canMoveRight={isAnchor && hasRightAnchor}
                      />
                    )
                  })}
                </div>
              )
            })}
          </SortableContext>

          {viewMode !== 'date' && (
            <button 
              className="board-add-col"
              onClick={() => {
                const title = prompt('Enter new list title:')
                if (title) {
                  useTodoStore.getState().addColumn(title, viewMode)
                }
              }}
            >
              + Add List
            </button>
          )}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <TodoCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      <IdeaModal isOpen={isIdeaModalOpen} onClose={() => setIsIdeaModalOpen(false)} />
      
      {/* Edit Mode Modal */}
      <TaskModal 
        isOpen={!!editingTaskId} 
        onClose={() => setEditingTaskId(null)} 
        task={tasks.find(t => t.id === editingTaskId)} 
      />
      
      {/* Create Mode Modal */}
      <TaskModal 
        isOpen={isCreateTaskOpen} 
        onClose={() => setIsCreateTaskOpen(false)} 
        task={null}
        defaultStatusId={viewMode === 'status' ? defaultCreateColId : undefined}
        defaultContextId={viewMode === 'context' ? defaultCreateColId : undefined}
      />
    </div>
  )
}

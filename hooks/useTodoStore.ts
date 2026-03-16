/**
 * [INPUT]:    依赖 lib/db (Dexie), useAppStore, app/actions/sync
 * [OUTPUT]:   管理任务、状态和上下文的全量同步与状态更新
 * [POS]:      hooks/useTodoStore.ts - Todo 模块核心 Store
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand'
import { TodoTask, TodoStatus, TodoContext, TodoStatusId } from '@/types'
import { db } from '@/lib/db'
import { fetchUserDataAction } from '@/app/actions/sync'

interface TodoState {
  tasks: TodoTask[]
  statuses: TodoStatus[]
  contexts: TodoContext[]
  viewMode: 'status' | 'context' | 'date'
  isLoading: boolean
  editingTaskId: string | null
  userId: string
  
  // Actions
  setTasks: (tasks: TodoTask[]) => void
  setStatuses: (statuses: TodoStatus[]) => void
  setContexts: (contexts: TodoContext[]) => void
  setViewMode: (mode: 'status' | 'context' | 'date') => void
  setEditingTaskId: (id: string | null) => void
  
  loadAll: () => Promise<void>
  pullAll: () => Promise<void>
  addTask: (task: Omit<TodoTask, 'id' | 'userId' | 'orderIndex' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateTask: (id: string, updates: Partial<TodoTask>) => Promise<void>
  deleteTask: (id: string) => Promise<void>
  
  moveTask: (taskId: string, newStatusId: TodoStatusId, newContextId: string, newIndex: number) => Promise<void>
  updateColumnCollapsed: (id: string, viewMode: 'status' | 'context' | 'date', collapsed: boolean) => Promise<void>
  updateColumnBelowOf: (id: string, viewMode: 'status' | 'context' | 'date', belowOf: string | null) => Promise<void>
  updateColumn: (id: string, viewMode: 'status' | 'context' | 'date', title: string) => Promise<void>
  addColumn: (title: string, viewMode: 'status' | 'context' | 'date') => Promise<void>
  deleteColumn: (id: string, viewMode: 'status' | 'context' | 'date') => Promise<void>
  reorderColumns: (newOrderIds: string[], viewMode: 'status' | 'context' | 'date') => Promise<void>
}

export const useTodoStore = create<TodoState>((set, get) => ({
  tasks: [],
  statuses: [],
  contexts: [],
  viewMode: 'status',
  isLoading: false,
  editingTaskId: null,
  userId: 'default-user',

  setTasks: (tasks) => set({ tasks }),
  setStatuses: (statuses) => set({ statuses }),
  setContexts: (contexts) => set({ contexts }),
  setViewMode: (viewMode) => set({ viewMode }),
  setEditingTaskId: (editingTaskId) => set({ editingTaskId }),

  loadAll: async () => {
    set({ isLoading: true })
    const [tasks, statuses, contexts] = await Promise.all([
      db.tasks.where('userId').equals('default-user').and(t => !t.deletedAt).toArray(),
      db.statuses.where('userId').equals('default-user').toArray(),
      db.contexts.where('userId').equals('default-user').toArray()
    ])
    
    // Seed default statuses/contexts if empty
    if (statuses.length === 0) {
      const defaults: any[] = [
        { id: 'todo', userId: get().userId, title: 'To Do', color: '#dfe1e6', collapsed: false, orderIndex: 0 },
        { id: 'doing', userId: get().userId, title: 'In Progress', color: '#0079bf', collapsed: false, orderIndex: 1 },
        { id: 'done', userId: get().userId, title: 'Done', color: '#61bd4f', collapsed: false, orderIndex: 2 }
      ]
      await db.statuses.bulkPut(defaults) // [FIX] 根因: 使用 bulkPut 避免 userId 变更后语义化 ID 冲突
      set({ statuses: defaults })
    } else {
      set({ statuses: statuses as any })
    }

    if (contexts.length === 0) {
      const defaults: any[] = [
        { id: 'c1', userId: get().userId, title: '💼 工作', color: '#0079bf', collapsed: false, orderIndex: 0 },
        { id: 'c2', userId: get().userId, title: '🏠 个人', color: '#61bd4f', collapsed: false, orderIndex: 1 }
      ]
      await db.contexts.bulkPut(defaults) // [FIX] 根因: 使用 bulkPut 避免 userId 变更后语义化 ID 冲突
      set({ contexts: defaults })
    } else {
      set({ contexts: contexts as any })
    }

    set({ tasks: tasks as any, isLoading: false })
  },

  pullAll: async () => {
    set({ isLoading: true })
    try {
      const { tasks, statuses, contexts } = await fetchUserDataAction('default-user')
      
      if (tasks.length > 0) {
        const localTasks = tasks.map((t: any) => ({
          id: t.id,
          userId: 'default-user',
          title: t.title,
          statusId: t.status_id,
          contextId: t.context_id,
          color: t.color,
          tags: t.tags,
          orderIndex: t.order_index,
          createdAt: t.created_at,
          updatedAt: t.updated_at,
          deletedAt: t.deleted_at,
          _dirty: 0
        }))
        await db.tasks.bulkPut(localTasks)
      }

      if (statuses.length > 0) {
        const localStatuses = statuses.map((s: any) => ({
          id: s.id,
          userId: s.user_id,
          title: s.title,
          color: s.color,
          collapsed: s.collapsed,
          orderIndex: s.order_index,
          _dirty: 0
        }))
        await db.statuses.bulkPut(localStatuses)
      }

      if (contexts.length > 0) {
        const localContexts = contexts.map((c: any) => ({
          id: c.id,
          userId: c.user_id,
          title: c.title,
          color: c.color,
          collapsed: c.collapsed,
          orderIndex: c.order_index,
          _dirty: 0
        }))
        await db.contexts.bulkPut(localContexts)
      }

      await get().loadAll()
    } catch (err) {
      console.error('[TodoStore] Pull failed:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  addTask: async (task) => {
    const id = crypto.randomUUID()
    const newTask = {
      ...task,
      id,
      userId: get().userId,
      orderIndex: get().tasks.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _dirty: 1
    }
    await db.tasks.add(newTask as any)
    await get().loadAll()
  },
  
  updateTask: async (id, updates) => {
    await db.tasks.update(id, { ...updates, updatedAt: new Date().toISOString(), _dirty: 1 })
    await get().loadAll()
  },
  
  deleteTask: async (id) => {
    await db.tasks.update(id, { deletedAt: new Date().toISOString(), _dirty: 1 })
    await get().loadAll()
  },

  moveTask: async (taskId, newStatusId, newContextId, newIndex) => {
    await db.tasks.update(taskId, { 
      statusId: newStatusId, 
      contextId: newContextId, 
      orderIndex: newIndex,
      updatedAt: new Date().toISOString(),
      _dirty: 1 
    })
    await get().loadAll()
  },

  updateColumnCollapsed: async (id, viewMode, collapsed) => {
    if (viewMode === 'status') {
      await db.statuses.update(id, { collapsed, _dirty: 1 })
    } else if (viewMode === 'context') {
      await db.contexts.update(id, { collapsed, _dirty: 1 })
    }
    await get().loadAll()
  },

  updateColumnBelowOf: async (id, viewMode, belowOf) => {
    // This belowOf feature needs schema adjustment or handling in local
    // For now we just update and reload
    await get().loadAll()
  },

  updateColumn: async (id, viewMode, title) => {
    if (viewMode === 'status') {
      await db.statuses.update(id, { title, _dirty: 1 })
    } else if (viewMode === 'context') {
      await db.contexts.update(id, { title, _dirty: 1 })
    }
    await get().loadAll()
  },

  addColumn: async (title, viewMode) => {
    const id = crypto.randomUUID()
    if (viewMode === 'status') {
      await db.statuses.add({ id, userId: get().userId, title, color: '#9e9e9e', collapsed: false, orderIndex: get().statuses.length, _dirty: 1 })
    } else if (viewMode === 'context') {
      await db.contexts.add({ id, userId: get().userId, title, color: '#9e9e9e', collapsed: false, orderIndex: get().contexts.length, _dirty: 1 })
    }
    await get().loadAll()
  },

  deleteColumn: async (id, viewMode) => {
    if (viewMode === 'status') {
      await db.statuses.delete(id)
    } else if (viewMode === 'context') {
      await db.contexts.delete(id)
    }
    await get().loadAll()
  },

  reorderColumns: async (newOrderIds, viewMode) => {
    // Basic implementation: update orderIndex for all
    for (let i = 0; i < newOrderIds.length; i++) {
      const id = newOrderIds[i]
      if (viewMode === 'status') await db.statuses.update(id, { orderIndex: i, _dirty: 1 })
      else if (viewMode === 'context') await db.contexts.update(id, { orderIndex: i, _dirty: 1 })
    }
    await get().loadAll()
  }
}))

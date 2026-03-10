import { create } from 'zustand'
import { TodoTask, TodoStatus, TodoContext, TodoStatusId } from '@/types'

interface TodoState {
  tasks: TodoTask[]
  statuses: TodoStatus[]
  contexts: TodoContext[]
  viewMode: 'status' | 'context' | 'date'
  isLoading: boolean
  
  // Actions
  setTasks: (tasks: TodoTask[]) => void
  setStatuses: (statuses: TodoStatus[]) => void
  setContexts: (contexts: TodoContext[]) => void
  setViewMode: (mode: 'status' | 'context' | 'date') => void
  
  addTask: (task: TodoTask) => void
  updateTask: (id: string, updates: Partial<TodoTask>) => void
  deleteTask: (id: string) => void
  
  moveTask: (taskId: string, newStatusId: TodoStatusId, newContextId: string, newIndex: number) => void
}

export const useTodoStore = create<TodoState>((set) => ({
  tasks: [
    { id:'t1', title:'整合 fusion-todo 前端组件到新框架', statusId:'doing', contextId:'c1', tags:['feature'], createdAt: '2026-03-10' },
    { id:'t2', title:'设计 Supabase 数据库 Schema', statusId:'todo', contextId:'c1', tags:['urgent'], createdAt: '2026-03-10' },
    { id:'t3', title:'编写 HTML 原型并确认交互', statusId:'doing', contextId:'c1', tags:[], createdAt: '2026-03-11' },
    { id:'t4', title:'迁移 diary-app 到 Next.js', statusId:'todo', contextId:'c1', tags:[], createdAt: '2026-03-11' },
    { id:'t5', title:'读《原子习惯》第5章', statusId:'todo', contextId:'c2', tags:[], createdAt: '2026-03-12' },
    { id:'t6', title:'健身 30 分钟', statusId:'done', contextId:'c2', tags:[], createdAt: '2026-03-12' },
    { id:'t7', title:'探索 AI 周记功能', statusId:'done', contextId:'c3', tags:['idea'], createdAt: '2026-03-13' },
    { id:'t8', title:'todo.db 迁移 Supabase 脚本', statusId:'todo', contextId:'c1', tags:['urgent'], createdAt: '2026-03-13' },
    { id:'t9', title:'购物：牛奶 + 咖啡豆', statusId:'done', contextId:'c2', tags:[], createdAt: '2026-03-14' },
    { id:'t10', title:'Three.js 知识图谱可视化 PoC', statusId:'when-free', contextId:'c3', tags:['idea'], createdAt: '2026-03-14' },
  ],

  statuses: [
    { id: 'todo', title: 'To Do', color: '#dfe1e6' },
    { id: 'doing', title: 'In Progress', color: '#0079bf' },
    { id: 'done', title: 'Done', color: '#61bd4f' },
    { id: 'when-free', title: 'When Free', color: '#9e9e9e' },
  ],
  contexts: [
    { id:'c1', title:'💼 工作',  color:'#0079bf' },
    { id:'c2', title:'🏠 个人',  color:'#61bd4f' },
    { id:'c3', title:'💡 想法',  color:'#ff9f1a' },
  ],
  viewMode: 'status',
  isLoading: false,

  setTasks: (tasks) => set({ tasks }),
  setStatuses: (statuses) => set({ statuses }),
  setContexts: (contexts) => set({ contexts }),
  setViewMode: (viewMode) => set({ viewMode }),

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t))
  })),
  
  deleteTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id)
  })),

  moveTask: (taskId, newStatusId, newContextId, newIndex) => set((state) => {
    const updatedTasks = [...state.tasks]
    const taskIdx = updatedTasks.findIndex(t => t.id === taskId)
    if (taskIdx === -1) return state

    const [task] = updatedTasks.splice(taskIdx, 1)
    const movedTask = { 
      ...task, 
      statusId: newStatusId, 
      contextId: newContextId,
      orderIndex: newIndex 
    }
    
    // Simple re-insertion logic, real implementation might need more care with orderIndex
    updatedTasks.splice(newIndex, 0, movedTask)
    
    return { tasks: updatedTasks }
  })
}))

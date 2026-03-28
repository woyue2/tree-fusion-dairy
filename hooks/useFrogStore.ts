/**
 * [INPUT]:    依赖 lib/db (Dexie), useTodoStore
 * [OUTPUT]:   管理 "青蛙没关系" (任务统计 + 番茄钟 + 明细日志) 的状态
 * [POS]:      hooks/useFrogStore.ts - Frog Tracker Module Store
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand'
import { db, LocalPomodoro, LocalFrogLog } from '@/lib/db'
import { useTodoStore } from './useTodoStore'

interface FrogDailyStats {
  date: string
  completedTasks: number
  pomodoroCount: number
}

interface FrogState {
  pomodoros: LocalPomodoro[]
  logs: LocalFrogLog[]
  isLoading: boolean
  userId: string

  // Actions
  loadPomodoros: () => Promise<void>
  loadLogs: (date: string) => Promise<void>
  updatePomodoro: (date: string, delta: number) => Promise<void>
  addTaskLog: (date: string, delta: number, label: string) => Promise<void>
  getFrogStats: (days?: number) => FrogDailyStats[]
}

function newId() {
  return crypto.randomUUID()
}

export const useFrogStore = create<FrogState>((set, get) => ({
  pomodoros: [],
  logs: [],
  isLoading: false,
  userId: 'default-user',

  loadPomodoros: async () => {
    set({ isLoading: true })
    const data = await db.pomodoros.where('userId').equals(get().userId).toArray()
    set({ pomodoros: data, isLoading: false })
  },

  loadLogs: async (date: string) => {
    const userId = get().userId
    const data = await db.frogLogs
      .where('date').equals(date)
      .filter(log => log.userId === userId)
      .sortBy('time')
    // newest first
    set({ logs: data.reverse() })
  },

  updatePomodoro: async (date, delta) => {
    const userId = get().userId
    const id = `${date}-${userId}`
    const existing = await db.pomodoros.get(id)

    if (existing) {
      const newCount = Math.max(0, existing.count + delta)
      await db.pomodoros.update(id, { count: newCount, _dirty: 1 })
    } else {
      const newCount = Math.max(0, delta)
      await db.pomodoros.add({ id, userId, date, count: newCount, _dirty: 1 })
    }

    // Write log entry
    await db.frogLogs.add({
      id: newId(),
      userId,
      date,
      time: new Date().toISOString(),
      type: 'pomodoro',
      delta,
      label: '番茄钟'
    })

    await get().loadPomodoros()
    await get().loadLogs(date)
  },

  addTaskLog: async (date, delta, label) => {
    const userId = get().userId
    await db.frogLogs.add({
      id: newId(),
      userId,
      date,
      time: new Date().toISOString(),
      type: 'task',
      delta,
      label
    })
    await get().loadLogs(date)
  },

  getFrogStats: (days = 30) => {
    const tasks = useTodoStore.getState().tasks
    const pomodoros = get().pomodoros

    const stats: FrogDailyStats[] = []
    const now = new Date()

    for (let i = 0; i < days; i++) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]

      const doneCount = tasks.filter(t => {
        if (t.statusId !== 'done') return false
        const taskDate = t.updatedAt ? t.updatedAt.split('T')[0] : ''
        return taskDate === dateStr
      }).length

      const pomo = pomodoros.find(p => p.date === dateStr)

      stats.push({
        date: dateStr,
        completedTasks: doneCount,
        pomodoroCount: pomo?.count || 0
      })
    }

    return stats
  }
}))

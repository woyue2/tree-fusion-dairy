/**
 * [INPUT]:    依赖 lib/db (Dexie) 和 app/actions/sync (Server Actions)
 * [OUTPUT]:   管理情绪分数列表、计算滚动平均、处理云端拉取同步
 * [POS]:      hooks/useMoodStore.ts - 情绪领域状态管理
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
import { create } from 'zustand'
import { Mood } from '@/types'
import { db } from '@/lib/db'
import { pullMoodsAction } from '@/app/actions/sync'

interface MoodState {
  moods: Mood[]
  isLoading: boolean
  userId: string
  
  // Actions
  setMoods: (moods: Mood[]) => void
  addMood: (mood: Omit<Mood, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateMood: (id: string, updates: Partial<Mood>) => Promise<void>
  loadMoods: () => Promise<void>
  pullMoods: () => Promise<void>
  
  // Requirement B: Rolling Averages
  getRollingAverage: (days: number) => number
}

export const useMoodStore = create<MoodState>((set, get) => ({
  moods: [],
  isLoading: false,
  userId: 'default-user', // Shared default for now

  setMoods: (moods) => set({ moods }),

  loadMoods: async () => {
    set({ isLoading: true })
    const moods = await db.moods.where('userId').equals(get().userId).toArray()
    set({ moods: moods as any, isLoading: false })
  },

  pullMoods: async () => {
    set({ isLoading: true })
    try {
      const cloudMoods = await pullMoodsAction(get().userId)
      if (cloudMoods && cloudMoods.length > 0) {
        // Bulk merge into Dexie (Dexie.put is upsert)
        const localFormatMoods = cloudMoods.map((m: any) => ({
          id: m.id,
          userId: m.user_id,
          date: m.date,
          score: m.score,
          note: m.note,
          createdAt: m.created_at,
          updatedAt: m.updated_at,
          _dirty: 0
        }))
        await db.moods.bulkPut(localFormatMoods)
        await get().loadMoods()
      }
    } catch (err) {
      console.error('[MoodStore] Pull failed:', err)
    } finally {
      set({ isLoading: false })
    }
  },
  
  addMood: async (newMood) => {
    const userId = get().userId
    // [FIX] Bug1: 按 date+userId 查重，有则 update，无则 add（upsert 语义）
    const existing = await db.moods
      .where('[userId+date]')
      .equals([userId, newMood.date])
      .first()

    if (existing) {
      await db.moods.put({
        ...existing,
        score: newMood.score,
        note: newMood.note ?? '',
        updatedAt: new Date().toISOString(),
        _dirty: 1
      })
    } else {
      const moodEntry = {
        ...newMood,
        id: crypto.randomUUID(),
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        _dirty: 1
      }
      // @ts-ignore
      await db.moods.add(moodEntry)
    }
    await get().loadMoods()
  },

  updateMood: async (id, updates) => {
    const existing = await db.moods.get(id)
    if (!existing) return

    const updatedEntry = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      _dirty: 1
    }

    await db.moods.put(updatedEntry)
    await get().loadMoods()
  },

  getRollingAverage: (days: number) => {
    const { moods } = get()
    if (moods.length === 0) return 0
    
    const now = new Date()
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    const relevantMoods = moods.filter(m => new Date(m.date) >= cutoff)
    if (relevantMoods.length === 0) return 0
    
    const sum = relevantMoods.reduce((acc, curr) => acc + curr.score, 0)
    return parseFloat((sum / relevantMoods.length).toFixed(1))
  }
}))

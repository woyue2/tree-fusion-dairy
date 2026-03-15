import { create } from 'zustand'
import { Mood } from '@/types'
import { db } from '@/lib/db'

interface MoodState {
  moods: Mood[]
  isLoading: boolean
  userId: string
  
  // Actions
  setMoods: (moods: Mood[]) => void
  addMood: (mood: Omit<Mood, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>
  loadMoods: () => Promise<void>
  
  // Requirement B: Rolling Averages
  getRollingAverage: (days: number) => number
}

export const useMoodStore = create<MoodState>((set, get) => ({
  moods: [],
  isLoading: false,
  userId: 'user-1', // Shared default for now

  setMoods: (moods) => set({ moods }),

  loadMoods: async () => {
    set({ isLoading: true })
    const moods = await db.moods.where('userId').equals(get().userId).toArray()
    set({ moods: moods as any, isLoading: false })
  },
  
  addMood: async (newMood) => {
    const id = crypto.randomUUID()
    const moodEntry = {
      ...newMood,
      id,
      userId: get().userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _dirty: 1
    }
    
    await db.moods.add(moodEntry as any)
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

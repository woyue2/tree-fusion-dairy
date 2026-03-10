import { create } from 'zustand'
import { Mood } from '@/types'

interface MoodState {
  moods: Mood[]
  isLoading: boolean
  
  // Actions
  setMoods: (moods: Mood[]) => void
  addMood: (mood: Omit<Mood, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void
}

export const useMoodStore = create<MoodState>((set) => ({
  moods: [],
  isLoading: false,

  setMoods: (moods) => set({ moods }),
  
  addMood: (newMood) => set((state) => {
    const mood: Mood = {
      ...newMood,
      id: Math.random().toString(36).substring(7),
      userId: 'user-1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return { moods: [...state.moods, mood] }
  }),
}))

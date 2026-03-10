import { create } from 'zustand'
import { DiaryEntry, WeeklySummary } from '@/types'

interface DiaryState {
  entries: DiaryEntry[]
  weeklySummaries: WeeklySummary[]
  activeEntry: DiaryEntry | null
  isLoading: boolean
  
  // Actions
  setEntries: (entries: DiaryEntry[]) => void
  setActiveEntry: (entry: DiaryEntry | null) => void
  
  addEntry: (entry: DiaryEntry) => void
  updateEntry: (id: string, updates: Partial<DiaryEntry>) => void
  deleteEntry: (id: string) => void
  
  setWeeklySummaries: (summaries: WeeklySummary[]) => void
}

export const useDiaryStore = create<DiaryState>((set) => ({
  entries: [],
  weeklySummaries: [],
  activeEntry: null,
  isLoading: false,

  setEntries: (entries) => set({ entries }),
  setActiveEntry: (activeEntry) => set({ activeEntry }),

  addEntry: (entry) => set((state) => ({ 
    entries: [entry, ...state.entries] 
  })),
  
  updateEntry: (id, updates) => set((state) => ({
    entries: state.entries.map((e) => (e.id === id ? { ...e, ...updates } : e)),
    activeEntry: state.activeEntry?.id === id ? { ...state.activeEntry, ...updates } : state.activeEntry
  })),
  
  deleteEntry: (id) => set((state) => ({
    entries: state.entries.filter((e) => e.id !== id),
    activeEntry: state.activeEntry?.id === id ? null : state.activeEntry
  })),

  setWeeklySummaries: (weeklySummaries) => set({ weeklySummaries })
}))

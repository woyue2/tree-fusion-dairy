'use client'

import { create } from 'zustand'

export interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info'
}

interface AppState {
  toasts: Toast[]
  offlineQueue: any[] // Mock offline queue
  syncStatus: 'synced' | 'syncing' | 'error'
  isOnline: boolean
  
  addToast: (message: string, type?: 'success' | 'error' | 'info') => void
  removeToast: (id: string) => void
  setIsOnline: (isOnline: boolean) => void
  setSyncStatus: (status: 'synced' | 'syncing' | 'error') => void
  addToOfflineQueue: (task: any) => void
}

export const useAppStore = create<AppState>((set) => ({
  toasts: [],
  offlineQueue: [],
  syncStatus: 'synced',
  isOnline: typeof window !== 'undefined' ? window.navigator.onLine : true,
  
  addToast: (message, type = 'info') => {
    const id = 'toast_' + Date.now()
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }))
    
    // Auto remove after 3s
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
    }, 3000)
  },
  
  removeToast: (id) => set((state) => ({
    toasts: state.toasts.filter(t => t.id !== id)
  })),

  setIsOnline: (isOnline) => set({ isOnline }),
  
  setSyncStatus: (syncStatus) => set({ syncStatus }),
  
  addToOfflineQueue: (task) => set((state) => ({
    offlineQueue: [...state.offlineQueue, task]
  }))
}))

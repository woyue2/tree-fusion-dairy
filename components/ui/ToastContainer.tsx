'use client'

import React from 'react'
import { useAppStore } from '@/hooks/useAppStore'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export default function ToastContainer() {
  const { toasts, removeToast } = useAppStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(toast => {
        let Icon = Info
        let bg = 'bg-gray-800'
        
        if (toast.type === 'success') {
          Icon = CheckCircle2
          bg = 'bg-green-600'
        } else if (toast.type === 'error') {
          Icon = AlertCircle
          bg = 'bg-red-500'
        }

        return (
          <div 
            key={toast.id}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white text-[14px] font-medium pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300 ${bg}`}
          >
            <Icon size={18} />
            <span>{toast.message}</span>
            <button 
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:bg-white/20 p-1 rounded-full transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        )
      })}
    </div>
  )
}

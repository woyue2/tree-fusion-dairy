/**
 * [INPUT]:    useMoodStore (addMood, updateMood, moods), defaultDate prop
 * [OUTPUT]:   MoodInput 组件，支持新增与历史日期编辑
 * [POS]:      components/stats/MoodInput.tsx - 情绪录入/编辑表单
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React, { useState, useEffect } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { Smile, Meh, Loader2, X } from 'lucide-react'

interface MoodInputProps {
  // [FIX] Bug2+3: 支持外部传入日期，实现历史日期编辑
  defaultDate?: string
  onClose?: () => void
}

export function MoodInput({ defaultDate, onClose }: MoodInputProps) {
  const today = new Date().toISOString().split('T')[0]
  const targetDate = defaultDate || today

  const addMood = useMoodStore(s => s.addMood)
  const moods = useMoodStore(s => s.moods)
  const [score, setScore] = useState<number>(7)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const existingMood = moods.find(m => m.date === targetDate)

  // 预填当日已有记录
  useEffect(() => {
    if (existingMood) {
      setScore(existingMood.score)
      setNote(existingMood.note || '')
    } else {
      setScore(7)
      setNote('')
    }
  }, [targetDate, existingMood?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addMood({ date: targetDate, score, note })
      onClose?.()
    } catch (err) {
      console.error('Failed to save mood:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isEditing = !!existingMood
  const isHistorical = targetDate !== today

  return (
    <div className="stats-card bg-white rounded-xl p-5 shadow-sm border border-[#dfe1e6]">
      <div className="flex items-center justify-between mb-4">
        <h3 className="flex items-center gap-2 font-bold text-[#172b4d] m-0">
          <Meh size={20} />
          {isHistorical
            ? `修改 ${targetDate} 的心情`
            : isEditing
            ? '修改今天的心情'
            : '今天的心情如何？'}
        </h3>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-[#f4f5f7] text-[#5e6c84]">
            <X size={16} />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-[#5e6c84]">1 (低落)</span>
            <span className="text-xs font-bold text-[#0079bf]">{score} 分</span>
            <span className="text-xs text-[#5e6c84]">10 (极佳)</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            className="w-full cursor-pointer"
          />
        </div>

        <div className="mb-4">
          <textarea
            placeholder="简单说两句？（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full p-3 rounded-lg border border-[#ddd] text-sm font-[inherit] resize-none"
            rows={2}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full p-2.5 rounded-lg bg-[#0079bf] text-white font-extrabold border-none cursor-pointer flex items-center justify-center gap-2 hover:bg-[#005582] transition-colors"
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : (isEditing ? '更新记录' : '记录此刻')}
        </button>
      </form>
    </div>
  )
}

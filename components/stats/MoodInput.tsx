'use client'

import React, { useState } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { Smile, Frown, Meh, Loader2 } from 'lucide-react'

export function MoodInput() {
  const [score, setScore] = useState<number>(7)
  const [note, setNote] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const addMood = useMoodStore(s => s.addMood)
  const moods = useMoodStore(s => s.moods)

  const today = new Date().toISOString().split('T')[0]
  const hasRecordedToday = moods.some(m => m.date === today)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addMood({
        date: today,
        score,
        note
      })
      setNote('')
    } catch (err) {
      console.error('Failed to add mood:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (hasRecordedToday) {
    return (
      <div className="stats-card" style={{ textAlign: 'center', padding: '20px' }}>
        <Smile size={32} style={{ color: 'var(--accent)', marginBottom: '10px' }} />
        <p style={{ margin: 0, fontWeight: 600 }}>哥，今天的记录已经有了，赞！</p>
      </div>
    )
  }

  return (
    <div className="stats-card">
      <h3 style={{ marginTop: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Meh size={20} /> 今天的心情如何？
      </h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>1 (低落)</span>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent)' }}>{score} 分</span>
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>10 (极佳)</span>
          </div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={score} 
            onChange={(e) => setScore(parseInt(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>
        
        <div style={{ marginBottom: '16px' }}>
          <textarea
            placeholder="简单说两句？（可选）"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            style={{ 
              width: '100%', 
              padding: '12px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              fontSize: '14px',
              fontFamily: 'inherit',
              resize: 'none'
            }}
            rows={2}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          className="btn-primary"
          style={{ 
            width: '100%', 
            padding: '10px', 
            borderRadius: '8px', 
            backgroundColor: 'var(--accent)', 
            color: 'white',
            border: 'none',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : '记录此刻'}
        </button>
      </form>
    </div>
  )
}

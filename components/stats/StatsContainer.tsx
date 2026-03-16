'use client'

import React, { useEffect, useMemo } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { ChevronDown } from 'lucide-react'
import { MoodInput } from './MoodInput'

export default function StatsContainer() {
  const moods = useMoodStore(s => s.moods)
  const getRollingAverage = useMoodStore(s => s.getRollingAverage)

  const getColorForScore = (score: number) => {
    if (score <= 2) return '#ff4757'
    if (score <= 4) return '#ffa502'
    if (score <= 6) return '#eccc68'
    if (score <= 8) return '#2ed573'
    return '#10ac84'
  }

  // Requirement: Display last 30 days including placeholders
  const last30Days = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const mood = moods.find(m => m.date === dateStr)
      days.push({
        date: dateStr,
        displayDate: dateStr.slice(5),
        mood: mood || null
      })
    }
    return days
  }, [moods])

  const averageScore = useMemo(() => {
    if (moods.length === 0) return 0
    return (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1)
  }, [moods])

  return (
    <div id="view-stats" className="view active" style={{ display: 'flex' }}>
      <div className="stats-container">
        
        {/* Mood Input Section */}
        <MoodInput />

        {/* Heatmap Card */}
        <div className="stats-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0 }}>
              <span style={{ fontSize: '20px' }}>📈</span> 情绪趋势 (最近 30 天)
            </h2>
            <div className="modern-select-wrapper">
              <select className="modern-select">
                <option>最近 30 天</option>
                <option>2026年3月</option>
                <option>2026年2月</option>
              </select>
              <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
            </div>
          </div>

          <div className="mood-grid-container">
            <div className="mood-heatmap" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(40px, 1fr))',
              gap: '8px'
            }}>
              {last30Days.map(({ date, displayDate, mood }) => (
                <div 
                  key={date}
                  className={`mood-cell ${mood ? 'vivid-color active' : 'empty-placeholder'}`}
                  style={{ 
                    backgroundColor: mood ? getColorForScore(mood.score) : 'rgba(0,0,0,0.03)',
                    borderRadius: '8px',
                    aspectRatio: '1/1',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '10px',
                    transition: 'all 0.2s ease',
                    border: mood ? 'none' : '1px dashed rgba(0,0,0,0.05)',
                    cursor: mood ? 'pointer' : 'default',
                    opacity: mood ? 1 : 0.6
                  }}
                  title={mood ? `${date}: ${mood.score}分` : `${date}: 未记录`}
                >
                  <div className="mood-val" style={{ fontWeight: 800, fontSize: '14px', color: mood ? 'white' : 'var(--text-muted)' }}>
                    {mood ? mood.score : ''}
                  </div>
                  <div className="mood-date" style={{ fontSize: '8px', marginTop: '2px', color: mood ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
                    {displayDate}
                  </div>
                </div>
              ))}
            </div>

            <div className="mood-legend" style={{ marginTop: '24px', display: 'flex', flexWrap: 'wrap', gap: '12px', fontSize: '11px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-muted)' }}>评分对照:</span>
              {[
                { label: '焦虑/低落', color: '#ff4757' },
                { label: '平淡', color: '#ffa502' },
                { label: '还不错', color: '#eccc68' },
                { label: '开心', color: '#2ed573' },
                { label: '极度愉悦', color: '#10ac84' }
              ].map(item => (
                <div key={item.label} className="legend-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div className="legend-square" style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: item.color }}></div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 统计指标 Cards */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          <div className="stats-card" style={{ flex: '1 1 300px', marginBottom: 0 }}>
            <h3>📊 情绪均值统计</h3>
            <div style={{ fontSize: '32px', fontWeight: 700, margin: '10px 0', color: 'var(--accent)' }}>
              {averageScore} <span style={{ fontSize: '14px', fontWeight: 'normal', color: '#888' }}>本月平均分</span>
            </div>
            
            <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', margin: '16px 0' }}>
              {[
                { label: '7天均值', days: 7 },
                { label: '30天均值', days: 30 },
                { label: '60天均值', days: 60 },
                { label: '180天均值', days: 180 }
              ].map(p => {
                const avg = getRollingAverage(p.days)
                const count = moods.filter(m => {
                  const d = new Date(m.date)
                  const cutoff = new Date()
                  cutoff.setDate(cutoff.getDate() - p.days)
                  return d >= cutoff
                }).length
                
                return (
                  <div key={p.label} style={{ background: '#f8f9fa', padding: '10px', borderRadius: '8px', border: '1px solid #eee' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>{p.label}</div>
                    <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--app-text)', marginTop: '4px' }}>
                      {avg === 0 ? '--' : avg} <span style={{ fontSize: '11px', fontWeight: 400, color: 'var(--text-muted)' }}>pts</span>
                    </div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>样本: {count}天</div>
                  </div>
                )
              })}
            </div>

            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
              你的平均情绪处于稳步上升趋势，最近一周的专注力有明显提升。
            </p>
          </div>

          <div className="stats-card" style={{ flex: '1 1 300px', marginBottom: 0 }}>
            <h2><span style={{ fontSize: '20px' }}>🎯</span> 记录状态</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--diary-accent)', lineHeight: 1 }}>
                24
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', paddingBottom: '6px', fontWeight: 600 }}>
                连续记录天数
              </div>
            </div>
            <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
              你已经坚持在这个模块记录了近一个月的情绪。继续保持！这种微习惯是长期成长的基石。
            </p>
          </div>

        </div>

      </div>
    </div>
  )
}

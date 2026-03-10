'use client'

import React, { useEffect, useMemo } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { ChevronDown } from 'lucide-react'

export default function StatsContainer() {
  const { moods, setMoods } = useMoodStore()

  // Generate mock data for the current month
  useEffect(() => {
    if (moods.length === 0) {
      const mockMoods = Array.from({ length: 31 }, (_, i) => ({
        id: `m-${i}`,
        userId: 'user-1',
        date: `2026-03-${String(i + 1).padStart(2, '0')}`,
        score: Math.floor(Math.random() * 10) + 1,
        note: `Day ${i + 1} mood`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      setMoods(mockMoods)
    }
  }, [moods.length, setMoods])

  const getColorForScore = (score: number) => {
    if (score <= 2) return '#ff4757'
    if (score <= 4) return '#ffa502'
    if (score <= 6) return '#eccc68'
    if (score <= 8) return '#2ed573'
    return '#10ac84'
  }

  const averageScore = useMemo(() => {
    if (moods.length === 0) return 0
    return (moods.reduce((acc, m) => acc + m.score, 0) / moods.length).toFixed(1)
  }, [moods])

  return (
    <div id="view-stats" className="view active" style={{ display: 'flex' }}>
      <div className="stats-container">
        
        {/* Heatmap Card */}
        <div className="stats-card">
          <h2>
            <span style={{ fontSize: '20px' }}>📈</span> 情绪趋势 (红绿阶分布)
          </h2>
          <div className="mood-grid-container">
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
              <div className="modern-select-wrapper">
                <select className="modern-select">
                  <option>2026年3月</option>
                  <option>2026年2月</option>
                  <option>2026年1月</option>
                </select>
                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </div>
            </div>
            
            <div className="mood-heatmap">
              {moods.map((mood) => (
                <div 
                  key={mood.id}
                  className="mood-cell vivid-color"
                  style={{ backgroundColor: getColorForScore(mood.score) }}
                  title={`${mood.date}: ${mood.score}分`}
                >
                  <div className="mood-val">{mood.score}</div>
                  <div className="mood-date">{mood.date.slice(5)}</div>
                </div>
              ))}
            </div>

            <div className="mood-legend">
              <span style={{ fontWeight: 600 }}>图例:</span>
              {[
                { label: '焦虑/低落 (≤2)', color: '#ff4757' },
                { label: '平淡 (3-4)', color: '#ffa502' },
                { label: '还不错 (5-6)', color: '#eccc68' },
                { label: '开心 (7-8)', color: '#2ed573' },
                { label: '极度愉悦 (≥9)', color: '#10ac84' }
              ].map(item => (
                <div key={item.label} className="legend-item">
                  <div className="legend-square" style={{ backgroundColor: item.color }}></div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 统计指标 Cards */}
        <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
          
          <div className="stats-card" style={{ flex: '1 1 300px', marginBottom: 0 }}>
            <h2><span style={{ fontSize: '20px' }}>📊</span> 情绪均值统计</h2>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
              <div style={{ fontSize: '48px', fontWeight: 900, color: 'var(--tree-accent)', lineHeight: 1 }}>
                {averageScore}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '14px', paddingBottom: '6px', fontWeight: 600 }}>
                本月平均分
              </div>
            </div>
            <div style={{ marginTop: '16px', height: '6px', background: '#eee', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(Number(averageScore) * 10)}%`, background: 'var(--tree-accent)', borderRadius: '4px' }}></div>
            </div>
            <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
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

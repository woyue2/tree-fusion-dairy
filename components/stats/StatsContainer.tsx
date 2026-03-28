/**
 * [INPUT]:    useMoodStore states and actions.
 * [OUTPUT]:   StatsContainer component for quantitative and mood visualization.
 * [POS]:      components/stats/StatsContainer.tsx - Stats & Mood Dashboard View
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React, { useMemo } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { MoodInput } from './MoodInput'

export default function StatsContainer() {
  const moods = useMoodStore(s => s.moods)
  const getRollingAverage = useMoodStore(s => s.getRollingAverage)

  const getColorForScore = (score: number) => {
    if (score <= 2) return '#ff4757' // Red
    if (score <= 4) return '#ffa502' // Orange
    if (score <= 6) return '#eccc68' // Yellow
    if (score <= 8) return '#2ed573' // Green
    return '#10ac84' // Emerald
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

  const rollingStats = [
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
    return { ...p, avg, count }
  })

  return (
    <div id="view-stats" className="view active flex flex-col p-6 gap-6 overflow-y-auto bg-[#f4f5f7]">
      <div className="stats-container max-w-[900px] mx-auto w-full">
        
        {/* Mood Input Section */}
        <div className="mb-6">
          <MoodInput />
        </div>

        {/* Mood Section */}
        <div className="stats-card bg-white rounded-xl p-6 shadow-sm mb-6 border border-[#dfe1e6]">
          <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#172b4d]">
            📈 情绪趋势 (红绿阶分布)
          </h2>
          
          <div className="mood-grid-container flex flex-col gap-3">
            <div className="mood-heatmap grid grid-cols-7 gap-2">
              {last30Days.map(({ date, displayDate, mood }) => (
                <div
                  key={date}
                  className={`mood-cell relative aspect-square rounded-lg flex flex-col items-center justify-center gap-1 cursor-pointer transition-all hover:-translate-y-0.5 hover:brightness-105 hover:shadow-md border border-black/5`}
                  style={{
                    backgroundColor: mood ? getColorForScore(mood.score) : '#ffffff',
                    borderStyle: mood ? 'solid' : 'dashed',
                    borderColor: mood ? 'transparent' : '#ddd'
                  }}
                  title={mood?.note || (mood ? '无备注' : '未记录')}
                >
                  <div 
                    className="mood-val text-base font-extrabold leading-none"
                    style={{ color: mood ? '#fff' : '#ccc' }}
                  >
                    {mood ? mood.score : '--'}
                  </div>
                  <div 
                    className="mood-date text-[10px] font-medium opacity-80"
                    style={{ color: mood ? '#fff' : '#5e6c84' }}
                  >
                    {displayDate}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="mood-legend flex justify-center flex-wrap gap-3 mt-5 p-2.5 bg-[#f8f9fa] rounded-lg text-xs text-[#5e6c84] border border-[#eee]">
              <div className="legend-item flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{background:'#ff4757'}}></div> ≤2分</div>
              <div className="legend-item flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{background:'#ffa502'}}></div> 3-4分</div>
              <div className="legend-item flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{background:'#eccc68'}}></div> 5-6分</div>
              <div className="legend-item flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{background:'#2ed573'}}></div> 7-8分</div>
              <div className="legend-item flex items-center gap-1.5"><div className="w-3.5 h-3.5 rounded-sm" style={{background:'#10ac84'}}></div> ≥9分</div>
            </div>
          </div>
        </div>

        {/* Rolling Averages Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
          <div className="stats-card bg-white rounded-xl p-6 shadow-sm border border-[#dfe1e6]">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#172b4d]">
              📊 情绪均值统计 (Rolling Averages)
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {rollingStats.map(stat => (
                <div key={stat.label} className="bg-[#f8f9fa] p-3 rounded-lg border border-[#eee]">
                  <div className="text-[11px] text-[#5e6c84] font-semibold uppercase">{stat.label}</div>
                  <div className="text-2xl font-extrabold text-[#172b4d] mt-1 whitespace-nowrap">
                    {stat.avg === 0 ? '--' : stat.avg} <span className="text-xs font-normal text-[#5e6c84]">pts</span>
                  </div>
                  <div className="text-[10px] text-[#5e6c84] mt-1 font-medium opacity-70">样本: {stat.count}天</div>
                </div>
              ))}
            </div>
          </div>

          <div className="stats-card bg-white rounded-xl p-6 shadow-sm border border-[#dfe1e6]">
            <h2 className="text-lg font-bold mb-5 flex items-center gap-2 text-[#172b4d]">
              🎯 记录状态
            </h2>
            <div className="flex items-baseline gap-2">
              <div className="text-[48px] font-black text-[#c9481d] leading-none">
                {moods.length}
              </div>
              <div className="text-sm font-bold text-[#5e6c84]">
                累计记录天数
              </div>
            </div>
            <p className="text-xs text-[#5e6c84] mt-4 leading-relaxed font-medium">
              坚持记录是建立自我认知的开始。目前的记录量已能够反映出某种周期性模式。继续保持！
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

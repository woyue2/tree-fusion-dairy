/**
 * [INPUT]:    useMoodStore states and actions, editingDate local state
 * [OUTPUT]:   StatsContainer — 热力图点击触发编辑，支持历史日期修改
 * [POS]:      components/stats/StatsContainer.tsx - Stats & Mood Dashboard View
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React, { useMemo, useState } from 'react'
import { useMoodStore } from '@/hooks/useMoodStore'
import { MoodInput } from './MoodInput'

export default function StatsContainer() {
  const moods = useMoodStore(s => s.moods)
  const getRollingAverage = useMoodStore(s => s.getRollingAverage)
  const [editingDate, setEditingDate] = useState<string | null>(null)

  const getColorForScore = (score: number) => {
    if (score <= 2) return '#ff4757'
    if (score <= 4) return '#ffa502'
    if (score <= 6) return '#eccc68'
    if (score <= 8) return '#2ed573'
    return '#10ac84'
  }

  const last30Days = useMemo(() => {
    const days = []
    const now = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(now.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const mood = moods.find(m => m.date === dateStr)
      days.push({ date: dateStr, displayDate: dateStr.slice(5), mood: mood || null })
    }
    return days
  }, [moods])

  const rollingStats = [
    { label: '7天', days: 7 },
    { label: '30天', days: 30 },
    { label: '60天', days: 60 },
    { label: '180天', days: 180 }
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

  const today = new Date().toISOString().split('T')[0]
  const todayMood = moods.find(m => m.date === today)

  return (
    <div id="view-stats" className="view active flex flex-col overflow-y-auto bg-[#f4f5f7]">
      <div className="max-w-[960px] mx-auto w-full px-6 py-6 flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-black text-[#172b4d]">📊 情绪统计</h1>
          <div className="text-xs font-bold text-[#5e6c84] bg-white px-3 py-1 rounded-full border border-[#dfe1e6] shadow-sm">
            MOOD TRACKER
          </div>
        </div>

        {/* Main layout: heatmap left, input right */}
        <div className="flex gap-5 items-start">

          {/* Heatmap Card — 主角，占大部分宽度 */}
          <div className="flex-1 bg-white rounded-xl p-5 shadow-sm border border-[#dfe1e6] min-w-0">
            <h2 className="text-sm font-bold text-[#172b4d] mb-4 flex items-center gap-2">
              📈 近30天情绪分布
              <span className="text-[10px] font-normal text-[#5e6c84] ml-1">点击格子可修改</span>
            </h2>

            <div className="grid grid-cols-6 gap-2 mb-4">
              {last30Days.map(({ date, displayDate, mood }) => (
                <div
                  key={date}
                  onClick={() => setEditingDate(editingDate === date ? null : date)}
                  className={`relative rounded-lg flex flex-col items-center justify-center cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-md border ${
                    editingDate === date ? 'ring-2 ring-[#0079bf] ring-offset-1' : ''
                  }`}
                  style={{
                    aspectRatio: '1',
                    backgroundColor: mood ? getColorForScore(mood.score) : '#f8f9fa',
                    borderStyle: mood ? 'solid' : 'dashed',
                    borderColor: mood ? 'rgba(0,0,0,0.08)' : '#d0d3d9'
                  }}
                  title={mood ? `${date}: ${mood.score}分${mood.note ? ' — ' + mood.note : ''}` : `${date}: 未记录`}
                >
                  <div
                    className="text-sm font-black leading-none"
                    style={{ color: mood ? '#fff' : '#adb5bd' }}
                  >
                    {mood ? mood.score : '--'}
                  </div>
                  <div
                    className="text-[9px] font-medium mt-0.5"
                    style={{ color: mood ? 'rgba(255,255,255,0.85)' : '#adb5bd' }}
                  >
                    {displayDate}
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 flex-wrap">
              {[
                { color: '#ff4757', label: '≤2' },
                { color: '#ffa502', label: '3-4' },
                { color: '#eccc68', label: '5-6' },
                { color: '#2ed573', label: '7-8' },
                { color: '#10ac84', label: '9-10' },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
                  <span className="text-[10px] text-[#5e6c84]">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right column: MoodInput + today summary */}
          <div className="w-[280px] shrink-0 flex flex-col gap-4">

            {/* Today summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dfe1e6]">
              <div className="text-xs font-bold text-[#5e6c84] uppercase tracking-wider mb-2">今日 / {today}</div>
              {todayMood ? (
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-black text-white"
                    style={{ backgroundColor: getColorForScore(todayMood.score) }}
                  >
                    {todayMood.score}
                  </div>
                  <div>
                    <div className="text-xs text-[#5e6c84]">{todayMood.note || '无备注'}</div>
                    <div className="text-[10px] text-[#adb5bd] mt-0.5">点击热力图格子修改</div>
                  </div>
                </div>
              ) : (
                <div className="text-xs text-[#adb5bd]">今天还没记录</div>
              )}
            </div>

            {/* MoodInput — 紧凑版，辅助角色 */}
            <MoodInput
              defaultDate={editingDate || today}
              onClose={editingDate ? () => setEditingDate(null) : undefined}
            />

            {/* 累计记录 */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-[#dfe1e6] text-center">
              <div className="text-[40px] font-black text-[#c9481d] leading-none">{moods.length}</div>
              <div className="text-xs font-bold text-[#5e6c84] mt-1">累计记录天数</div>
            </div>
          </div>
        </div>

        {/* Rolling Averages — 底部横排，与热力图同宽 */}
        <div className="grid grid-cols-4 gap-4">
          {rollingStats.map(stat => (
            <div key={stat.label} className="bg-white rounded-xl p-4 shadow-sm border border-[#dfe1e6]">
              <div className="text-[11px] text-[#5e6c84] font-bold uppercase tracking-wider">{stat.label}均值</div>
              <div className="text-3xl font-black text-[#172b4d] mt-1 leading-none">
                {stat.avg === 0 ? '--' : stat.avg}
              </div>
              <div className="text-[10px] text-[#5e6c84] mt-1 opacity-70">样本 {stat.count} 天</div>
              {stat.avg > 0 && (
                <div
                  className="mt-2 h-1.5 rounded-full"
                  style={{ backgroundColor: getColorForScore(stat.avg), opacity: 0.7 }}
                />
              )}
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

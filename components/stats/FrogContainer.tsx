/**
 * [INPUT]:    useFrogStore and useTodoStore
 * [OUTPUT]:   FrogContainer component for task & pomodoro tracking with log detail panel
 * [POS]:      components/stats/FrogContainer.tsx - "青蛙没关系" Main View
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */
'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useFrogStore } from '@/hooks/useFrogStore'
import { useTodoStore } from '@/hooks/useTodoStore'
import { Plus, Minus, CheckCircle, Flame, ClipboardList } from 'lucide-react'

export default function FrogContainer() {
  const loadPomodoros = useFrogStore(s => s.loadPomodoros)
  const loadLogs = useFrogStore(s => s.loadLogs)
  const updatePomodoro = useFrogStore(s => s.updatePomodoro)
  const getFrogStats = useFrogStore(s => s.getFrogStats)
  const logs = useFrogStore(s => s.logs)
  const tasks = useTodoStore(s => s.tasks)

  const todayDate = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(todayDate)

  useEffect(() => {
    loadPomodoros()
    loadLogs(todayDate)
  }, [loadPomodoros, loadLogs, todayDate])

  const stats = useMemo(() => getFrogStats(30), [getFrogStats, tasks])

  const todayStats = stats.find(s => s.date === todayDate) || { date: todayDate, completedTasks: 0, pomodoroCount: 0 }

  function handleSelectDate(date: string) {
    setSelectedDate(date)
    loadLogs(date)
  }

  function handleUpdatePomodoro(date: string, delta: number) {
    updatePomodoro(date, delta)
    if (date === selectedDate) loadLogs(date)
  }

  return (
    <div id="view-frogs" className="view active flex flex-col p-6 gap-6 overflow-y-auto bg-[#f4f5f7]">
      <div className="stats-container max-w-[1100px] mx-auto w-full">

        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-black text-[#172b4d]">🐸 青蛙没关系</h1>
          <div className="text-xs font-bold text-[#5e6c84] bg-white px-3 py-1 rounded-full border border-[#dfe1e6] shadow-sm">
            FROG TRACKER V1.0
          </div>
        </div>

        {/* Today Focus Card */}
        <div className="stats-card bg-white rounded-xl p-8 shadow-sm mb-8 border border-[#dfe1e6] flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-[#5e6c84] text-xs font-bold uppercase tracking-wider mb-2">今日战报 / {todayDate}</h2>
            <div className="flex items-baseline gap-3 justify-center md:justify-start">
              <div className="text-6xl font-black text-[#0079bf] leading-none">{todayStats.pomodoroCount}</div>
              <div className="text-sm font-bold text-[#5e6c84]">🍅 番茄</div>
              <div className="text-6xl font-black text-[#61bd4f] leading-none ml-4">{todayStats.completedTasks}</div>
              <div className="text-sm font-bold text-[#5e6c84]"><CheckCircle size={14} className="inline" /> 任务</div>
            </div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => handleUpdatePomodoro(todayDate, 1)}
              className="w-14 h-14 rounded-2xl bg-[#0079bf] text-white flex items-center justify-center hover:bg-[#005582] transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0079bf]/20"
            >
              <Plus size={28} />
            </button>
            <button
              onClick={() => handleUpdatePomodoro(todayDate, -1)}
              className="w-14 h-14 rounded-2xl bg-white border-2 border-[#dfe1e6] text-[#5e6c84] flex items-center justify-center hover:bg-[#f4f5f7] transition-all hover:scale-105 active:scale-95"
            >
              <Minus size={28} />
            </button>
          </div>
        </div>

        {/* Main: Table + Log Panel */}
        <div className="flex gap-4 items-start">

          {/* History Table */}
          <div className="flex-1 stats-card bg-white rounded-xl shadow-sm border border-[#dfe1e6] overflow-hidden min-w-0">
            <div className="px-6 py-4 bg-[#fcfcfd] border-b border-[#f4f5f7] flex items-center gap-2">
              <Flame size={18} className="text-[#c9481d]" />
              <h2 className="font-bold text-[#172b4d]">历史足迹 (最近30天)</h2>
            </div>
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#f8f9fa] shadow-sm z-10">
                  <tr>
                    <th className="px-4 py-3 text-xs font-bold text-[#5e6c84] uppercase tracking-wider border-b border-[#eee]">日期</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#5e6c84] uppercase tracking-wider border-b border-[#eee]">完成任务</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#5e6c84] uppercase tracking-wider border-b border-[#eee]">番茄数</th>
                    <th className="px-4 py-3 text-xs font-bold text-[#5e6c84] uppercase tracking-wider border-b border-[#eee] text-right">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f4f5f7]">
                  {stats.map((row) => {
                    const isSelected = row.date === selectedDate
                    const isToday = row.date === todayDate
                    return (
                      <tr
                        key={row.date}
                        onClick={() => handleSelectDate(row.date)}
                        className={`cursor-pointer transition-colors ${
                          isSelected ? 'bg-[#e8f0fe]' : 'hover:bg-[#f8f9fa]'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm font-mono font-semibold text-[#172b4d]">
                          {row.date}
                          {isToday && <span className="ml-2 text-[10px] bg-[#0079bf] text-white px-1.5 py-0.5 rounded-full">今天</span>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-base font-bold text-[#61bd4f]">{row.completedTasks}</span>
                            <div className="flex-1 bg-[#f0fdf4] rounded-full h-1.5 max-w-[60px]">
                              <div
                                className="bg-[#61bd4f] h-1.5 rounded-full transition-all"
                                style={{ width: `${Math.min(100, row.completedTasks * 20)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-base font-bold text-[#0079bf]">{row.pomodoroCount}</span>
                          <span className="ml-1 text-xs text-[#5e6c84]">🍅</span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-1" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => handleUpdatePomodoro(row.date, 1)}
                              className="p-1.5 rounded-lg hover:bg-[#e8f0fe] text-[#0079bf] transition-colors"
                            >
                              <Plus size={16} />
                            </button>
                            <button
                              onClick={() => handleUpdatePomodoro(row.date, -1)}
                              className="p-1.5 rounded-lg hover:bg-[#ffecea] text-[#eb5a46] transition-colors"
                            >
                              <Minus size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Log Detail Panel */}
          <div className="w-64 shrink-0 bg-white rounded-xl shadow-sm border border-[#dfe1e6] flex flex-col overflow-hidden">
            <div className="px-4 py-3 bg-[#fcfcfd] border-b border-[#f4f5f7] flex items-center gap-2">
              <ClipboardList size={16} className="text-[#5e6c84]" />
              <div>
                <div className="text-xs font-bold text-[#172b4d]">明细记录</div>
                <div className="text-[10px] text-[#5e6c84] font-mono">{selectedDate}</div>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[500px] p-3 flex flex-col gap-2">
              {logs.length === 0 ? (
                <div className="text-xs text-[#5e6c84] text-center py-8 opacity-60">暂无记录</div>
              ) : (
                logs.map(log => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                      log.delta > 0 ? 'bg-[#f0fdf4]' : 'bg-[#fff5f5]'
                    }`}
                  >
                    <span className={`font-black text-sm mt-0.5 ${
                      log.delta > 0 ? 'text-[#61bd4f]' : 'text-[#eb5a46]'
                    }`}>
                      {log.delta > 0 ? '+1' : '-1'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          log.type === 'task'
                            ? 'bg-[#61bd4f]/20 text-[#3b7a3b]'
                            : 'bg-[#0079bf]/20 text-[#005582]'
                        }`}>
                          {log.type === 'task' ? '任务' : '番茄'}
                        </span>
                      </div>
                      <div className="text-[#172b4d] font-medium truncate">{log.label}</div>
                      <div className="text-[#5e6c84] opacity-70 mt-0.5 font-mono">
                        {log.time.slice(11, 16)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-[#fffecd] rounded-lg border border-[#f5e18c]">
          <p className="text-xs text-[#856404] leading-relaxed">
                                    <strong>什么是“青蛙”？</strong> 每天最重要的那件事就是你的“青蛙”。<br/>
            本模块自动关联 <strong>Fusion Todo</strong> 的完成状态。点击表格行可查看当天明细。
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * [INPUT]:    Supabase session (User Auth)
 * [OUTPUT]:   Diary List SSR Page Shell
 * [POS]:      components/diary/DiaryContainer.tsx - Diary module shell
 * [PROTOCOL]: Renders sidebar, editor, and immersive viewer for private diary access.
 */
'use client'

import React, { useEffect, useState } from 'react'
import { useDiaryStore } from '@/hooks/useDiaryStore'
import { useAppStore } from '@/hooks/useAppStore'
import DiarySidebar from '@/components/diary/DiarySidebar'
import { DiaryEditor } from '@/components/diary/DiaryEditor'
import { DiaryViewer } from '@/components/diary/DiaryViewer'
import { Calendar, Plus, Sparkles } from 'lucide-react'
import WeeklySummaryModal from '@/components/diary/WeeklySummaryModal'

export default function DiaryContainer() {
  const diaries = useDiaryStore((state) => state.diaries)
  const loadDiaries = useDiaryStore((state) => state.loadDiaries)
  const currentDiaryId = useDiaryStore((state) => state.currentDiaryId)
  const setCurrentDiary = useDiaryStore((state) => state.setCurrentDiary)
  const addDiary = useDiaryStore((state) => state.addDiary)
  const pullDiaries = useDiaryStore((state) => state.pullDiaries)
  const isOnline = useAppStore((state) => state.isOnline)
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false)
  const [viewerDiaryId, setViewerDiaryId] = useState<string | null>(null)

  useEffect(() => {
    loadDiaries()
  }, [loadDiaries])

  const diaryList = Object.values(diaries)
    .filter((diary) => !diary.deletedAt)
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())

  const activeDiary = currentDiaryId ? diaries[currentDiaryId] : null
  const viewerDiary = viewerDiaryId ? diaries[viewerDiaryId] : null
  const viewerIndex = viewerDiaryId ? diaryList.findIndex((diary) => diary.id === viewerDiaryId) : -1

  const handleNewDiary = async () => {
    const id = await addDiary()
    setCurrentDiary(id)
  }

  const openViewer = (id: string) => {
    setViewerDiaryId(id)
  }

  return (
    <div className="h-full flex overflow-hidden bg-white">
      <DiarySidebar
        diaries={diaryList}
        activeId={currentDiaryId}
        onSelect={setCurrentDiary}
        onNew={handleNewDiary}
        onSync={isOnline ? pullDiaries : undefined}
      />

      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeDiary ? (
          <DiaryEditor id={currentDiaryId!} isOnline={isOnline} onOpenViewer={openViewer} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-6">
            <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-[#c9481d]">
              <Calendar size={40} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-slate-800">开始记录生活</h3>
              <p className="mt-1 text-sm">选择一篇日记查看，或点击下方按钮开启新篇章</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleNewDiary}
                className="px-6 py-2.5 bg-[#c9481d] text-white rounded-lg hover:bg-[#b03e18] transition-colors flex items-center gap-2 font-medium"
              >
                <Plus size={18} /> 写新日记
              </button>
              <button
                onClick={() => setIsWeeklyModalOpen(true)}
                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2 font-medium"
              >
                <Sparkles size={18} /> AI 周报回顾
              </button>
            </div>
          </div>
        )}
      </div>

      {viewerDiary && (
        <DiaryViewer
          diary={viewerDiary}
          onClose={() => setViewerDiaryId(null)}
          onPrev={viewerIndex > 0 ? () => setViewerDiaryId(diaryList[viewerIndex - 1].id) : undefined}
          onNext={viewerIndex >= 0 && viewerIndex < diaryList.length - 1 ? () => setViewerDiaryId(diaryList[viewerIndex + 1].id) : undefined}
        />
      )}

      {isWeeklyModalOpen && <WeeklySummaryModal onClose={() => setIsWeeklyModalOpen(false)} />}
    </div>
  )
}

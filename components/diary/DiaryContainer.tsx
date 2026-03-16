/**
 * [INPUT]:    Supabase session (User Auth)
 * [OUTPUT]:   Diary List SSR Page Shell
 * [POS]:      app/(private)/diary/page.tsx - Diary Module Route
 * [PROTOCOL]: Renders metadata and DiaryContainer for private diary access.
 */
'use client';

import React, { useEffect, useState } from 'react';
import { useDiaryStore } from '@/hooks/useDiaryStore';
import { useAppStore } from '@/hooks/useAppStore';
import DiarySidebar from '@/components/diary/DiarySidebar';
import { DiaryEditor } from '@/components/diary/DiaryEditor';
import { Calendar, Plus, Sparkles } from 'lucide-react';
import WeeklySummaryModal from '@/components/diary/WeeklySummaryModal';

export default function DiaryContainer() {
  const { diaries, loadDiaries, currentDiaryId, setCurrentDiary, addDiary, pullDiaries } = useDiaryStore();
  const isOnline = useAppStore(s => s.isOnline);
  const [isWeeklyModalOpen, setIsWeeklyModalOpen] = useState(false);

  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  const diaryList = Object.values(diaries)
    .filter(d => !d.deletedAt)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeDiary = currentDiaryId ? diaries[currentDiaryId] : null;

  const handleNewDiary = async () => {
    const id = await addDiary();
    setCurrentDiary(id);
  };

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Column 1: Diary Sidebar */}
      <DiarySidebar 
        diaries={diaryList}
        activeId={currentDiaryId}
        onSelect={setCurrentDiary}
        onNew={handleNewDiary}
        onSync={isOnline ? pullDiaries : undefined}
      />

      {/* Column 2: Diary Editor Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">
        {activeDiary ? (
          <DiaryEditor 
            id={currentDiaryId!} 
            isOnline={isOnline} 
          />
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

      {isWeeklyModalOpen && (
        <WeeklySummaryModal onClose={() => setIsWeeklyModalOpen(false)} />
      )}
    </div>
  );
}

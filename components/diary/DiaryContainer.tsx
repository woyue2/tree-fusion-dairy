/**
 * [INPUT]:    依赖 useDiaryStore, DiaryEditor, DiaryList
 * [OUTPUT]:   导出 DiaryContainer 供 /diary 页面直接使用
 * [POS]:      components/diary/DiaryContainer.tsx - 日记模块主容器
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import { useEffect, useState } from 'react';
import { useDiaryStore } from '@/hooks/useDiaryStore';
import { useAppStore } from '@/hooks/useAppStore';
import { Plus, Search, BookOpen, Calendar, Trash2 } from 'lucide-react';
import { DiaryEditor } from './DiaryEditor';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { DiaryViewer } from './DiaryViewer';

export function DiaryContainer() {
  const { diaries, loadDiaries, currentDiaryId, setCurrentDiary, addDiary, deleteDiary } = useDiaryStore();
  const isOnline = useAppStore(s => s.isOnline);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingDiaryId, setViewingDiaryId] = useState<string | null>(null);

  useEffect(() => {
    loadDiaries();
  }, [loadDiaries]);

  const diaryList = Object.values(diaries)
    .filter(d => !d.deletedAt)
    .filter(d => d.title.includes(searchTerm) || d.content.original.includes(searchTerm))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (currentDiaryId && diaries[currentDiaryId]) {
    return <DiaryEditor id={currentDiaryId} isOnline={isOnline} />;
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-8 h-8 text-indigo-500" />
            结构化日记
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">记录生活，AI 辅助深度思考</p>
        </div>
        <button
          onClick={addDiary}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>写日记</span>
        </button>
      </header>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        <input
          type="text"
          placeholder="搜索日记内容、标题或标签..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {diaryList.map(diary => (
          <div
            key={diary.id}
            onClick={() => setCurrentDiary(diary.id)}
            className="group relative bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-indigo-500/50 hover:shadow-xl transition-all cursor-pointer flex flex-col h-64"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-lg flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {format(new Date(diary.date), 'yyyy年MM月dd日', { locale: zhCN })}
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setViewingDiaryId(diary.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                  title="阅读模式"
                >
                  <BookOpen className="w-4 h-4" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('确认删除这篇日记吗？')) deleteDiary(diary.id);
                  }}
                  className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                  title="删除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
              {diary.title || '无标题日记'}
            </h3>
            
            <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-4 flex-grow italic leading-relaxed">
              {diary.content.original || '暂未记录任何内容...'}
            </p>

            <div className="mt-4 flex gap-2">
              {diary.content.structured && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md">
                  Structured
                </span>
              )}
              {diary._dirty === 1 && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md self-end ml-auto">
                  Local Only
                </span>
              )}
            </div>
          </div>
        ))}
        
        {diaryList.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="bg-slate-100 dark:bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpen className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-slate-900 dark:text-white font-medium">暂无日记</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">开启你的第一篇深度日记吧</p>
          </div>
        )}
      </div>

      {viewingDiaryId && diaries[viewingDiaryId] && (
        <DiaryViewer 
          diary={diaries[viewingDiaryId]} 
          onClose={() => setViewingDiaryId(null)} 
        />
      )}
    </div>
  );
}

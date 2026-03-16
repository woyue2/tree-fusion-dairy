/**
 * [INPUT]:    diaries, onSelect, onNew, onSync
 * [OUTPUT]:   Diary Sidebar (List + Filter)
 * [POS]:      components/diary/DiarySidebar.tsx - Diary Navigation
 * [PROTOCOL]: Handles search filtering and selection of active diary entry.
 */
'use client';

import React, { useState } from 'react';
import { DiaryEntry } from '@/types';
import { Search, Plus, RefreshCw, X, Trash2 } from 'lucide-react';
import { useDiaryStore } from '@/hooks/useDiaryStore';

interface DiarySidebarProps {
  diaries: DiaryEntry[];
  activeId: string | null;
  onSelect: (id: string | null) => void;
  onNew: () => void;
  onSync?: () => void;
}

export default function DiarySidebar({ diaries, activeId, onSelect, onNew, onSync }: DiarySidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { deleteDiary } = useDiaryStore();

  const filteredDiaries = diaries.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    d.date.includes(searchQuery)
  );

  return (
    <div className="diary-sidebar">
      <div className="diary-sidebar-header">
        <span style={{ fontSize: '18px' }}>📔</span>
        <h2>我的日记</h2>
        <div className="flex gap-1">
          {onSync && (
            <button 
              className="p-1.5 hover:bg-slate-100 rounded text-muted-foreground hover:text-[#c9481d] transition-colors"
              onClick={onSync}
              title="同步云端"
            >
              <RefreshCw size={14} />
            </button>
          )}
          <button 
            className="p-1.5 hover:bg-[#c9481d] hover:text-white rounded text-muted-foreground bg-slate-50 transition-colors"
            onClick={onNew}
            title="新日记"
          >
            <Plus size={14} />
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', margin: '8px 10px' }}>
        <input 
          className="tree-search-box" 
          style={{ margin: 0, width: '100%', paddingRight: '28px' }}
          type="text" 
          placeholder="🔍 搜索日期或标题..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '8px', top: '50%', translate: '0 -50%', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {filteredDiaries.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs italic">
            没有找到日记
          </div>
        ) : (
          filteredDiaries.map((diary) => (
            <div 
              key={diary.id}
              onClick={() => onSelect(diary.id)}
              className={`diary-item group ${diary.id === activeId ? 'active' : ''}`}
            >
              <div className="flex justify-between items-start">
                <div className="diary-item-date">{diary.date}</div>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <button 
                    onClick={(e) => { e.stopPropagation(); if (confirm('确定删除这篇日记？')) deleteDiary(diary.id); }}
                    className="p-1 hover:text-red-500"
                  >
                    <Trash2 size={12} />
                  </button>
                  {diary._dirty === 1 && <div className="w-1.5 h-1.5 rounded-full bg-[#c9481d] mt-1" title="待同步" />}
                </div>
              </div>
              <div className="diary-item-title">{diary.title || '无标题'}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

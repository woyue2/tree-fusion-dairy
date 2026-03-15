/**
 * [INPUT]:    依赖 lib/db (Dexie) 和 zustand (immer)
 * [OUTPUT]:   导出 useDiaryStore 供日记编辑器和列表消费
 * [POS]:      hooks/useDiaryStore.ts - 日记业务逻辑与本地持久化
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { db } from '@/lib/db';
import { DiaryEntry, DiaryContent } from '@/types';
import { pullDiariesAction } from '@/app/actions/sync';

interface DiaryState {
  diaries: Record<string, DiaryEntry>;
  isLoading: boolean;
  currentDiaryId: string | null;
  
  // Actions
  loadDiaries: () => Promise<void>;
  setCurrentDiary: (id: string | null) => void;
  upsertDiary: (diary: Partial<DiaryEntry>) => Promise<void>;
  deleteDiary: (id: string) => Promise<void>;
  addDiary: () => Promise<string>;
  saveAnalysis: (id: string, analysis: any) => Promise<void>;
  saveStructuredVersion: (id: string, structured: string) => Promise<void>;
  pullDiaries: () => Promise<void>;
}

export const useDiaryStore = create<DiaryState>()(
  immer((set, get) => ({
    diaries: {},
    isLoading: false,
    currentDiaryId: null,

    loadDiaries: async () => {
      set({ isLoading: true });
      try {
        const allDiaries = await db.diaries.toArray();
        const diariesMap: Record<string, DiaryEntry> = {};
        allDiaries.forEach(d => {
          diariesMap[d.id] = d;
        });
        set({ diaries: diariesMap });
      } finally {
        set({ isLoading: false });
      }
    },

    pullDiaries: async () => {
      set({ isLoading: true });
      try {
        // @ts-ignore
        const userId = 'default-user'; // Replace with real auth if available
        const cloudDiaries = await pullDiariesAction(userId);
        if (cloudDiaries && cloudDiaries.length > 0) {
          const localFormatDiaries = cloudDiaries.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            date: d.date,
            title: d.title,
            content: d.content,
            images: d.images,
            aiAnalysis: d.analysis,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
            deletedAt: d.deleted_at,
            _dirty: 0
          }));
          await db.diaries.bulkPut(localFormatDiaries);
          await get().loadDiaries();
        }
      } catch (err) {
        console.error('[DiaryStore] Pull failed:', err);
      } finally {
        set({ isLoading: false });
      }
    },

    setCurrentDiary: (id) => {
      set({ currentDiaryId: id });
    },

    upsertDiary: async (diaryUpdate) => {
      if (!diaryUpdate.id) return;
      
      const now = new Date().toISOString();
      const existing = get().diaries[diaryUpdate.id];
      
      const updatedDiary: DiaryEntry = {
        ...(existing || {
          id: diaryUpdate.id,
          userId: 'default-user',
          title: '',
          content: { original: '' },
          date: now.split('T')[0],
          createdAt: now,
          updatedAt: now,
        }),
        ...diaryUpdate,
        updatedAt: now,
        _dirty: 1
      };

      set(state => {
        state.diaries[updatedDiary.id] = updatedDiary;
      });

      await db.diaries.put(updatedDiary);
    },

    deleteDiary: async (id) => {
      set(state => {
        delete state.diaries[id];
      });
      await db.diaries.update(id, { deletedAt: new Date().toISOString(), _dirty: 1 });
    },

    addDiary: async () => {
      const id = crypto.randomUUID();
      const now = new Date().toISOString();
      const newDiary: DiaryEntry = {
        id,
        userId: 'default-user',
        title: '新日记',
        content: { original: '' },
        date: now.split('T')[0],
        createdAt: now,
        updatedAt: now,
        _dirty: 1
      };

      set(state => {
        state.diaries[id] = newDiary;
      });
      
      await db.diaries.put(newDiary);
      return id;
    },

    saveAnalysis: async (id, analysis) => {
      const now = new Date().toISOString();
      set(state => {
        if (state.diaries[id]) {
          state.diaries[id].aiAnalysis = analysis;
          state.diaries[id].updatedAt = now;
          state.diaries[id]._dirty = 1;
        }
      });
      await db.diaries.update(id, { aiAnalysis: analysis, updatedAt: now, _dirty: 1 });
    },

    saveStructuredVersion: async (id, structured) => {
      const now = new Date().toISOString();
      set(state => {
        if (state.diaries[id]) {
          state.diaries[id].content.structured = structured;
          state.diaries[id].updatedAt = now;
          state.diaries[id]._dirty = 1;
        }
      });
      await db.diaries.update(id, { 
        content: get().diaries[id].content, 
        updatedAt: now, 
        _dirty: 1 
      });
    }
  }))
);

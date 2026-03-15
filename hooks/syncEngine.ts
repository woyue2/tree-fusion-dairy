/**
 * [INPUT]:    依赖 lib/db (Dexie) 和 app/actions/sync (Server Actions)
 * [OUTPUT]:   全量数据初始化拉取 (Pull) + 增量变动同步更新 (Push)
 * [POS]:      hooks/syncEngine.ts - 核心同步编排中心
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { useAppStore } from './useAppStore';
import { useMoodStore } from './useMoodStore';
import { useTodoStore } from './useTodoStore';
import { useTreeStore } from './useTreeStore';
import { useDiaryStore } from './useDiaryStore';
import { syncMoodAction, syncTaskAction, syncDocAction, syncDiaryAction } from '@/app/actions/sync';

export function useSyncEngine() {
  const isOnline = useAppStore(s => s.isOnline);
  const setSyncStatus = useAppStore(s => s.setSyncStatus);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);
  
  const pullAll = useMoodStore(s => s.pullMoods);
  const pullTodo = useTodoStore(s => s.pullAll);
  const pullTree = useTreeStore(s => s.pullDocuments);
  const pullDiary = useDiaryStore(s => s.pullDiaries);

  const performPull = async () => {
    if (!isOnline) return;
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('[SyncEngine] Starting initial pull...');
      }
      await Promise.all([
        pullAll(),
        pullTodo(),
        pullTree(),
        pullDiary()
      ]);
      if (process.env.NODE_ENV === 'development') {
        console.log('[SyncEngine] Initial pull completed.');
      }
    } catch (err) {
      console.error('[SyncEngine] Initial pull failed:', err);
    }
  };

  const performSync = async () => {
    if (!isOnline) return;
    setSyncStatus('syncing');

    try {
      // 1. Sync Moods
      const dirtyMoods = await db.moods.where('_dirty').equals(1).toArray();
      for (const mood of dirtyMoods) {
        await syncMoodAction(mood); 
        await db.moods.update(mood.id, { _dirty: 0 });
      }

      // 2. Sync Tasks
      const dirtyTasks = await db.tasks.where('_dirty').equals(1).toArray();
      for (const task of dirtyTasks) {
        await syncTaskAction(task);
        await db.tasks.update(task.id, { _dirty: 0 });
      }

      // 3. Sync Documents
      const dirtyDocs = await db.documents.where('_dirty').equals(1).toArray();
      for (const doc of dirtyDocs) {
        // @ts-ignore
        await syncDocAction(doc as any);
        await (db.documents as any).update(doc.id, { _dirty: 0 });
      }

      // 4. Sync Diaries
      const dirtyDiaries = await db.diaries.where('_dirty').equals(1).toArray();
      for (const diary of dirtyDiaries) {
        await syncDiaryAction(diary);
        await db.diaries.update(diary.id, { _dirty: 0 });
      }

      setSyncStatus('synced');
    } catch (error) {
      console.error('[SyncWorker] Error during background sync:', error);
      setSyncStatus('error');
    }
  };

  useEffect(() => {
    if (isOnline) {
      // Initial sync on mount or when coming back online
      performPull().then(() => performSync());
      
      // Periodic sync every 30 seconds
      syncInterval.current = setInterval(performSync, 30000);
    } else {
      if (syncInterval.current) clearInterval(syncInterval.current);
    }

    return () => {
      if (syncInterval.current) clearInterval(syncInterval.current);
    };
  }, [isOnline]);
}

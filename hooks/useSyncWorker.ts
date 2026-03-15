/**
 * [INPUT]:    依赖 lib/db (Dexie) 和 lib/supabase-db (Server Actions)
 * [OUTPUT]:   在后台自动同步 _dirty 记录到云端
 * [POS]:      hooks/useSyncWorker.ts - 全局同步引擎 Hook
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useEffect, useRef } from 'react';
import { db } from '@/lib/db';
import { useAppStore } from './useAppStore';
import { syncMoodAction, syncTaskAction, syncDocAction, syncStatusAction, syncContextAction, syncTreeAction } from '@/app/actions/sync';

export function useSyncWorker() {
  const isOnline = useAppStore(s => s.isOnline);
  const setSyncStatus = useAppStore(s => s.setSyncStatus);
  const syncInterval = useRef<NodeJS.Timeout | null>(null);

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
        // cast to any to avoid circular reference detection if the tree is deep
        await syncDocAction(doc as any);
        await db.documents.update(doc.id, { _dirty: 0 });
      }

      // 4. Sync Statuses
      const dirtyStatuses = await db.statuses.where('_dirty').equals(1).toArray();
      for (const status of dirtyStatuses) {
        await syncStatusAction(status);
        await db.statuses.update(status.id, { _dirty: 0 });
      }

      // 5. Sync Contexts
      const dirtyContexts = await db.contexts.where('_dirty').equals(1).toArray();
      for (const ctx of dirtyContexts) {
        await syncContextAction(ctx);
        await db.contexts.update(ctx.id, { _dirty: 0 });
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
      performSync();
      
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

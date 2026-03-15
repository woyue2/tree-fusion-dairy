/**
 * [INPUT]:    依赖 Dexie 库进行 IndexedDB 操作
 * [OUTPUT]:   导出 db 实例及相关 Table 定义
 * [POS]:      lib/db.ts - 本地持久化真相源 (Offline-First)
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import Dexie, { type Table } from 'dexie';
import { TreeDocument, DiaryEntry } from '@/types';

export interface LocalMood {
  id: string; // UUID
  userId: string;
  date: string;
  score: number;
  note: string;
  createdAt: string;
  updatedAt: string;
  _dirty?: number; // 0: sync, 1: dirty
  deletedAt?: string | null;
}

export interface LocalTask {
  id: string; // UUID
  userId: string;
  title: string;
  statusId: string;
  contextId: string;
  color?: string;
  tags?: string[];
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  _dirty?: number;
  deletedAt?: string | null;
}

export type LocalTreeDocument = TreeDocument;

export interface LocalStatus {
  id: string;
  userId: string;
  title: string;
  collapsed: boolean;
  orderIndex: number;
  color?: string;
  _dirty?: number;
}

export interface LocalContext {
  id: string;
  userId: string;
  title: string;
  color?: string;
  collapsed: boolean;
  orderIndex: number;
  _dirty?: number;
}

export class TreeFusionDatabase extends Dexie {
  moods!: Table<LocalMood>;
  tasks!: Table<LocalTask>;
  documents!: Table<LocalTreeDocument>;
  statuses!: Table<LocalStatus>;
  contexts!: Table<LocalContext>;
  diaries!: Table<DiaryEntry & { _dirty?: number }>;

  constructor() {
    super('tree-fusion-db');
    this.version(1).stores({
      moods: 'id, userId, date, [userId+date], _dirty',
      tasks: 'id, userId, statusId, contextId, _dirty, deletedAt',
      documents: 'id, userId, _dirty, deletedAt',
      statuses: 'id, userId, _dirty',
      contexts: 'id, userId, _dirty',
      diaries: 'id, userId, date, _dirty, deletedAt'
    });
  }
}

export const db = new TreeFusionDatabase();

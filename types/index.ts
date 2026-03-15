// INPUT: 无（纯类型定义）
// OUTPUT: 全局 TypeScript 类型
// POS: types/index.ts — GEB L3 · 全局类型定义（独立目录，与逻辑解耦）
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

// ─── 通用 ────────────────────────────────────────────────

/** API 统一响应格式 */
export interface ApiResponse<T = unknown> {
  success: boolean
  data?:   T
  error?:  string
}

// ─── 业务类型（按项目需要在此扩展）────────────────────────

export type TodoStatusId = 'todo' | 'doing' | 'done' | 'when-free' | string

export interface TodoStatus {
  id: TodoStatusId
  title: string
  color?: string
  collapsed?: boolean
  belowOf?: string | null
  orderIndex?: number
}

export interface TodoContext {
  id: string
  title: string
  color?: string
  collapsed?: boolean
  belowOf?: string | null
  orderIndex?: number
}

export interface TodoTask {
  id: string
  title: string
  statusId: TodoStatusId
  contextId: string
  color?: string
  tags?: string[]
  orderIndex?: number
  createdAt?: string
  updatedAt?: string
  deletedAt?: string | null
}

// ─── Tree Index ──────────────────────────────────────────

export interface OutlineNode {
  id: string
  docId: string
  parentId?: string | null
  content: string
  level?: number
  children: string[] // Array of child node IDs
  images?: string[]
  collapsed?: boolean
  isExpanded?: boolean
  isRoot?: boolean
  isHeader?: boolean
  isSubHeader?: boolean
  isItalic?: boolean
  icon?: string
  tags?: string[]
}

export interface TreeDocument {
  id: string
  userId: string
  title: string
  icon?: string
  emoji?: string
  isArchived?: boolean
  nodes: Record<string, OutlineNode> // Flattened tree nodes
  rootNodeId?: string
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

// ─── Diary App ───────────────────────────────────────────

export interface DiaryEntry {
  id: string
  title: string
  content: string
  preview: string
  date: string
  originalContent?: string
  structuredVersion?: string
  finalVersion?: string
  tags?: string[]
  isSynced?: boolean
  createdAt: string
  updatedAt: string
  aiAnalysis?: {
    sentiment?: string
    tags?: string[]
    summary?: string
  }
  deletedAt?: string | null
}

export interface WeeklySummary {
  id: string
  startDate: string
  endDate: string
  title: string
  summary: string
  diaryIds: string[]
  images?: string[]
  footerImages?: string[]
  createdAt: string
  updatedAt: string
}

// ─── Stat / Mood ──────────────────────────────────────────

export interface Mood {
  id: string
  userId: string
  date: string // YYYY-MM-DD
  score: number // 1-10
  note?: string
  createdAt?: string
  updatedAt?: string
}

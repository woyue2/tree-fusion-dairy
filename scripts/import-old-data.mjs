/**
 * 一次性旧数据导入脚本
 * 将旧 SQLite (fusion-todo) + JSON (diary, tree) 导出为 import-bundle.json
 * 供浏览器端页面一键写入 Dexie
 */

import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'
import { randomUUID } from 'crypto'

const USER_ID = 'default-user'
const NOW = new Date().toISOString()

// ─── 1. Todo (SQLite → JSON) ──────────────────────────────
const TODO_DB = '/home/aa/Park/fusion-todo/data/todo.db'

function sqliteQuery(db, sql) {
  const out = execSync(`sqlite3 -json "${db}" "${sql}"`).toString().trim()
  return out ? JSON.parse(out) : []
}

const rawStatuses = sqliteQuery(TODO_DB, 'SELECT id,title,"order",collapsed,belowOf FROM statuses ORDER BY "order"')
const rawContexts = sqliteQuery(TODO_DB, 'SELECT id,title,color,"order",collapsed,belowOf FROM contexts ORDER BY "order"')
const rawTasks    = sqliteQuery(TODO_DB, 'SELECT id,title,status,context,tags,color,"order",createdAt FROM tasks ORDER BY "order"')

const statuses = rawStatuses.map(s => ({
  id: s.id,
  userId: USER_ID,
  title: s.title,
  collapsed: s.collapsed === 1,
  orderIndex: s.order ?? 0,
  belowOf: s.belowOf ?? null,
  _dirty: 0,
}))

const contexts = rawContexts.map(c => ({
  id: c.id,
  userId: USER_ID,
  title: c.title,
  color: c.color ?? '#888888',
  collapsed: c.collapsed === 1,
  orderIndex: c.order ?? 0,
  belowOf: c.belowOf ?? null,
  _dirty: 0,
}))

const tasks = rawTasks.map(t => {
  let tags = []
  try { tags = JSON.parse(t.tags || '[]') } catch {}
  return {
    id: t.id,
    userId: USER_ID,
    title: t.title,
    statusId: t.status,
    contextId: t.context,
    color: t.color ?? '#ffffff',
    tags,
    orderIndex: t.order ?? 0,
    createdAt: t.createdAt ?? NOW,
    updatedAt: NOW,
    deletedAt: null,
    _dirty: 0,
  }
})

console.log(`✅ Todo: ${statuses.length} statuses, ${contexts.length} contexts, ${tasks.length} tasks`)

// ─── 2. Diary (JSON) ─────────────────────────────────────
const diaryBackup = JSON.parse(
  readFileSync('/home/aa/Park/tree-fusion-dairy/old-data/diary-backup-2026-03-15.json', 'utf8')
)

const diaries = diaryBackup.diaries.map(d => ({
  id: d.id,
  userId: USER_ID,
  title: d.title || '',
  date: d.date,
  content: {
    original: d.content || d.original_content || '',
    structured: d.structured_version || undefined,
    final: d.finalVersion || undefined,
  },
  images: Array.isArray(d.images) ? d.images : [],
  footerImages: Array.isArray(d.footer_images) ? d.footer_images : [],
  aiAnalysis: d.analysis || null,
  tags: [],
  createdAt: d.createdAt || NOW,
  updatedAt: d.updatedAt || NOW,
  deletedAt: null,
  _dirty: 0,
}))

console.log(`✅ Diary: ${diaries.length} entries`)

// ─── 3. Tree (JSON) ──────────────────────────────────────
const rawTree = JSON.parse(
  readFileSync('/home/aa/Park/tree-fusion-dairy/old-data/tree.json', 'utf8')
)

// tree.json 是 TreeDocument[] 数组，结构已与新项目一致
const documents = rawTree.map(doc => ({
  ...doc,
  userId: USER_ID,
  _dirty: 0,
}))

console.log(`✅ Tree: ${documents.length} documents`)

// ─── 4. 输出 bundle ──────────────────────────────────────
const bundle = { statuses, contexts, tasks, diaries, documents }
const outPath = '/home/aa/Park/tree-fusion-dairy/old-data/import-bundle.json'
writeFileSync(outPath, JSON.stringify(bundle, null, 2))
console.log(`\n📦 Bundle written to ${outPath}`)
console.log(`   statuses: ${statuses.length}`)
console.log(`   contexts: ${contexts.length}`)
console.log(`   tasks:    ${tasks.length}`)
console.log(`   diaries:  ${diaries.length}`)
console.log(`   trees:    ${documents.length}`)

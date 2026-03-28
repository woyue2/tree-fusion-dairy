// INPUT: import-bundle.json (由 scripts/import-old-data.py 生成)
// OUTPUT: 写入 Dexie db (statuses/contexts/tasks/diaries/documents)
// POS: app/(private)/settings/import/BundleImporter.tsx — GEB L3
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

'use client'

import { useState } from 'react'
import { db } from '@/lib/db'
import { toast } from 'sonner'
import { Upload, CheckCircle2, Loader2 } from 'lucide-react'

interface ImportBundle {
  statuses: any[]
  contexts: any[]
  tasks: any[]
  diaries: any[]
  documents: any[]
}

interface ImportResult {
  statuses: number
  contexts: number
  tasks: number
  diaries: number
  documents: number
}

export function BundleImporter() {
  const [isImporting, setIsImporting] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setIsImporting(true)
    setResult(null)
    try {
      const text = await file.text()
      const bundle: ImportBundle = JSON.parse(text)

      // putBulk with ignoreErrors — skip duplicates
      const importTable = async (table: any, rows: any[]) => {
        let count = 0
        for (const row of rows) {
          try {
            await table.add(row)
            count++
          } catch {
            // id already exists — skip
          }
        }
        return count
      }

      const counts: ImportResult = {
        statuses:  await importTable(db.statuses,  bundle.statuses  || []),
        contexts:  await importTable(db.contexts,  bundle.contexts  || []),
        tasks:     await importTable(db.tasks,     bundle.tasks     || []),
        diaries:   await importTable(db.diaries,   bundle.diaries   || []),
        documents: await importTable(db.documents, bundle.documents || []),
      }

      setResult(counts)
      toast.success('导入完成！')
    } catch (err: any) {
      toast.error('导入失败: ' + err.message)
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <label className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-10 cursor-pointer transition-colors ${
        isImporting ? 'border-slate-200 bg-slate-50 cursor-not-allowed' : 'border-slate-300 hover:border-orange-400 hover:bg-orange-50'
      }`}>
        {isImporting
          ? <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          : <Upload className="w-8 h-8 text-slate-400" />}
        <span className="text-sm text-slate-500">
          {isImporting ? '正在导入...' : '点击选择 import-bundle.json'}
        </span>
        <input
          type="file"
          accept=".json"
          className="hidden"
          disabled={isImporting}
          onChange={handleFile}
        />
      </label>

      {result && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-5 space-y-2">
          <div className="flex items-center gap-2 font-bold text-green-700 mb-3">
            <CheckCircle2 className="w-5 h-5" />
            导入成功
          </div>
          {([
            ['Todo 状态栏', result.statuses],
            ['Todo 分类', result.contexts],
            ['Todo 任务', result.tasks],
            ['日记', result.diaries],
            ['知识树文档', result.documents],
          ] as const).map(([label, count]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-slate-600">{label}</span>
              <span className="font-mono font-bold text-green-700">+{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

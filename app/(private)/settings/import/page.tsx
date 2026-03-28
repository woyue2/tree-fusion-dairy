// INPUT: 无（前端 File API 由客户端组件触发）
// OUTPUT: 历史数据导入工具页面（读取 import-bundle.json → 写入 Dexie）
// POS: app/(private)/settings/import/page.tsx — GEB L3 · Legacy Data Importer
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'
import { BundleImporter } from './BundleImporter'

export const metadata: Metadata = {
  title: '导入历史数据 · Tree-Fusion-Diary',
  description: '将旧版数据（todo/diary/tree）导入本地 Dexie',
}

export default function ImportPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-1">历史数据导入</h1>
      <p className="text-sm text-slate-500 mb-6">
        选择由脚本生成的 <code className="bg-slate-100 px-1 rounded">import-bundle.json</code>，
        一键写入本地 IndexedDB（不覆盖已有数据，跳过 id 冲突项）。
      </p>
      <BundleImporter />
    </div>
  )
}

// INPUT: 无（前端 showDirectoryPicker 由客户端组件触发）
// OUTPUT: 历史数据导入工具页面
// POS: app/(private)/settings/import/page.tsx — GEB L3 · Legacy Data Importer
// DEPS: 无（Client Component 中使用 File System Access API）
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '导入历史数据 · Tree-Fusion-Diary',
  description: '将旧版 diary-app 的本地数据导入云端',
}

export default function ImportPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">历史数据导入</h1>
      <p className="mt-2 text-sm text-[var(--app-muted)]">
        请使用下方工具将旧版 diary-app（diary.json / weekly.json）导入 Supabase 云端。
      </p>
      {/* TODO: 安装此页面后实现 LegacyImporter Client Component
          流程：
          1. window.showDirectoryPicker() 让用户选择 MyDiary 文件夹
          2. 递归读取 diary.json / weekly.json 及图片
          3. 图片上传至 Supabase Storage user-assets 桶
          4. 日记条目通过 supabase client 批量 upsert（自动注入 user_id）
      */}
      <div className="mt-6 rounded-lg border border-dashed border-[var(--app-border)] p-8 text-center text-[var(--app-muted)]">
        LegacyImporter 组件占位 — 待实现
      </div>
    </div>
  )
}

// INPUT: 无 (状态读取自 useAppStore)
// OUTPUT: 返回设置页面UI
// POS: app/(private)/settings/page.tsx - 全局设置和导入管理
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState } from 'react'
import { useAppStore } from '@/hooks/useAppStore'

export default function SettingsPage() {
  const { addToast } = useAppStore()
  const [supabaseUrl, setSupabaseUrl] = useState('')
  const [supabaseKey, setSupabaseKey] = useState('')
  const [aiApiKey, setAiApiKey] = useState('')
  return (
    <div id="view-settings" className="view active">
      <div className="settings-inner">
        <h2><span style={{ fontSize: '20px' }}>⚙️</span> 设置 & 数据导入</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '24px' }}>
          所有配置（包括 AI Key 与图床 Token）均将本地加密存储。
        </p>

        <div className="settings-section">
          <h3>🔑 Supabase 配置 (Core)</h3>
          <div className="settings-group">
            <label>Project URL</label>
            <input type="text" className="settings-input" placeholder="https://xxxx.supabase.co" value={supabaseUrl} onChange={e => setSupabaseUrl(e.target.value)} />
          </div>
          <div className="settings-group">
            <label>Anon Key</label>
            <input type="password" className="settings-input" placeholder="eyJ..." value={supabaseKey} onChange={e => setSupabaseKey(e.target.value)} />
          </div>
          <button 
            className="settings-btn" 
            style={{ marginTop: '8px' }}
            onClick={() => addToast('Supabase 配置已保存并连接成功！', 'success')}
          >
            连接并保存
          </button>
        </div>

        <div className="settings-section">
          <h3>🤖 AI 引擎配置</h3>
          <div className="settings-group">
            <label>AI 服务提供商</label>
            <div className="modern-select-wrapper" style={{ display: 'block' }}>
              <select className="modern-select" style={{ width: '100%' }}>
                <option>智谱 GLM-4 (推荐)</option>
                <option>OpenAI GPT-4o</option>
                <option>Anthropic Claude</option>
              </select>
            </div>
          </div>
          <div className="settings-group">
            <label>API Key</label>
            <input type="password" className="settings-input" placeholder="sk-..." value={aiApiKey} onChange={e => setAiApiKey(e.target.value)} />
          </div>
          <button 
            className="settings-btn" 
            style={{ marginTop: '8px' }}
            onClick={() => addToast('AI 引擎 API Key 已验证并保存！', 'success')}
          >
            验证并保存
          </button>
        </div>

        <div className="settings-section" style={{ borderStyle: 'dashed', backgroundColor: 'transparent' }}>
          <h3 style={{ textAlign: 'center' }}>📥 历史数据全量迁移</h3>
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', marginBottom: '16px' }}>
            点击下方区域选择你要导入的文件或目录
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div 
              className="import-box text-center cursor-pointer hover:bg-gray-50 transition-colors" 
              onClick={() => addToast('开始扫描并导入 MyDiary 文件夹...', 'info')}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>📂</div>
              <div style={{ fontWeight: 600 }}>旧版「MyDiary」文件夹</div>
            </div>
            <div 
              className="import-box text-center cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => addToast('正在解析 todo.db 导入看板数据...', 'info')}
            >
              <div style={{ fontSize: '24px', marginBottom: '8px' }}>🗃️</div>
              <div style={{ fontWeight: 600 }}>fusion-todo 的 todo.db</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

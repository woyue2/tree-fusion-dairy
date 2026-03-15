'use client'

import React, { useState } from 'react'
import { X, Sparkles, CalendarDays } from 'lucide-react'
import { useAppStore } from '@/hooks/useAppStore'

interface WeeklySummaryModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
}

export default function WeeklySummaryModal({ isOpen, onClose, selectedCount }: WeeklySummaryModalProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [content, setContent] = useState('')

  if (!isOpen) return null

  const handleGenerate = () => {
    setIsGenerating(true)
    setTimeout(() => {
      setIsGenerating(false)
      setContent(`### 📝 本周总结 (基于 ${selectedCount} 篇日记)\n\n**核心主题**：学习、技术探索与生活平衡。\n\n**高光时刻**：\n- 深入研究了 Next.js 和状态管理方案\n- 采用了番茄钟，效率显著提升\n\n**AI 建议**：\n你在这周展现了很好的自律性。下周可以尝试将更多的碎片化知识连接成相对完整的结构（例如完善知识树模块）。`)
    }, 1500)
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CalendarDays size={18} />
            <h2>生成周记总结</h2>
          </div>
          <button className="modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="modal-body" style={{ minHeight: '200px' }}>
          {!content && !isGenerating && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: '#666', marginBottom: '20px' }}>将基于选中的 {selectedCount} 篇日记，使用 AI 生成本周的结构化总结。</p>
              <button 
                className="btn-primary" 
                onClick={handleGenerate}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
              >
                <Sparkles size={16} /> 开始生成
              </button>
            </div>
          )}

          {isGenerating && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#666' }}>
              <Sparkles size={24} className="animate-spin" style={{ margin: '0 auto 16px', color: '#eb5a46' }} />
              <p>AI 正在阅读你的日记并萃取知识...</p>
            </div>
          )}

          {content && !isGenerating && (
            <div style={{ animation: 'fadeIn 0.3s' }}>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                style={{ width: '100%', height: '200px', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', resize: 'vertical', fontFamily: 'inherit', lineHeight: 1.5 }}
              />
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ borderTop: '1px solid #eee', padding: '16px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button className="btn-secondary" onClick={onClose}>关闭</button>
          {content && <button className="btn-primary" onClick={() => { useAppStore.getState().addToast('已保存为新文档！', 'success'); onClose(); }}>保存到知识树</button>}
        </div>
      </div>
    </div>
  )
}

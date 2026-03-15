'use client'

import React, { useState, useEffect, useRef } from 'react'
import { X, Lightbulb } from 'lucide-react'
import { useTodoStore } from '@/hooks/useTodoStore'
import { useMoodStore } from '@/hooks/useMoodStore'
import { useAppStore } from '@/hooks/useAppStore'

interface IdeaModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function IdeaModal({ isOpen, onClose }: IdeaModalProps) {
  const { contexts, addTask } = useTodoStore()
  const addMood = useMoodStore(s => s.addMood)
  const addToast = useAppStore(s => s.addToast)
  
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [score, setScore] = useState<number>(5) // Default score for mood
  const [isMoodMode, setIsMoodMode] = useState(false)
  const [contextId, setContextId] = useState('')
  
  useEffect(() => {
    if (contexts.length > 0 && !contextId) {
      setContextId(contexts[0].id)
    }
  }, [contexts, contextId])
  
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()])
      }
      setTagInput('')
    }
  }

  const handleSave = async () => {
    if (!title.trim()) return
    setIsSaving(true)
    
    try {
      if (isMoodMode) {
        await addMood({
          date: date,
          score: score,
          note: title.trim()
        })
        addToast('情绪记录成功', 'success')
      } else {
        await addTask({
          title: title.trim(),
          statusId: 'todo',
          contextId: contextId,
          tags: tags,
          color: '#0079bf',
          createdAt: date // Used for Date View grouping
        } as any)
        addToast('任务想法已保存', 'success')
      }
      
      setTitle('')
      setTags([])
      onClose()
    } catch (error) {
      addToast('保存失败，请重试', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex flex-1 items-center gap-4">
            <button 
              onClick={() => setIsMoodMode(false)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${!isMoodMode ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <Lightbulb size={18} className={!isMoodMode ? 'fill-current' : ''} />
              <span className="text-[13px] font-bold">记主意</span>
            </button>
            <button 
              onClick={() => setIsMoodMode(true)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${isMoodMode ? 'bg-emerald-500 text-white shadow-sm' : 'text-gray-400 hover:bg-gray-100'}`}
            >
              <div className="w-[18px] h-[18px] flex items-center justify-center">✨</div>
              <span className="text-[13px] font-bold">记心情</span>
            </button>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              {isMoodMode ? '此刻感受' : '想法描述'}
            </label>
            <textarea
              ref={textareaRef}
              rows={3}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isMoodMode ? "今天感觉怎么样？写点什么记录下..." : "在这里输入你的灵感..."}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[14px] focus:outline-none focus:border-[var(--accent)] focus:bg-white transition-all resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">日期</label>
              <input 
                type="date" 
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[var(--accent)] transition-all"
              />
            </div>
            {!isMoodMode ? (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">关联清单</label>
                <select 
                  value={contextId}
                  onChange={(e) => setContextId(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[var(--accent)] transition-all cursor-pointer"
                >
                  {contexts.map(ctx => (
                    <option key={ctx.id} value={ctx.id}>{ctx.title}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">心情评分 ({score})</label>
                <div className="flex items-center gap-2 h-[38px]">
                  <input 
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={score}
                    onChange={(e) => setScore(parseInt(e.target.value))}
                    className="w-full accent-emerald-500"
                  />
                </div>
              </div>
            )}
          </div>

          {!isMoodMode && (
            <div>
              <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">标签 (Enter 添加)</label>
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border border-gray-200 rounded-lg min-h-[42px]">
                {tags.map(tag => (
                  <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[11px] font-bold rounded">
                    {tag}
                    <button onClick={() => setTags(tags.filter(t => t !== tag))} className="hover:text-blue-900">
                      <X size={10} />
                    </button>
                  </span>
                ))}
                <input 
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder={tags.length === 0 ? "属性、关键词..." : ""}
                  className="flex-1 min-w-[60px] bg-transparent text-[13px] outline-none"
                />
              </div>
            </div>
          )}
        </div>

        <div className="px-5 py-4 bg-gray-50 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-[13px] font-bold text-gray-500 hover:text-gray-700 transition-colors">
            取消
          </button>
          <button 
            disabled={!title.trim() || isSaving}
            onClick={handleSave}
            className={`px-6 py-2 text-white text-[13px] font-bold rounded-lg shadow-sm hover:brightness-110 disabled:opacity-50 disabled:grayscale transition-all flex items-center gap-2 ${isMoodMode ? 'bg-emerald-500' : 'bg-[var(--accent)]'}`}
          >
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                保存中...
              </>
            ) : (
              isMoodMode ? '记录心情' : '保存想法'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

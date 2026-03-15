'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { TodoTask } from '@/types'
import { useTodoStore } from '@/hooks/useTodoStore'

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: TodoTask | null // If provided, it's Edit Mode. Otherwise, Create Mode.
  defaultContextId?: string
  defaultStatusId?: string
}

const CARD_COLORS = [
  { name: 'None', hex: '#ffffff' },
  { name: 'Red', hex: '#ff5630' },
  { name: 'Orange', hex: '#ff991f' },
  { name: 'Yellow', hex: '#fadc19' },
  { name: 'Green', hex: '#36b37e' },
  { name: 'Blue', hex: '#0065ff' },
  { name: 'Purple', hex: '#6554c0' }
]

export default function TaskModal({ isOpen, onClose, task, defaultContextId, defaultStatusId }: TaskModalProps) {
  const { statuses, contexts, addTask, updateTask, deleteTask } = useTodoStore()
  
  const isEditMode = !!task

  const initialTaskState: Partial<TodoTask> = {
    title: '',
    statusId: (defaultStatusId || statuses[0]?.id) as any,
    contextId: defaultContextId || contexts[0]?.id,
    tags: [],
    color: '#ffffff'
  }

  const [editedTask, setEditedTask] = useState<Partial<TodoTask>>(initialTaskState)
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setEditedTask({ ...task })
      } else {
        setEditedTask({
          title: '',
          statusId: (defaultStatusId || statuses[0]?.id) as any,
          contextId: defaultContextId || contexts[0]?.id,
          tags: [],
          color: '#ffffff'
        })
      }
      setTagInput('')
    }
  }, [isOpen, task, defaultContextId, defaultStatusId, statuses, contexts])

  if (!isOpen) return null

  const handleSave = () => {
    if (!editedTask.title?.trim()) return

    if (isEditMode && task) {
      updateTask(task.id, editedTask)
    } else {
      addTask({
        ...editedTask,
        id: 't_' + Date.now(),
        title: editedTask.title.trim(),
        createdAt: new Date().toISOString()
      } as TodoTask)
    }
    onClose()
  }

  const handleDelete = () => {
    if (task?.id) {
      deleteTask(task.id)
      onClose()
    }
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault()
      const newTag = tagInput.trim()
      const currentTags = editedTask.tags || []
      if (!currentTags.includes(newTag)) {
        setEditedTask({ ...editedTask, tags: [...currentTags, newTag] })
      }
      setTagInput('')
    }
  }

  const currentTags = editedTask.tags || []

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 animate-in fade-in duration-200" onClick={onClose}>
      <div 
        className="bg-white w-[450px] max-w-[90%] rounded-lg shadow-2xl p-6 flex flex-col gap-5 animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <span className="text-xl font-bold text-[#172b4d]">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </span>
          <button onClick={onClose} className="text-2xl text-[#999] hover:text-[#172b4d] bg-transparent border-none cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#5e6c84] tracking-wide">TASK DESCRIPTION</label>
          <textarea 
            className="p-2.5 border border-[#dfe1e6] rounded text-[0.95rem] min-h-[80px] focus:border-[#0079bf] focus:outline-none focus:ring-2 focus:ring-[#0079bf]/20 transition-all resize-y font-sans"
            value={editedTask.title}
            onChange={(e) => setEditedTask({...editedTask, title: e.target.value})}
            placeholder="Describe the task..."
            autoFocus
          />
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#5e6c84] tracking-wide">STATUS</label>
            <select 
              className="p-2.5 border border-[#dfe1e6] rounded text-[0.95rem] focus:border-[#0079bf] focus:outline-none focus:ring-2 focus:ring-[#0079bf]/20 bg-white"
              value={editedTask.statusId}
              onChange={(e) => setEditedTask({...editedTask, statusId: e.target.value as any})}
            >
              {statuses.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <label className="text-sm font-semibold text-[#5e6c84] tracking-wide">CONTEXT (LIST)</label>
            <select 
              className="p-2.5 border border-[#dfe1e6] rounded text-[0.95rem] focus:border-[#0079bf] focus:outline-none focus:ring-2 focus:ring-[#0079bf]/20 bg-white"
              value={editedTask.contextId}
              onChange={(e) => setEditedTask({...editedTask, contextId: e.target.value})}
            >
              {contexts.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#5e6c84] tracking-wide">PRIORITY / COLOR</label>
          <div className="flex gap-3 items-center">
            {CARD_COLORS.map(c => (
              <div 
                key={c.hex}
                onClick={() => setEditedTask({...editedTask, color: c.hex})}
                className={`w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110 ${editedTask.color === c.hex ? 'border-[#5e6c84] ring-2 ring-black/10 scale-110' : 'border-transparent'}`}
                style={{ backgroundColor: c.hex }}
                title={c.name}
              />
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-[#5e6c84] tracking-wide">TAGS</label>
          <div className="flex flex-wrap gap-2 p-2 border border-[#dfe1e6] rounded min-h-[44px] focus-within:border-[#0079bf] focus-within:ring-2 focus-within:ring-[#0079bf]/20 transition-all bg-white">
            {currentTags.map(tag => (
              <span key={tag} className="flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-[12px] font-bold rounded">
                {tag}
                <button onClick={() => setEditedTask({...editedTask, tags: currentTags.filter(t => t !== tag)})} className="hover:text-blue-900">
                  <X size={10} />
                </button>
              </span>
            ))}
            <input 
              type="text" 
              className="flex-1 min-w-[80px] outline-none text-[0.95rem] bg-transparent"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder={currentTags.length === 0 ? "e.g. Work, Urgent (Enter to add)" : ""}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-2">
          {isEditMode && (
            <button 
              onClick={handleDelete}
              className="px-4 py-2 rounded font-medium bg-[#eb5a46]/10 text-[#eb5a46] hover:bg-[#eb5a46]/20 transition-colors cursor-pointer mr-auto"
            >
              Delete Task
            </button>
          )}
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded font-medium bg-[#ebecf0] text-[#172b4d] hover:bg-[#dfe1e6] transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!editedTask.title?.trim()}
            className="px-4 py-2 rounded font-medium bg-[#0079bf] text-white hover:bg-[#005a8e] transition-colors cursor-pointer disabled:opacity-50 disabled:grayscale"
          >
            {isEditMode ? 'Save Changes' : 'Create Task'}
          </button>
        </div>

      </div>
    </div>
  )
}

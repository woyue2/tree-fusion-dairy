// INPUT: documents, activeDocId, interactions
// OUTPUT: 渲染知识树侧边栏 (文档列表 + 回收站)
// POS: components/tree/TreeSidebar.tsx - 知识树导航侧边栏组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState } from 'react'
import { Search, Plus, Trash2, ArrowLeft, RefreshCw, X } from 'lucide-react'
import { TreeDocument } from '@/types'
import { useTreeStore } from '@/hooks/useTreeStore'

interface TreeSidebarProps {
  documents: TreeDocument[]
  activeDocId?: string
  onSelectDoc: (id: string) => void
  onNewDoc: () => void
}

export default function TreeSidebar({ documents, activeDocId, onSelectDoc, onNewDoc }: TreeSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [isTrashView, setIsTrashView] = useState(false)
  
  const { moveToTrash, restoreDocument, emptyTrash } = useTreeStore()

  const activeDocs = documents.filter(d => !d.deletedAt && d.title.toLowerCase().includes(searchQuery.toLowerCase()))
  const trashDocs = documents.filter(d => d.deletedAt && d.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const docsToRender = isTrashView ? trashDocs : activeDocs

  return (
    <div className="tree-sidebar">
      <div className="tree-sidebar-header">
        {isTrashView ? (
          <>
            <button onClick={() => setIsTrashView(false)} className="tree-btn" style={{ padding: '4px' }}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ flex: 1, marginLeft: '8px' }}>回收站</h2>
            <button 
              className="tree-btn error" 
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={() => {
                if (confirm(`清空回收站 (${trashDocs.length}个)?`)) emptyTrash()
              }}
              disabled={trashDocs.length === 0}
            >
              清空
            </button>
          </>
        ) : (
          <>
            <span style={{ fontSize: '16px' }}>🌿</span>
            <h2 style={{ flex: 1, marginLeft: '8px' }}>知识树</h2>
            <button 
              className="tree-btn primary" 
              style={{ fontSize: '11px', padding: '3px 8px' }}
              onClick={onNewDoc}
            >
              <Plus size={14} />
            </button>
          </>
        )}
      </div>
      
      <div style={{ position: 'relative', margin: '0 16px 12px' }}>
        <input 
          className="tree-search-box" 
          type="text" 
          placeholder="🔍 搜索文档..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', paddingRight: searchQuery ? '24px' : '8px' }}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="tree-doc-list" style={{ flex: 1, overflowY: 'auto' }}>
        {docsToRender.map((doc) => (
          <div 
            key={doc.id}
            onClick={() => onSelectDoc(doc.id)}
            className={`tree-doc-item ${doc.id === activeDocId ? 'active' : ''}`}
          >
            <div style={{ fontSize: '16px' }}>{doc.icon || '📄'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div 
                className="doc-name"
                contentEditable
                suppressContentEditableWarning
                onClick={(e) => {
                  e.stopPropagation() // Prevent triggering select when trying to edit
                }}
                onBlur={(e) => {
                  // @ts-ignore
                  useTreeStore.getState().renameDocument(doc.id, e.currentTarget.textContent || doc.title)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    e.currentTarget.blur()
                  }
                }}
              >
                {doc.title}
              </div>
              <div className="doc-meta">{new Date(doc.updatedAt).toISOString().split('T')[0]}</div>
            </div>
            {isTrashView ? (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  title="恢复文档"
                  onClick={(e) => {
                    e.stopPropagation()
                    restoreDocument(doc.id)
                  }}
                  className="text-gray-400 hover:text-green-500 cursor-pointer hidden group-hover:block"
                >
                  <RefreshCw size={14} />
                </button>
                <button
                  title="永久删除"
                  onClick={(e) => {
                    e.stopPropagation()
                    // @ts-ignore
                    if (confirm('确定永久删除？')) useTreeStore.getState().deleteDocument(doc.id)
                  }}
                  className="text-gray-400 hover:text-red-500 cursor-pointer hidden group-hover:block"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ) : (
              <button
                title="移至回收站"
                onClick={(e) => {
                  e.stopPropagation()
                  moveToTrash(doc.id)
                }}
                className="text-gray-400 hover:text-red-500 cursor-pointer hidden group-hover:block ml-2"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>

      {!isTrashView && (
        <div 
          onClick={() => setIsTrashView(true)}
          style={{ padding: '12px 20px', borderTop: '1px solid #eee', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#666', fontSize: '13px' }}
          className="hover:bg-gray-50 transition-colors"
        >
          <Trash2 size={16} />
          <span>回收站 ({trashDocs.length})</span>
        </div>
      )}
    </div>
  )
}

/**
 * [INPUT]:    documents, activeDocId, onSelectDoc, onNewDoc
 * [OUTPUT]:   Knowledge Tree Sidebar (Doc List + Trash)
 * [POS]:      components/tree/TreeSidebar.tsx - Tree Navigation Sidebar
 * [PROTOCOL]: Handles search and selection for the tree module.
 */
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

  const activeDocs = documents
    .filter(d => !d.deletedAt && d.title.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  
  const trashDocs = documents.filter(d => d.deletedAt && d.title.toLowerCase().includes(searchQuery.toLowerCase()))

  const docsToRender = isTrashView ? trashDocs : activeDocs

  return (
    <div className="tree-sidebar group/sidebar">
      <div className="tree-sidebar-header">
        {isTrashView ? (
          <>
            <button onClick={() => setIsTrashView(false)} className="tree-btn" style={{ padding: '4px' }}>
              <ArrowLeft size={16} />
            </button>
            <h2 style={{ flex: 1, marginLeft: '8px' }}>回收站</h2>
            <button 
              className="tree-btn" 
              style={{ fontSize: '11px', padding: '3px 8px', color: '#ff4d4f', borderColor: '#ffa39e' }}
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
              title="新建文档"
            >
               + 
            </button>
          </>
        )}
      </div>
      
      <div style={{ position: 'relative' }}>
        <input 
          className="tree-search-box" 
          type="text" 
          placeholder="🔍 搜索文档..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            style={{ position: 'absolute', right: '18px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#999' }}
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      <div className="tree-doc-list">
        {docsToRender.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-xs italic">
            {isTrashView ? '回收站是空的' : '没有找到相关文档'}
          </div>
        ) : (
          docsToRender.map((doc) => (
            <div 
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`tree-doc-item group ${doc.id === activeDocId ? 'active' : ''}`}
            >
              <div style={{ fontSize: '16px', flexShrink: 0 }}>{doc.icon || '📄'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="doc-name">{doc.title || '未命名文档'}</div>
                <div className="doc-meta">
                  {new Date(doc.updatedAt).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}
                </div>
              </div>
              
              <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {isTrashView && (
                  <>
                    <button 
                      title="恢复"
                      onClick={(e) => { e.stopPropagation(); restoreDocument(doc.id); }}
                      className="p-1 hover:text-green-600"
                    >
                      <RefreshCw size={12} />
                    </button>
                    <button
                      title="永久删除"
                      onClick={(e) => { e.stopPropagation(); if (confirm('确定永久删除？')) useTreeStore.getState().deleteDocument(doc.id); }}
                      className="p-1 hover:text-red-600"
                    >
                      <Trash2 size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {!isTrashView && (
        <div 
          onClick={() => setIsTrashView(true)}
          className="p-3 border-t border-slate-100 flex items-center gap-2 text-muted-foreground text-xs hover:bg-slate-50 cursor-pointer transition-colors"
        >
          <Trash2 size={14} />
          <span>回收站 ({trashDocs.length})</span>
        </div>
      )}
    </div>
  )
}

'use client'

import React from 'react'
import { Search, Plus, Trash2 } from 'lucide-react'
import { TreeDocument } from '@/types'

interface TreeSidebarProps {
  documents: TreeDocument[]
  activeDocId?: string
  onSelectDoc: (id: string) => void
  onNewDoc: () => void
}

export default function TreeSidebar({ documents, activeDocId, onSelectDoc, onNewDoc }: TreeSidebarProps) {
  return (
    <div className="tree-sidebar">
      <div className="tree-sidebar-header">
        <span style={{ fontSize: '16px' }}>🌿</span>
        <h2>知识树</h2>
        <button 
          className="tree-btn primary" 
          style={{ fontSize: '11px', padding: '3px 8px' }}
          onClick={onNewDoc}
        >
          +
        </button>
      </div>
      
      <input 
        className="tree-search-box" 
        type="text" 
        placeholder="🔍 搜索文档..."
      />
      
      <div className="tree-doc-list">
        {documents.map((doc) => (
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
              <div className="doc-meta">{new Date(doc.updatedAt).toLocaleDateString()}</div>
            </div>
            
            <Trash2 
               size={14} 
               className="tree-doc-trash-icon text-gray-400 hover:text-red-500 cursor-pointer hidden group-hover:block ml-2" 
               onClick={(e) => {
                 e.stopPropagation()
                 // @ts-ignore
                 if (confirm('Delete document?')) useTreeStore.getState().deleteDocument(doc.id)
               }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

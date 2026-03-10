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
              <div className="doc-name">{doc.title}</div>
              <div className="doc-meta">{new Date(doc.updatedAt).toLocaleDateString()}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

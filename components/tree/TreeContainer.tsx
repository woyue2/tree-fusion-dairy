// INPUT: 无 (状态读取自 useTreeStore)
// OUTPUT: 渲染知识树主容器组件
// POS: components/tree/TreeContainer.tsx - 知识树模块入口组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useEffect } from 'react'
import { useTreeStore } from '@/hooks/useTreeStore'
import { useAppStore } from '@/hooks/useAppStore'
import TreeSidebar from './TreeSidebar'
import TreeNode from './TreeNode'
import { Undo2, Save } from 'lucide-react'

export default function TreeContainer() {
  const { documents, activeDoc, setActiveDoc, updateNode, setDocuments } = useTreeStore()

  const handleUpdateNode = (nodeId: string, content: string) => {
    if (activeDoc) {
      updateNode(activeDoc.id, nodeId, { content })
    }
  }


  return (
    <div id="view-tree" className="view active">
      <TreeSidebar 
        documents={documents}
        activeDocId={activeDoc?.id}
        onSelectDoc={(id) => {
          const doc = documents.find(d => d.id === id)
          if (doc) setActiveDoc(doc)
        }}
        onNewDoc={() => {
          // @ts-ignore
          useTreeStore.getState().addDocument('无标题文档')
        }}
      />

      <div className="tree-main">
        <div className="tree-toolbar" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', borderBottom: '1px solid #e0e0e0', paddingBottom: '12px', marginBottom: '16px' }}>
          <div 
            className="tree-doc-title-label" 
            id="tree-doc-title"
            contentEditable
            suppressContentEditableWarning
            style={{ fontSize: '24px', fontWeight: 'bold', outline: 'none', borderBottom: '1px dashed transparent', padding: '4px' }}
            onFocus={(e) => e.currentTarget.style.borderBottomColor = '#ccc'}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = 'transparent'
              if (activeDoc) {
                // @ts-ignore
                useTreeStore.getState().renameDocument(activeDoc.id, e.currentTarget.textContent || activeDoc.title)
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                e.currentTarget.blur()
              }
            }}
          >
            {activeDoc?.title || '新文档'}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="tree-help" style={{ fontSize: '12px', color: '#888', marginRight: '16px' }}>Tab缩进 · Shift+Tab反缩进 · Enter换行</span>
            <button className="tree-btn" onClick={() => useAppStore.getState().addToast('撤销功能开发中...', 'info')}>↩ 撤销</button>
            <button className="tree-btn primary" onClick={() => useAppStore.getState().addToast('文档已随时自动保存', 'success')}>保存</button>
          </div>
        </div>

        <div className="outline-area" id="outline-area">
          {activeDoc && activeDoc.nodes['root']?.children.map(childId => (
            <TreeNode 
              key={childId}
              nodeId={childId}
              nodes={activeDoc.nodes}
              onUpdate={handleUpdateNode}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

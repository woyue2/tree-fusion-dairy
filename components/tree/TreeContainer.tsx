'use client'

import React, { useEffect } from 'react'
import { useTreeStore } from '@/hooks/useTreeStore'
import TreeSidebar from './TreeSidebar'
import TreeNode from './TreeNode'
import { Undo2, Save } from 'lucide-react'

export default function TreeContainer() {
  const { documents, activeDoc, setActiveDoc, updateNode, setDocuments } = useTreeStore()

  // Mock initial document if none exists
  useEffect(() => {
    if (documents.length === 0) {
      const mockDoc = {
        id: 'd1',
        title: '碎片化人类 · 主索引',
        icon: '🌳',
        updatedAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        nodes: {
          'root': {
            id: 'root',
            parentId: null,
            content: '碎片化人类',
            level: 1,
            children: ['n1', 'n2']
          },
          'n1': {
            id: 'n1',
            parentId: 'root',
            content: '方法论',
            level: 2,
            children: ['n1-1']
          },
          'n1-1': {
            id: 'n1-1',
            parentId: 'n1',
            content: '番茄钟工作法 — 25/5 节律固化专注闭环',
            level: 3,
            children: []
          },
          'n2': {
            id: 'n2',
            parentId: 'root',
            content: '技术',
            level: 2,
            children: []
          }
        }
      }
      // @ts-ignore
      setDocuments([mockDoc])
      // @ts-ignore
      setActiveDoc(mockDoc)
    }
  }, [documents.length, setActiveDoc, setDocuments])

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
        onNewDoc={() => {}}
      />

      <div className="tree-main">
        <div className="tree-toolbar">
          <div className="tree-doc-title-label" id="tree-doc-title">
            {activeDoc?.title || '新文档'}
          </div>
          <span className="tree-help">Tab缩进 · Shift+Tab反缩进 · Enter换行</span>
          <button className="tree-btn">↩ 撤销</button>
          <button className="tree-btn primary">保存</button>
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

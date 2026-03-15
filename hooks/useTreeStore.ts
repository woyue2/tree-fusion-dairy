// INPUT: 无
// OUTPUT: 知识树全局状态和节点操作方法
// POS: hooks/useTreeStore.ts - 知识树模块的状态管理层
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
import { create } from 'zustand'
import { TreeDocument, OutlineNode } from '@/types'

interface TreeState {
  documents: TreeDocument[]
  activeDoc: TreeDocument | null
  isLoading: boolean
  
  // Actions
  setDocuments: (docs: TreeDocument[]) => void
  setActiveDoc: (doc: TreeDocument | null) => void
  addDocument: (title: string) => void
  renameDocument: (id: string, newTitle: string) => void
  deleteDocument: (id: string) => void
  moveToTrash: (id: string) => void
  restoreDocument: (id: string) => void
  emptyTrash: () => void
  
  updateNode: (docId: string, nodeId: string, updates: Partial<OutlineNode>) => void
  addNode: (docId: string, parentId: string | null, afterNodeId: string) => void
  deleteNode: (docId: string, nodeId: string) => void
  
  indentNode: (docId: string, nodeId: string, direction: 'in' | 'out') => void
}

const MOCK_NODES: Record<string, OutlineNode> = {
  'root': { id: 'root', docId: 'doc1', content: '', isRoot: true, children: ['n1', 'n2', 'n3'] },
  'n1': { id: 'n1', docId: 'doc1', content: 'Tree-Fusion-Diary 项目架构设计', children: ['n1-1', 'n1-2', 'n1-3'], isExpanded: true },
  'n1-1': { id: 'n1-1', docId: 'doc1', content: 'Next.js App Router', children: [], parentId: 'n1' },
  'n1-2': { id: 'n1-2', docId: 'doc1', content: 'Zustand 状态管理 (取代 Redux)', children: [], parentId: 'n1' },
  'n1-3': { id: 'n1-3', docId: 'doc1', content: 'Tailwind CSS (响应式)', children: [], parentId: 'n1' },
  'n2': { id: 'n2', docId: 'doc1', content: '核心模块划分', children: ['n2-1', 'n2-2', 'n2-3'], isExpanded: true },
  'n2-1': { id: 'n2-1', docId: 'doc1', content: '🗂️ 知识树 (Tree-Index)', children: [], parentId: 'n2' },
  'n2-2': { id: 'n2-2', docId: 'doc1', content: '✅ 任务看板 (Fusion-Todo)', children: [], parentId: 'n2' },
  'n2-3': { id: 'n2-3', docId: 'doc1', content: '📓 结构化日记 (Diary-App)', children: [], parentId: 'n2' },
  'n3': { id: 'n3', docId: 'doc1', content: '痛点解决', children: ['n3-1', 'n3-2'], isExpanded: true },
  'n3-1': { id: 'n3-1', docId: 'doc1', content: '碎片化知识点自动关联 日记 模块', children: [], parentId: 'n3' },
  'n3-2': { id: 'n3-2', docId: 'doc1', content: '日历视图串联 Todo 与 Daily Notes', children: [], parentId: 'n3' }
}

const MOCK_DOCS: TreeDocument[] = [
  { id: 'doc1', title: 'Tree-Fusion 架构笔记', userId: 'u1', emoji: '🏗️', isArchived: false, nodes: MOCK_NODES, rootNodeId: 'root', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'doc2', title: '每周复盘模板', userId: 'u1', emoji: '📅', isArchived: false, nodes: { 'root': { id: 'root', docId: 'doc2', content: '', isRoot: true, children: [] } }, rootNodeId: 'root', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'doc3', title: 'React 性能优化指南', userId: 'u1', emoji: '⚡', isArchived: false, nodes: { 'root': { id: 'root', docId: 'doc3', content: '', isRoot: true, children: [] } }, rootNodeId: 'root', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
]

export const useTreeStore = create<TreeState>((set) => ({
  documents: MOCK_DOCS,
  activeDoc: MOCK_DOCS[0],
  isLoading: false,

  setDocuments: (documents) => set({ documents }),
  setActiveDoc: (activeDoc) => set({ activeDoc }),

  updateNode: (docId, nodeId, updates) => set((state) => {
    if (!state.activeDoc || state.activeDoc.id !== docId) return state
    
    const nodes = { ...state.activeDoc.nodes }
    if (!nodes[nodeId]) return state
    
    nodes[nodeId] = { ...nodes[nodeId], ...updates }
    
    return { 
      activeDoc: { ...state.activeDoc, nodes } 
    }
  }),

  addNode: (docId, parentId, afterNodeId) => set((state) => {
    if (!state.activeDoc || state.activeDoc.id !== docId || !parentId) return state
    
    let updatedNodes = { ...state.activeDoc.nodes }
    const parent = updatedNodes[parentId]
    if (!parent) return state

    const newNodeId = 'n_' + Date.now()
    const newNode: OutlineNode = {
      id: newNodeId,
      docId,
      parentId,
      content: '',
      level: parent.level ? parent.level + 1 : 1,
      children: []
    }

    updatedNodes[newNodeId] = newNode

    // Insert into parent's children array
    const newChildren = [...parent.children]
    if (afterNodeId) {
      const idx = newChildren.indexOf(afterNodeId)
      if (idx !== -1) {
        newChildren.splice(idx + 1, 0, newNodeId)
      } else {
        newChildren.push(newNodeId) // fallback
      }
    } else {
      newChildren.unshift(newNodeId)
    }

    updatedNodes[parentId] = { ...parent, children: newChildren }

    const newActiveDoc = { ...state.activeDoc, nodes: updatedNodes }
    return { 
      activeDoc: newActiveDoc,
      documents: state.documents.map(d => d.id === docId ? newActiveDoc : d)
    }
  }),

  deleteNode: (docId, nodeId) => set((state) => {
    if (!state.activeDoc || state.activeDoc.id !== docId || nodeId === 'root') return state
    
    let updatedNodes = { ...state.activeDoc.nodes }
    const nodeToDelete = updatedNodes[nodeId]
    if (!nodeToDelete) return state

    // 1. Remove from parent's children array
    if (nodeToDelete.parentId && updatedNodes[nodeToDelete.parentId]) {
      const parent = updatedNodes[nodeToDelete.parentId]
      updatedNodes[nodeToDelete.parentId] = {
        ...parent,
        children: parent.children.filter(id => id !== nodeId)
      }
    }

    // 2. Recursively delete self and all children
    const deleteRecursively = (id: string) => {
      const node = updatedNodes[id]
      if (node && node.children) {
        node.children.forEach(deleteRecursively)
      }
      delete updatedNodes[id]
    }
    
    deleteRecursively(nodeId)

    const newActiveDoc = { ...state.activeDoc, nodes: updatedNodes }
    return { 
      activeDoc: newActiveDoc,
      documents: state.documents.map(d => d.id === docId ? newActiveDoc : d)
    }
  }),

  addDocument: (title: string) => set((state) => {
    const newDocId = 'doc_' + Date.now()
    const newDoc: TreeDocument = {
      id: newDocId,
      userId: 'u1',
      title,
      icon: '📄',
      isArchived: false,
      nodes: {
        'root': { id: 'root', docId: newDocId, content: '', isRoot: true, children: [] }
      },
      rootNodeId: 'root',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return {
      documents: [newDoc, ...state.documents],
      activeDoc: newDoc
    }
  }),

  renameDocument: (id: string, newTitle: string) => set((state) => {
    const updatedDocs = state.documents.map(d => d.id === id ? { ...d, title: newTitle } : d)
    return {
      documents: updatedDocs,
      activeDoc: state.activeDoc?.id === id ? { ...state.activeDoc, title: newTitle } : state.activeDoc
    }
  }),

  deleteDocument: (id: string) => set((state) => {
    const filteredDocs = state.documents.filter(d => d.id !== id)
    return {
      documents: filteredDocs,
      activeDoc: state.activeDoc?.id === id ? filteredDocs.find(d => !d.deletedAt) || null : state.activeDoc
    }
  }),

  moveToTrash: (id: string) => set((state) => {
    const updatedDocs = state.documents.map(d => d.id === id ? { ...d, deletedAt: new Date().toISOString() } : d)
    return {
      documents: updatedDocs,
      activeDoc: state.activeDoc?.id === id ? updatedDocs.find(d => !d.deletedAt) || null : state.activeDoc
    }
  }),

  restoreDocument: (id: string) => set((state) => {
    const updatedDocs = state.documents.map(d => d.id === id ? { ...d, deletedAt: null } : d)
    return {
      documents: updatedDocs
    }
  }),

  emptyTrash: () => set((state) => ({
    documents: state.documents.filter(d => !d.deletedAt)
  })),

  indentNode: (docId, nodeId, direction) => set((state) => {
    if (!state.activeDoc || state.activeDoc.id !== docId || nodeId === 'root') return state
    
    let nodes = { ...state.activeDoc.nodes }
    const node = { ...nodes[nodeId] }
    if (!node.parentId || !nodes[node.parentId]) return state
    
    const parent = { ...nodes[node.parentId] }
    const idx = parent.children.indexOf(nodeId)
    
    if (direction === 'in') {
      // Must have a previous sibling to indent under
      if (idx > 0) {
        const prevSiblingId = parent.children[idx - 1]
        const prevSibling = { ...nodes[prevSiblingId] }
        
        // Remove from parent
        parent.children = parent.children.filter(id => id !== nodeId)
        
        // Add to prevSibling
        prevSibling.children = [...prevSibling.children, nodeId]
        
        // Update node
        node.parentId = prevSiblingId
        // Update new parent expanded state to show the newly added child
        prevSibling.isExpanded = true
        
        nodes[parent.id] = parent
        nodes[prevSibling.id] = prevSibling
        nodes[node.id] = node
      }
    } else if (direction === 'out') {
      // Must not be a top-level node (child of root)
      if (parent.id !== 'root' && parent.parentId) {
        const grandParent = { ...nodes[parent.parentId] }
        
        // Remove from parent
        parent.children = parent.children.filter(id => id !== nodeId)
        
        // Add to grandParent after parent
        const parentIdx = grandParent.children.indexOf(parent.id)
        const newChildren = [...grandParent.children]
        newChildren.splice(parentIdx + 1, 0, nodeId)
        grandParent.children = newChildren
        
        // Update node
        node.parentId = grandParent.id
        
        nodes[parent.id] = parent
        nodes[grandParent.id] = grandParent
        nodes[node.id] = node
      }
    }
    
    return {
      activeDoc: { ...state.activeDoc, nodes }
    }
  })
}))

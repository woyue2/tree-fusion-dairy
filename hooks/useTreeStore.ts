import { create } from 'zustand'
import { TreeDocument, OutlineNode } from '@/types'

interface TreeState {
  documents: TreeDocument[]
  activeDoc: TreeDocument | null
  isLoading: boolean
  
  // Actions
  setDocuments: (docs: TreeDocument[]) => void
  setActiveDoc: (doc: TreeDocument | null) => void
  
  updateNode: (docId: string, nodeId: string, updates: Partial<OutlineNode>) => void
  addNode: (docId: string, parentId: string | null, afterNodeId: string) => void
  deleteNode: (docId: string, nodeId: string) => void
  
  indentNode: (docId: string, nodeId: string, direction: 'in' | 'out') => void
}

export const useTreeStore = create<TreeState>((set) => ({
  documents: [],
  activeDoc: null,
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
    // Basic implementation for MVP, in real app needs careful child reordering
    return state
  }),

  deleteNode: (docId, nodeId) => set((state) => {
    return state
  }),

  indentNode: (docId, nodeId, direction) => set((state) => {
    // Logic to change level and parentId
    return state
  })
}))

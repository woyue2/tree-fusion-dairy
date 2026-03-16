/**
 * [INPUT]:    依赖 lib/db (Dexie), app/actions/sync
 * [OUTPUT]:   管理知识树文档列表、节点操作及离线同步变动
 * [POS]:      hooks/useTreeStore.ts - 知识树领域 Logic Center
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StoredOutlineNode, OutlineNode, TreeDocument } from '@/types';
import { db } from '@/lib/db';
import { fetchUserDataAction } from '@/app/actions/sync';

interface TreeStore {
  // Active Document State
  nodes: Record<string, StoredOutlineNode>;
  rootId: string;
  documentId: string;
  title: string;
  focusedNodeId: string | null;
  activeDocId: string | null;
  
  // List State
  documents: TreeDocument[];
  isLoading: boolean;

  // Actions
  setFocusedNodeId: (id: string | null) => void;
  setActiveDoc: (id: string | null) => void;
  setTitle: (title: string) => void;
  updateNodeContent: (id: string, content: string) => void;
  toggleCollapse: (id: string) => void;
  addChildNode: (parentId: string) => string;
  addSiblingNode: (nodeId: string) => string;
  deleteNode: (nodeId: string) => void;
  indentNode: (nodeId: string) => void;
  outdentNode: (nodeId: string) => void;
  
  // Document Management
  renameDocument: (id: string, title: string) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  moveToTrash: (id: string) => Promise<void>;
  restoreDocument: (id: string) => Promise<void>;
  emptyTrash: () => Promise<void>;
  
  // Persistence
  loadDocument: (doc: TreeDocument) => void;
  saveDocument: () => Promise<void>;
  initializeNew: (id?: string) => void;
  loadDocuments: () => Promise<void>;
  pullDocuments: () => Promise<void>;
  setDocuments: (docs: TreeDocument[]) => void;
}

export const useTreeStore = create<TreeStore>()(
  immer((set, get) => ({
    nodes: {},
    rootId: '',
    documentId: '',
    title: '未命名文档',
    focusedNodeId: null,
    activeDocId: null,
    documents: [],
    isLoading: false,

    setFocusedNodeId: (id) => set({ focusedNodeId: id }),

    setActiveDoc: (id) => {
      set(state => {
        state.activeDocId = id;
        if (id) {
          const doc = state.documents.find(d => d.id === id);
          if (doc) {
            const nodesMap: Record<string, StoredOutlineNode> = {};
            const flatten = (node: OutlineNode, parentId: string | null = null) => {
              const { children, ...rest } = node;
              nodesMap[node.id] = { 
                ...rest, 
                children: (children || []).map(c => c.id), 
                parentId 
              } as StoredOutlineNode;
              (children || []).forEach(c => flatten(c, node.id));
            };
            flatten(doc.root);
            state.nodes = nodesMap;
            state.rootId = doc.root.id;
            state.documentId = doc.id;
            state.title = doc.title;
          }
        } else {
          state.documentId = '';
          state.nodes = {};
          state.rootId = '';
        }
      });
    },

    updateNodeContent: (id, content) => {
      set(state => {
        if (state.nodes[id]) {
          state.nodes[id].content = content;
          state.nodes[id].updatedAt = Date.now();
        }
      });
      get().saveDocument();
    },

    toggleCollapse: (id) => {
      set(state => {
        if (state.nodes[id]) {
          state.nodes[id].collapsed = !state.nodes[id].collapsed;
          state.nodes[id].updatedAt = Date.now();
        }
      });
      get().saveDocument();
    },

    addChildNode: (parentId) => {
      const newId = crypto.randomUUID();
      const now = Date.now();
      set(state => {
        const parent = state.nodes[parentId];
        if (!parent) return;
        state.nodes[newId] = {
          id: newId,
          parentId,
          content: '',
          level: (parent.level || 0) + 1,
          children: [],
          images: [],
          collapsed: false,
          createdAt: now,
          updatedAt: now,
        };
        parent.children.push(newId);
        parent.collapsed = false;
        parent.updatedAt = now;
      });
      set({ focusedNodeId: newId });
      get().saveDocument();
      return newId;
    },

    addSiblingNode: (nodeId) => {
      const newId = crypto.randomUUID();
      const now = Date.now();
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent) return;
        
        state.nodes[newId] = {
          id: newId,
          parentId: node.parentId,
          content: '',
          level: (node.level ?? 0),
          children: [],
          images: [],
          collapsed: false,
          createdAt: now,
          updatedAt: now,
        };
        const index = parent.children.indexOf(nodeId);
        parent.children.splice(index + 1, 0, newId);
        parent.updatedAt = now;
      });
      set({ focusedNodeId: newId });
      get().saveDocument();
      return newId;
    },

    setTitle: (title) => {
      set({ title });
      get().saveDocument();
    },

    deleteNode: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (parent) {
          parent.children = parent.children.filter(id => id !== nodeId);
        }
        delete state.nodes[nodeId];
      });
      get().saveDocument();
    },

    indentNode: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        const index = parent.children.indexOf(nodeId);
        if (index <= 0) return;

        const prevSiblingId = parent.children[index - 1];
        const prevSibling = state.nodes[prevSiblingId];
        if (!prevSibling) return;
        
        parent.children.splice(index, 1);
        prevSibling.children.push(nodeId);
        node.parentId = prevSiblingId;
        node.level = (prevSibling.level ?? 0) + 1;
      });
      get().saveDocument();
    },

    outdentNode: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent.parentId) return;

        const grandParent = state.nodes[parent.parentId];
        if (!grandParent) return;
        
        parent.children = parent.children.filter(id => id !== nodeId);
        const parentIndex = grandParent.children.indexOf(parent.id);
        grandParent.children.splice(parentIndex + 1, 0, nodeId);
        node.parentId = grandParent.id;
        node.level = (grandParent.level ?? 0) + 1;
      });
      get().saveDocument();
    },

    renameDocument: async (id, title) => {
      await (db.documents as any).update(id, { title, updatedAt: Date.now(), _dirty: 1 });
      set(state => {
        if (state.documentId === id) state.title = title;
        const idx = state.documents.findIndex(d => d.id === id);
        if (idx !== -1) state.documents[idx].title = title;
      });
    },

    deleteDocument: async (id) => {
      await db.documents.delete(id);
      set(state => {
        if (state.documentId === id) {
          state.documentId = '';
          state.activeDocId = null;
        }
        state.documents = state.documents.filter(d => d.id !== id);
      });
    },

    moveToTrash: async (id) => {
      await (db.documents as any).update(id, { deletedAt: Date.now(), _dirty: 1 });
      await get().loadDocuments();
      if (get().activeDocId === id) get().setActiveDoc(null);
    },

    restoreDocument: async (id) => {
      await (db.documents as any).update(id, { deletedAt: null, _dirty: 1 });
      await get().loadDocuments();
    },

    emptyTrash: async () => {
      const trash = await db.documents.filter(d => !!d.deletedAt).toArray();
      for (const doc of trash) {
        await db.documents.delete(doc.id);
      }
      await get().loadDocuments();
    },

    loadDocument: (doc) => {
      const nodesMap: Record<string, StoredOutlineNode> = {};
      const flatten = (node: OutlineNode, parentId: string | null = null) => {
        const { children, ...rest } = node;
        nodesMap[node.id] = { 
          ...rest, 
          children: (children || []).map(c => c.id), 
          parentId 
        } as StoredOutlineNode;
        (children || []).forEach(c => flatten(c, node.id));
      };
      flatten(doc.root);
      set({ nodes: nodesMap, rootId: doc.root.id, documentId: doc.id, title: doc.title, activeDocId: doc.id });
    },

    saveDocument: async () => {
      const state = get();
      if (!state.documentId) return;

      const buildTree = (id: string): OutlineNode => {
        const node = state.nodes[id];
        if (!node) throw new Error(`Node ${id} not found`);
        const { children, ...rest } = node;
        return {
          ...rest,
          children: (children || []).map(buildTree)
        } as OutlineNode;
      };

      try {
        const root = buildTree(state.rootId);
        const docRecord: TreeDocument = {
          id: state.documentId,
          userId: 'user-1',
          title: state.title,
          root,
          metadata: { 
            createdAt: Date.now(), 
            updatedAt: Date.now(), 
            version: '1.0.0' 
          },
          updatedAt: Date.now(),
          _dirty: 1
        };
        await db.documents.put(docRecord);
        get().loadDocuments();
      } catch (e) {
        console.error('Failed to save tree document:', e);
      }
    },

    initializeNew: (id) => {
      const rootId = crypto.randomUUID();
      const docId = id || crypto.randomUUID();
      const now = Date.now();
      const rootNode: StoredOutlineNode = {
        id: rootId,
        parentId: null,
        content: '新文档',
        level: 0,
        children: [],
        images: [],
        collapsed: false,
        createdAt: now,
        updatedAt: now,
      };
      
      const newDoc: TreeDocument = {
        id: docId,
        userId: 'default-user',
        title: '新文档',
        root: {
          id: rootId,
          parentId: null,
          content: '新文档',
          level: 0,
          children: [],
          images: [],
          collapsed: false,
          createdAt: now,
          updatedAt: now
        },
        metadata: { createdAt: now, updatedAt: now, version: '1.0.0' },
        updatedAt: now,
        _dirty: 1
      };

      set(state => {
        state.nodes = { [rootId]: rootNode };
        state.rootId = rootId;
        state.documentId = docId;
        state.title = '新文档';
        state.focusedNodeId = rootId;
        state.activeDocId = docId;
        state.documents.unshift(newDoc);
      });
      
      db.documents.put(newDoc);
    },

    loadDocuments: async () => {
      set(state => { state.isLoading = true; });
      const docs = await db.documents.where('userId').equals('default-user').and(d => !d.deletedAt).toArray();
      set(state => {
        state.documents = docs as any;
        state.isLoading = false;
        // If nothing active, select first
        if (!state.activeDocId && docs.length > 0) {
          // We can't call setActiveDoc here easily in immer, will handle in component or via get()
        }
      });
      // Handle auto-select outside immer if needed
      if (!get().activeDocId && docs.length > 0) {
        get().setActiveDoc(docs[0].id);
      }
    },

    pullDocuments: async () => {
      set(state => { state.isLoading = true; });
      try {
        const { documents } = await fetchUserDataAction('default-user');
        if (documents && documents.length > 0) {
          const localFormatDocs = documents.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            title: d.title,
            icon: d.icon,
            root: d.root || d.nodes,
            metadata: d.metadata,
            updatedAt: new Date(d.updated_at || Date.now()).getTime(),
            _dirty: 0
          }));
          await db.documents.bulkPut(localFormatDocs);
          await get().loadDocuments();
        }
      } catch (err) {
        console.error('[TreeStore] Pull failed:', err);
      } finally {
        set(state => { state.isLoading = false; });
      }
    },

    setDocuments: (documents) => set(state => { state.documents = documents; })
  }))
);

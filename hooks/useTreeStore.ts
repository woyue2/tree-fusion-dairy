/**
 * [INPUT]:    依赖 lib/db (Dexie), app/actions/sync
 * [OUTPUT]:   管理知识树文档列表、节点操作、历史栈及离线同步变动
 * [POS]:      hooks/useTreeStore.ts - 知识树领域 Logic Center
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { StoredOutlineNode, OutlineNode, TreeDocument } from '@/types';
import { db } from '@/lib/db';
import { fetchUserDataAction } from '@/app/actions/sync';
import { toast } from 'sonner';

const MAX_HISTORY = 30;

interface HistorySnapshot {
  nodes: Record<string, StoredOutlineNode>;
  rootId: string;
  title: string;
}

interface TreeStore {
  // Active Document State
  nodes: Record<string, StoredOutlineNode>;
  rootId: string;
  documentId: string;
  title: string;
  focusedNodeId: string | null;
  activeDocId: string | null;

  // History
  history: {
    past: HistorySnapshot[];
    present: HistorySnapshot | null;
    future: HistorySnapshot[];
  };
  canUndo: boolean;
  canRedo: boolean;

  // List State
  documents: TreeDocument[];
  isLoading: boolean;

  // Toolbar UI State
  activeToolbarNodeId: string | null;
  activeFormatToolbarNodeId: string | null;

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
  moveNodeUp: (nodeId: string) => void;
  moveNodeDown: (nodeId: string) => void;
  moveNode: (activeId: string, overId: string, type: 'before' | 'after' | 'inside') => void;

  // Toolbar
  setActiveToolbarNodeId: (nodeId: string | null) => void;
  setActiveFormatToolbarNodeId: (nodeId: string | null) => void;

  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;

  // Document Management
  updateDocument: (id: string, updates: Partial<TreeDocument>) => Promise<void>;
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
    activeToolbarNodeId: null,
    activeFormatToolbarNodeId: null,
    history: { past: [], present: null, future: [] },
    canUndo: false,
    canRedo: false,

    setFocusedNodeId: (id) => set({ focusedNodeId: id }),

    setActiveToolbarNodeId: (nodeId) => set({ activeToolbarNodeId: nodeId }),
    setActiveFormatToolbarNodeId: (nodeId) => set({ activeFormatToolbarNodeId: nodeId }),

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
            state.history = {
              past: [],
              present: {
                nodes: JSON.parse(JSON.stringify(nodesMap)),
                rootId: doc.root.id,
                title: doc.title,
              },
              future: [],
            };
            state.canUndo = false;
            state.canRedo = false;
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
      setTimeout(() => get().pushHistory(), 0);
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
          level: node.level ?? 0,
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
      setTimeout(() => get().pushHistory(), 0);
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
        const deleteRecursive = (id: string) => {
          const n = state.nodes[id];
          if (!n) return;
          n.children.forEach(childId => deleteRecursive(childId));
          delete state.nodes[id];
        };
        deleteRecursive(nodeId);
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    indentNode: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent) return;
        const index = parent.children.indexOf(nodeId);
        if (index <= 0) return;

        const prevSiblingId = parent.children[index - 1];
        const prevSibling = state.nodes[prevSiblingId];
        if (!prevSibling) return;

        parent.children.splice(index, 1);
        prevSibling.children.push(nodeId);
        node.parentId = prevSiblingId;

        const updateLevel = (id: string, newLevel: number) => {
          const n = state.nodes[id];
          if (!n) return;
          n.level = newLevel;
          n.children.forEach(childId => updateLevel(childId, newLevel + 1));
        };
        updateLevel(nodeId, prevSibling.level + 1);
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    outdentNode: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent || !parent.parentId) return;

        const grandParent = state.nodes[parent.parentId];
        if (!grandParent) return;

        parent.children = parent.children.filter(id => id !== nodeId);
        const parentIndex = grandParent.children.indexOf(parent.id);
        grandParent.children.splice(parentIndex + 1, 0, nodeId);
        node.parentId = parent.parentId;

        const updateLevel = (id: string, newLevel: number) => {
          const n = state.nodes[id];
          if (!n) return;
          n.level = newLevel;
          n.children.forEach(childId => updateLevel(childId, newLevel + 1));
        };
        updateLevel(nodeId, parent.level);
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    moveNodeUp: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent) return;
        const index = parent.children.indexOf(nodeId);
        if (index <= 0) return;
        [parent.children[index - 1], parent.children[index]] =
          [parent.children[index], parent.children[index - 1]];
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    moveNodeDown: (nodeId) => {
      set(state => {
        const node = state.nodes[nodeId];
        if (!node || !node.parentId) return;
        const parent = state.nodes[node.parentId];
        if (!parent) return;
        const index = parent.children.indexOf(nodeId);
        if (index >= parent.children.length - 1) return;
        [parent.children[index + 1], parent.children[index]] =
          [parent.children[index], parent.children[index + 1]];
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    moveNode: (activeId, overId, type) => {
      set(state => {
        const activeNode = state.nodes[activeId];
        const overNode = state.nodes[overId];
        if (!activeNode || !overNode) return;
        const oldParentId = activeNode.parentId;
        if (!oldParentId) return;

        const oldParent = state.nodes[oldParentId];
        oldParent.children = oldParent.children.filter(id => id !== activeId);

        const updateLevel = (id: string, level: number) => {
          const node = state.nodes[id];
          if (!node) return;
          node.level = level;
          node.children.forEach(childId => updateLevel(childId, level + 1));
        };

        if (type === 'inside') {
          state.nodes[overId].children.unshift(activeId);
          state.nodes[activeId].parentId = overId;
          updateLevel(activeId, overNode.level + 1);
          state.nodes[overId].collapsed = false;
        } else {
          const overParentId = overNode.parentId;
          if (!overParentId) return;
          const overParent = state.nodes[overParentId];
          const overIndex = overParent.children.indexOf(overId);
          const insertIndex = type === 'after' ? overIndex + 1 : overIndex;
          overParent.children.splice(insertIndex, 0, activeId);
          state.nodes[activeId].parentId = overParentId;
          updateLevel(activeId, overNode.level);
        }
      });
      setTimeout(() => get().pushHistory(), 0);
      get().saveDocument();
    },

    pushHistory: () => {
      set(state => {
        const snapshot: HistorySnapshot = {
          nodes: JSON.parse(JSON.stringify(state.nodes)),
          rootId: state.rootId,
          title: state.title,
        };

        if (!state.history.present) {
          state.history.present = snapshot;
          state.canUndo = false;
          state.canRedo = false;
          return;
        }

        const currentStr = JSON.stringify(snapshot);
        const presentStr = JSON.stringify(state.history.present);
        if (currentStr === presentStr) return;

        state.history.past.push(state.history.present);
        if (state.history.past.length > MAX_HISTORY) {
          state.history.past.shift();
        }
        state.history.present = snapshot;
        state.history.future = [];
        state.canUndo = state.history.past.length > 0;
        state.canRedo = false;
      });
    },

    undo: () => {
      const { history } = get();
      const { past, present, future } = history;
      if (past.length === 0 || !present) {
        toast.info('没有可撤销的操作');
        return;
      }
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      set({
        history: { past: newPast, present: previous, future: [present, ...future] },
        nodes: previous.nodes,
        rootId: previous.rootId,
        title: previous.title,
        canUndo: newPast.length > 0,
        canRedo: true,
      });
      get().saveDocument();
    },

    redo: () => {
      const { history } = get();
      const { past, present, future } = history;
      if (future.length === 0) {
        toast.info('没有可重做的操作');
        return;
      }
      const next = future[0];
      const newFuture = future.slice(1);
      set({
        history: { past: [...past, present!], present: next, future: newFuture },
        nodes: next.nodes,
        rootId: next.rootId,
        title: next.title,
        canUndo: true,
        canRedo: newFuture.length > 0,
      });
      get().saveDocument();
    },

    updateDocument: async (id, updates) => {
      await (db.documents as any).update(id, { ...updates, updatedAt: Date.now(), _dirty: 1 });
      set(state => {
        if (state.documentId === id && updates.title) state.title = updates.title;
        const idx = state.documents.findIndex(d => d.id === id);
        if (idx !== -1) {
          state.documents[idx] = { ...state.documents[idx], ...updates };
        }
      });
    },

    renameDocument: async (id, title) => {
      await get().updateDocument(id, { title });
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
      set({
        nodes: nodesMap,
        rootId: doc.root.id,
        documentId: doc.id,
        title: doc.title,
        activeDocId: doc.id,
        history: {
          past: [],
          present: { nodes: JSON.parse(JSON.stringify(nodesMap)), rootId: doc.root.id, title: doc.title },
          future: [],
        },
        canUndo: false,
        canRedo: false,
      });
    },

    saveDocument: async () => {
      const state = get();
      if (!state.documentId) return;

      const buildTree = (id: string): OutlineNode => {
        const node = state.nodes[id];
        if (!node) throw new Error(`Node ${id} not found`);
        const { children, ...rest } = node;
        return { ...rest, children: (children || []).map(buildTree) } as OutlineNode;
      };

      try {
        const root = buildTree(state.rootId);
        const docRecord: TreeDocument = {
          id: state.documentId,
          userId: 'default-user',
          title: state.title,
          root,
          metadata: { createdAt: Date.now(), updatedAt: Date.now(), version: '1.0.0' },
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
      const firstChildId = crypto.randomUUID();
      const docId = id || crypto.randomUUID();
      const now = Date.now();
      const firstChild: StoredOutlineNode = {
        id: firstChildId,
        parentId: rootId,
        content: '',
        level: 1,
        children: [],
        images: [],
        collapsed: false,
        createdAt: now,
        updatedAt: now,
      };
      const rootNode: StoredOutlineNode = {
        id: rootId,
        parentId: null,
        content: '新文档',
        level: 0,
        children: [firstChildId],
        images: [],
        collapsed: false,
        createdAt: now,
        updatedAt: now,
      };
      const newDoc: TreeDocument = {
        id: docId,
        userId: 'default-user',
        title: '新文档',
        root: { ...rootNode, children: [{ ...firstChild, children: [] } as any] },
        metadata: { createdAt: now, updatedAt: now, version: '1.0.0' },
        updatedAt: now,
        _dirty: 1
      };
      set(state => {
        state.nodes = { [rootId]: rootNode, [firstChildId]: firstChild };
        state.rootId = rootId;
        state.documentId = docId;
        state.title = '新文档';
        state.focusedNodeId = firstChildId;
        state.activeDocId = docId;
        state.documents.unshift(newDoc);
        state.history = {
          past: [],
          present: { nodes: { [rootId]: JSON.parse(JSON.stringify(rootNode)), [firstChildId]: JSON.parse(JSON.stringify(firstChild)) }, rootId, title: '新文档' },
          future: [],
        };
        state.canUndo = false;
        state.canRedo = false;
      });
      db.documents.put(newDoc);
    },

    loadDocuments: async () => {
      set(state => { state.isLoading = true; });
      const docs = await db.documents.where('userId').equals('default-user').and(d => !d.deletedAt).toArray();
      set(state => {
        state.documents = docs as any;
        state.isLoading = false;
      });
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
/**
 * [INPUT]:    None
 * [OUTPUT]:   Client-side Knowledge Tree Container
 * [POS]:      components/tree/TreeContainer.tsx
 * [PROTOCOL]: Initializes useTreeStore if empty.
 */

'use client';

import React, { useEffect } from 'react';
import { OutlineTree } from '@/components/tree/OutlineTree';
import TreeSidebar from '@/components/tree/TreeSidebar';
import { useTreeStore } from '@/hooks/useTreeStore';

export default function TreeContainer() {
  const { initializeNew, rootId, documents, activeDocId, setActiveDoc } = useTreeStore();

  useEffect(() => {
    if (documents.length === 0) {
      // initializeNew(); // Don't auto-initialize if we want it clean
    }
  }, [documents.length, initializeNew]);

  const activeDoc = documents.find((d: any) => d.id === activeDocId);

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Column 1 & 2: Sidebar + Doc List */}
      <TreeSidebar 
        documents={documents} 
        activeDocId={activeDocId || undefined} 
        onSelectDoc={setActiveDoc}
        onNewDoc={() => {
          const id = crypto.randomUUID();
          useTreeStore.getState().initializeNew(id);
        }}
      />

      {/* Column 3: Main Editor Area */}
      <div className="tree-main">
        {activeDoc ? (
          <>
            <div className="tree-toolbar">
              <div className="tree-doc-title-label" id="tree-doc-title">{activeDoc.title}</div>
              <span className="tree-help">Tab缩进 · Shift+Tab反缩进 · Enter换行</span>
              <button 
                className="tree-btn" 
                onClick={() => {
                  // Undo functionality should be implemented in store
                }}
              >↩ 撤销</button>
              <button className="tree-btn primary">保存</button>
            </div>
            <div className="outline-area">
              <OutlineTree />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-4">
            <div className="text-6xl">🌳</div>
            <p>请选择或创建一个文档开始记录</p>
            <button 
              className="tree-btn primary"
              onClick={() => {
                const id = crypto.randomUUID();
                useTreeStore.getState().initializeNew(id);
              }}
            >
              + 新建文档
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * [INPUT]:    依赖 useTreeStore
 * [OUTPUT]:   Client-side Knowledge Tree Container
 * [POS]:      components/tree/TreeContainer.tsx
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import React, { useEffect } from 'react';
import { OutlineTree } from '@/components/tree/OutlineTree';
import TreeSidebar from '@/components/tree/TreeSidebar';
import { useTreeStore } from '@/hooks/useTreeStore';

export default function TreeContainer() {
  const { documents, activeDocId, setActiveDoc, canUndo, canRedo } = useTreeStore();

  const activeDoc = documents.find((d: any) => d.id === activeDocId);

  return (
    <div className="h-full flex overflow-hidden bg-white">
      {/* Sidebar */}
      <TreeSidebar
        documents={documents}
        activeDocId={activeDocId || undefined}
        onSelectDoc={setActiveDoc}
        onNewDoc={() => {
          const id = crypto.randomUUID();
          useTreeStore.getState().initializeNew(id);
        }}
      />

      {/* Main Editor Area */}
      <div className="tree-main">
        {activeDoc ? (
          <>
            <div className="tree-toolbar">
              <div className="tree-doc-title-label" id="tree-doc-title">{activeDoc.title}</div>
              <span className="tree-help">Tab缩进 · Shift+Tab反缩进 · Enter换行</span>
              <button
                className="tree-btn"
                disabled={!canUndo}
                onClick={() => useTreeStore.getState().undo()}
                title="撤销 (Ctrl+Z)"
              >
                ↩ 撤销
              </button>
              <button
                className="tree-btn"
                disabled={!canRedo}
                onClick={() => useTreeStore.getState().redo()}
                title="重做 (Ctrl+Y)"
              >
                ↪ 重做
              </button>
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

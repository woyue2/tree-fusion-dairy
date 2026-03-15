/**
 * [INPUT]:    useTreeStore (Flattened Nodes)
 * [OUTPUT]:   Knowledge Tree UI
 * [POS]:      components/tree/OutlineTree.tsx - Outliner Root
 * [PROTOCOL]: Ported from tree-index, adapted for Tailwind v4.
 */

'use client';

import React from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { OutlineNodeComponent } from './OutlineNode';

export const OutlineTree: React.FC = () => {
  const { title, rootId, nodes, setTitle } = useTreeStore();

  if (!rootId || !nodes[rootId]) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 italic">
        尚未加载或创建文档...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* Title Header */}
      <div className="px-8 pt-8 pb-4">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="请输入文档标题..."
          className="w-full text-3xl font-bold bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder:text-slate-300 transition-all font-inter"
        />
      </div>

      {/* Nodes Container */}
      <div className="flex-1 overflow-y-auto px-8 py-4 scrollbar-thin">
        <div className="max-w-4xl mx-auto pb-64">
          <OutlineNodeComponent nodeId={rootId} />
        </div>
      </div>
    </div>
  );
};

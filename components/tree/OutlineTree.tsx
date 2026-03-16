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
  const { rootId, nodes } = useTreeStore();

  if (!rootId || !nodes[rootId]) {
    return null;
  }

  return (
    <div className="outline-inner pb-64">
      <OutlineNodeComponent nodeId={rootId} />
    </div>
  );
};

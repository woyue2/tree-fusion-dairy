/**
 * [INPUT]:    None
 * [OUTPUT]:   Client-side Knowledge Tree Container
 * [POS]:      components/tree/TreeContainer.tsx
 * [PROTOCOL]: Initializes useTreeStore if empty.
 */

'use client';

import React, { useEffect } from 'react';
import { OutlineTree } from '@/components/tree/OutlineTree';
import { useTreeStore } from '@/hooks/useTreeStore';

export default function TreeContainer() {
  const { initializeNew, rootId } = useTreeStore();

  useEffect(() => {
    if (!rootId) {
      initializeNew();
    }
  }, [rootId, initializeNew]);

  return (
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-slate-950">
      <OutlineTree />
    </div>
  );
}

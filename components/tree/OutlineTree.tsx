/**
 * [INPUT]:    useTreeStore (Flattened Nodes)
 * [OUTPUT]:   Knowledge Tree UI with DnD
 * [POS]:      components/tree/OutlineTree.tsx - Outliner Root
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import React, { useState } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { OutlineNode } from './OutlineNode';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { createPortal } from 'react-dom';

export const OutlineTree: React.FC = () => {
  const { rootId, nodes, moveNode } = useTreeStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  if (!rootId || !nodes[rootId]) return null;

  const rootNode = nodes[rootId];

  const isDescendant = (ancestorId: string, targetId: string): boolean => {
    const ancestor = nodes[ancestorId];
    if (!ancestor) return false;
    const stack = [...ancestor.children];
    while (stack.length > 0) {
      const currentId = stack.pop()!;
      if (currentId === targetId) return true;
      const current = nodes[currentId];
      if (current?.children?.length) stack.push(...current.children);
    }
    return false;
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id) return;

    const activeNodeId = active.id as string;
    const overNodeId = over.id as string;

    // Prevent dropping into own descendant
    if (isDescendant(activeNodeId, overNodeId)) return;

    moveNode(activeNodeId, overNodeId, 'after');
  };

  return (
    <div className="outline-inner pb-64">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={rootNode.children} strategy={verticalListSortingStrategy}>
          {rootNode.children.map(childId => (
            <OutlineNode key={childId} nodeId={childId} depth={0} />
          ))}
        </SortableContext>

        {typeof document !== 'undefined' && createPortal(
          <DragOverlay>
            {activeId ? (
              <div className="opacity-90 bg-white border border-slate-200 shadow-xl rounded px-3 py-2 pointer-events-none">
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <span>•</span>
                  <span className="truncate max-w-[240px]">
                    {nodes[activeId]?.content || 'Dragging...'}
                  </span>
                </div>
              </div>
            ) : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};

/**
 * [INPUT]:    nodeId, useTreeStore actions
 * [OUTPUT]:   Interactive Outliner Node with DnD, keyboard, formatting
 * [POS]:      components/tree/OutlineNode.tsx - Outliner Node
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { useUnifiedToolbar } from '@/hooks/useUnifiedToolbar';
import { useNodeFormatting } from '@/hooks/useNodeFormatting';
import { UnifiedToolbar } from './UnifiedToolbar';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import {
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Bold,
  Italic,
  Underline,
  Highlighter,
} from 'lucide-react';

interface OutlineNodeProps {
  nodeId: string;
  depth: number;
}

export const OutlineNode = memo(function OutlineNode({ nodeId, depth }: OutlineNodeProps) {
  const node = useTreeStore(s => s.nodes[nodeId]);
  const focusedNodeId = useTreeStore(s => s.focusedNodeId);
  const updateContent = useTreeStore(s => s.updateNodeContent);
  const toggleCollapse = useTreeStore(s => s.toggleCollapse);
  const addChildNode = useTreeStore(s => s.addChildNode);
  const addSiblingNode = useTreeStore(s => s.addSiblingNode);
  const deleteNode = useTreeStore(s => s.deleteNode);
  const indentNode = useTreeStore(s => s.indentNode);
  const outdentNode = useTreeStore(s => s.outdentNode);
  const moveNodeUp = useTreeStore(s => s.moveNodeUp);
  const moveNodeDown = useTreeStore(s => s.moveNodeDown);
  const setFocusedNodeId = useTreeStore(s => s.setFocusedNodeId);

  const inputRef = useRef<HTMLInputElement>(null);
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toolbar = useUnifiedToolbar(nodeId);
  const formatting = useNodeFormatting(nodeId);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: nodeId });

  const setRefs = useCallback((el: HTMLDivElement | null) => {
    setNodeRef(el);
    (nodeRef as React.MutableRefObject<HTMLDivElement | null>).current = el;
  }, [setNodeRef]);

  useEffect(() => {
    if (focusedNodeId === nodeId && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      const len = inputRef.current.value.length;
      inputRef.current.setSelectionRange(len, len);
    }
  }, [focusedNodeId, nodeId]);

  if (!node) return null;

  const isCollapsed = node.collapsed;
  const hasChildren = node.children.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey || e.shiftKey) {
        addChildNode(nodeId);
      } else {
        addSiblingNode(nodeId);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (e.shiftKey) {
        outdentNode(nodeId);
      } else {
        indentNode(nodeId);
      }
    } else if (e.key === 'Backspace' && node.content === '' && node.parentId) {
      e.preventDefault();
      deleteNode(nodeId);
    }
  };

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    hoverTimeoutRef.current = setTimeout(() => {
      toolbar.showOperationToolbar(e.clientX, e.clientY);
    }, 300);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    toolbar.updatePosition(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    toolbar.delayedHide(400);
  };

  const handleSelect = () => {
    if (!inputRef.current) return;
    const start = inputRef.current.selectionStart || 0;
    const end = inputRef.current.selectionEnd || 0;
    if (start !== end) {
      formatting.storeSelection(inputRef.current);
      const rect = inputRef.current.getBoundingClientRect();
      toolbar.showFormatToolbar(rect.left + ((start + end) / 2) * 7, rect.bottom);
    }
  };

  return (
    <div ref={setRefs} style={style} className="flex flex-col w-full">
      <div
        className="node-row group"
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Drag handle */}
        <span
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-slate-300 hover:text-slate-500 px-0.5 opacity-0 group-hover:opacity-100 select-none"
          title="拖拽排序"
        >
          ⠿
        </span>

        {/* Toggle / Bullet */}
        <div
          className={`node-toggle ${hasChildren ? (isCollapsed ? '' : 'open') : 'empty'}`}
          onClick={() => hasChildren && toggleCollapse(nodeId)}
        >
          {hasChildren ? (
            isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />
          ) : (
            <span className="w-3.5 h-3.5 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            </span>
          )}
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={node.content}
          onChange={e => updateContent(nodeId, e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocusedNodeId(nodeId)}
          onSelect={handleSelect}
          className={`node-text ${
            node.level === 0 ? 'font-semibold text-base' :
            node.level === 1 ? 'font-medium' : ''
          }`}
          placeholder={node.level === 0 ? '文档根节点...' : '输入内容...'}
        />

        {/* Action Buttons */}
        <div className="node-actions">
          <button
            className="p-1 hover:text-blue-500"
            onClick={() => addChildNode(nodeId)}
            title="添加子节点"
          >
            <Plus size={12} />
          </button>
          {node.parentId && (
            <button
              className="p-1 hover:text-red-500"
              onClick={() => deleteNode(nodeId)}
              title="删除"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Operation Toolbar */}
      {toolbar.toolbarType === 'operation' && (
        <UnifiedToolbar
          type="operation"
          position={toolbar.position}
          onMouseEnter={toolbar.cancelHide}
          onMouseLeave={() => toolbar.delayedHide(300)}
        >
          <button
            onClick={() => addChildNode(nodeId)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-xs"
            title="添加子节点"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => moveNodeUp(nodeId)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="上移"
          >
            <ChevronUp size={14} />
          </button>
          <button
            onClick={() => moveNodeDown(nodeId)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="下移"
          >
            <ChevronDown size={14} />
          </button>
          {node.parentId && (
            <button
              onClick={() => deleteNode(nodeId)}
              className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
              title="删除"
            >
              <Trash2 size={14} />
            </button>
          )}
        </UnifiedToolbar>
      )}

      {/* Format Toolbar */}
      {toolbar.toolbarType === 'format' && (
        <UnifiedToolbar
          type="format"
          position={toolbar.position}
          onMouseEnter={toolbar.cancelHide}
          onMouseLeave={() => toolbar.delayedHide(300)}
        >
          <button
            onClick={() => formatting.applyFormat('bold')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded font-bold text-sm"
            title="粗体"
          >
            <Bold size={14} />
          </button>
          <button
            onClick={() => formatting.applyFormat('italic')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded italic text-sm"
            title="斜体"
          >
            <Italic size={14} />
          </button>
          <button
            onClick={() => formatting.applyFormat('underline')}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
            title="下划线"
          >
            <Underline size={14} />
          </button>
          <button
            onClick={() => formatting.applyFormat('highlight')}
            className="p-1.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 rounded text-yellow-600"
            title="荧光笔"
          >
            <Highlighter size={14} />
          </button>
        </UnifiedToolbar>
      )}

      {/* Children */}
      {!isCollapsed && hasChildren && (
        <div className="node-children">
          <SortableContext items={node.children} strategy={verticalListSortingStrategy}>
            {node.children.map(childId => (
              <OutlineNode key={childId} nodeId={childId} depth={depth + 1} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
});

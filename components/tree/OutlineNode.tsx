/**
 * [INPUT]:    nodeId, useTreeStore actions
 * [OUTPUT]:   Interactive Outliner Node
 * [POS]:      components/tree/OutlineNode.tsx - Outliner Node
 * [PROTOCOL]: Handles indent, Enter, Tab, and child recursion.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { ChevronRight, ChevronDown, ListCheck } from 'lucide-react';

interface Props {
  nodeId: string;
}

export const OutlineNodeComponent: React.FC<Props> = ({ nodeId }) => {
  const node = useTreeStore((s) => s.nodes[nodeId]);
  const focusedNodeId = useTreeStore((s) => s.focusedNodeId);
  const { 
    updateNodeContent, 
    toggleCollapse, 
    addChildNode, 
    addSiblingNode, 
    deleteNode, 
    indentNode, 
    outdentNode,
    setFocusedNodeId 
  } = useTreeStore();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (focusedNodeId === nodeId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [focusedNodeId, nodeId]);

  if (!node) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.ctrlKey) {
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

  return (
    <div className="group flex flex-col w-full animate-in fade-in slide-in-from-left-2 duration-300">
      <div className="flex items-center w-full py-1 hover:bg-slate-100 dark:hover:bg-slate-800/50 rounded transition-colors group">
        {/* Indent Spacer */}
        <div style={{ width: `${node.level * 24}px` }} className="flex-shrink-0" />

        {/* Bullet & Collapse */}
        <div className="flex items-center justify-center w-6 h-6 mr-1 flex-shrink-0 cursor-pointer text-slate-400 hover:text-blue-500 transition-all">
          {node.children.length > 0 ? (
            <div onClick={() => toggleCollapse(nodeId)}>
              {node.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </div>
          ) : (
            <div className="w-1.5 h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full group-hover:bg-blue-400 group-hover:scale-125 transition-all" />
          )}
        </div>

        {/* Content Input */}
        <input
          ref={inputRef}
          type="text"
          value={node.content}
          onChange={(e) => updateNodeContent(nodeId, e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocusedNodeId(nodeId)}
          className={`flex-1 bg-transparent border-none outline-none py-1 text-slate-700 dark:text-slate-200 placeholder:text-slate-300 transition-all font-inter ${
            node.content === '' ? 'placeholder:opacity-50' : ''
          }`}
          placeholder="输入内容..."
        />
      </div>

      {/* Children Recursion */}
      {!node.collapsed && node.children.length > 0 && (
        <div className="flex flex-col">
          {node.children.map((childId) => (
            <OutlineNodeComponent key={childId} nodeId={childId} />
          ))}
        </div>
      )}
    </div>
  );
};

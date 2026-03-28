/**
 * [INPUT]:    nodeId, useTreeStore actions
 * [OUTPUT]:   Interactive Outliner Node
 * [POS]:      components/tree/OutlineNode.tsx - Outliner Node
 * [PROTOCOL]: Handles indent, Enter, Tab, and child recursion.
 */

'use client';

import React, { useEffect, useRef } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { ChevronRight, ChevronDown, ListCheck, Plus, Trash2 } from 'lucide-react';

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

  return (
    <div className="flex flex-col w-full">
      <div className="node-row group">
        {/* Toggle / Bullets */}
        <div 
          className={`node-toggle ${node.children.length === 0 ? 'empty' : (node.collapsed ? '' : 'open')}`}
          onClick={() => node.children.length > 0 && toggleCollapse(nodeId)}
        >
          {node.children.length > 0 && <ChevronRight size={10} />}
        </div>
        
        <div className="node-bullet" />

        {/* Content Input */}
        <input
          ref={inputRef}
          type="text"
          value={node.content}
          onChange={(e) => updateNodeContent(nodeId, e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocusedNodeId(nodeId)}
          className={`node-text ${node.level === 1 ? 'h1' : node.level === 2 ? 'h2' : ''}`}
          placeholder={node.level === 0 ? "文档根节点..." : "输入内容..."}
        />

        {/* Action Buttons */}
        <div className="node-actions">
          <button className="p-1 hover:text-green-600" onClick={() => addChildNode(nodeId)} title="添加子节点">
            <Plus size={12} />
          </button>
          {node.parentId && (
            <button className="p-1 hover:text-red-500" onClick={() => deleteNode(nodeId)} title="删除">
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Children Recursion with Vertical Line Styling */}
      {!node.collapsed && node.children.length > 0 && (
        <div className="node-children">
          {node.children.map((childId) => (
            <OutlineNodeComponent key={childId} nodeId={childId} />
          ))}
        </div>
      )}
    </div>
  );
};

'use client'

import React, { useState } from 'react'
import { OutlineNode } from '@/types'

interface TreeNodeProps {
  nodeId: string
  nodes: Record<string, OutlineNode>
  onUpdate: (id: string, content: string) => void
}

export default function TreeNode({ nodeId, nodes, onUpdate }: TreeNodeProps) {
  const node = nodes[nodeId]
  const [collapsed, setCollapsed] = useState(node.collapsed || false)

  if (!node) return null

  const hasChildren = node.children && node.children.length > 0
  
  return (
    <div className="outline-node">
      <div className="node-row">
        <div 
          className={`node-toggle ${collapsed ? '' : 'open'} ${hasChildren ? '' : 'empty'}`}
          onClick={() => hasChildren && setCollapsed(!collapsed)}
        >
          {hasChildren ? '▶' : ''}
        </div>
        <div className="node-bullet"></div>
        <div 
          className={`node-text ${node.level === 1 ? 'h1' : ''} ${node.level === 2 ? 'h2' : ''}`}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(node.id, e.currentTarget.textContent || '')}
        >
          {node.content}
        </div>
        <div className="node-actions">
          <button className="node-act-btn">＋</button>
          <button className="node-act-btn">⋮</button>
        </div>
      </div>

      {!collapsed && hasChildren && (
        <div className="node-children">
          {node.children.map((childId: string) => (
            <TreeNode 
              key={childId}
              nodeId={childId}
              nodes={nodes}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  )
}

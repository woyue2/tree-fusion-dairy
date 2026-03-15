// INPUT: nodeId, nodes, updates
// OUTPUT: 渲染大纲树单个节点
// POS: components/tree/TreeNode.tsx - 知识树大纲节点组件
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { OutlineNode } from '@/types'
import { useTreeStore } from '@/hooks/useTreeStore'
import { Bold, Italic, Underline, Link, Code, Type } from 'lucide-react'

// Simple floating formatting toolbar
function FloatingToolbar({ onFormat }: { onFormat: (cmd: string) => void }) {
  const [position, setPosition] = useState<{ x: number, y: number } | null>(null)

  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection()
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        // Check if selection is inside a node-text
        let node = selection.anchorNode
        let isNodeText = false
        while (node && node !== document.body) {
          if (node.nodeType === 1 && (node as Element).classList.contains('node-text')) {
            isNodeText = true
            break
          }
          node = node.parentNode
        }
        
        if (isNodeText) {
          setPosition({ x: rect.left + rect.width / 2, y: rect.top - 40 })
        } else {
          setPosition(null)
        }
      } else {
        setPosition(null)
      }
    }

    document.addEventListener('selectionchange', handleSelection)
    return () => document.removeEventListener('selectionchange', handleSelection)
  }, [])

  if (!position) return null

  return (
    <div 
      className="floating-toolbar" 
      style={{ left: position.x, top: position.y, position: 'fixed', zIndex: 1000, background: '#333', color: '#fff', padding: '4px 8px', borderRadius: '4px', display: 'flex', gap: '8px', transform: 'translateX(-50%)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
      onMouseDown={e => e.preventDefault()} // Prevent losing selection
    >
      <button onClick={() => onFormat('bold')} title="加粗 (Ctrl+B)"><Bold size={14} /></button>
      <button onClick={() => onFormat('italic')} title="斜体 (Ctrl+I)"><Italic size={14} /></button>
      <button onClick={() => onFormat('underline')} title="下划线 (Ctrl+U)"><Underline size={14} /></button>
      <button onClick={() => onFormat('strikeThrough')} title="删除线"><Type size={14} /></button>
      <button onClick={() => onFormat('formatBlock')} title="代码块"><Code size={14} /></button>
    </div>
  )
}

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
  
  const handleFormat = (cmd: string) => {
    if (cmd === 'formatBlock') {
      document.execCommand(cmd, false, 'PRE')
    } else {
      document.execCommand(cmd, false)
    }
  }

  return (
    <div className="outline-node">
      {node.parentId === 'root' && <FloatingToolbar onFormat={handleFormat} />}
      <div className="node-row">
        <div 
          className={`node-toggle ${collapsed ? '' : 'open'} ${hasChildren ? '' : 'empty'}`}
          onClick={() => hasChildren && setCollapsed(!collapsed)}
        >
          {hasChildren ? '▶' : ''}
        </div>
        <div className="node-bullet"></div>
        <div 
          id={`node-input-${node.id}`}
          className={`node-text ${node.level === 1 ? 'h1' : ''} ${node.level === 2 ? 'h2' : ''}`}
          contentEditable
          suppressContentEditableWarning
          onBlur={(e) => onUpdate(node.id, e.currentTarget.textContent || '')}
          onKeyDown={(e) => {
            if (e.key === 'Tab') {
              e.preventDefault()
              // @ts-ignore
              useTreeStore.getState().indentNode(node.docId, node.id, e.shiftKey ? 'out' : 'in')
              setTimeout(() => {
                const el = document.getElementById(`node-input-${node.id}`)
                if (el) { el.focus(); window.getSelection()?.selectAllChildren(el); window.getSelection()?.collapseToEnd() }
              }, 10)
            } else if (e.key === 'Enter') {
              e.preventDefault()
              if (e.ctrlKey || e.metaKey) {
                // Add child
                // @ts-ignore
                useTreeStore.getState().addNode(node.docId, node.id, '')
                setCollapsed(false)
              } else {
                // Add sibling
                // @ts-ignore
                useTreeStore.getState().addNode(node.docId, node.parentId, node.id)
              }
            } else if (e.key === 'Backspace' && e.currentTarget.textContent === '') {
              e.preventDefault()
              // @ts-ignore
              useTreeStore.getState().deleteNode(node.docId, node.id)
            }
          }}
        >
          {node.content}
        </div>
        <div className="node-actions">
          <button className="node-act-btn" onClick={() => {
            // @ts-ignore
            useTreeStore.getState().addNode(node.docId, node.id, '')
            setCollapsed(false)
          }} title="添加子节点">⤵️</button>
          <button className="node-act-btn" onClick={() => {
            // @ts-ignore
            useTreeStore.getState().addNode(node.docId, node.parentId, node.id)
          }} title="添加同级">＋</button>
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

/**
 * [INPUT]:    type, position, children
 * [OUTPUT]:   浮动工具栏 UI（操作/格式两用）
 * [POS]:      components/tree/UnifiedToolbar.tsx
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import React from 'react';

interface UnifiedToolbarProps {
  type: 'operation' | 'format';
  position: { x: number; y: number };
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  children: React.ReactNode;
}

export function UnifiedToolbar({ type, position, onMouseEnter, onMouseLeave, children }: UnifiedToolbarProps) {
  return (
    <div
      className="fixed z-50 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl p-0.5 flex items-center gap-0.5 transition-all duration-200 ease-out animate-in fade-in slide-in-from-bottom-2"
      style={{
        left: `${position.x}px`,
        transform: 'translateX(-50%)',
        top: `${position.y}px`,
        pointerEvents: 'auto',
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-toolbar-type={type}
    >
      {children}
    </div>
  );
}

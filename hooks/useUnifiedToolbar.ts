/**
 * [INPUT]:    nodeId, useTreeStore
 * [OUTPUT]:   工具栏显示/隐藏状态（操作栏/格式栏互斥）
 * [POS]:      hooks/useUnifiedToolbar.ts
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';

export type ToolbarType = 'operation' | 'format' | null;

export function useUnifiedToolbar(nodeId: string) {
  const [toolbarType, setToolbarType] = useState<ToolbarType>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const disableOperationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isOperationDisabled, setIsOperationDisabled] = useState(false);

  const activeToolbarNodeId = useTreeStore(s => s.activeToolbarNodeId);
  const setActiveToolbarNodeId = useTreeStore(s => s.setActiveToolbarNodeId);

  const isActive = activeToolbarNodeId === nodeId;

  const showOperationToolbar = (x: number, y: number) => {
    if (isOperationDisabled) return;
    clearAllTimeouts();
    setPosition({ x, y: y + 5 });
    setToolbarType('operation');
    setActiveToolbarNodeId(nodeId);
  };

  const showFormatToolbar = (x: number, y: number) => {
    clearAllTimeouts();
    setPosition({ x, y: y + 5 });
    setToolbarType('format');
    setActiveToolbarNodeId(nodeId);
    setIsOperationDisabled(true);
    if (disableOperationTimeoutRef.current) {
      clearTimeout(disableOperationTimeoutRef.current);
    }
    disableOperationTimeoutRef.current = setTimeout(() => {
      setIsOperationDisabled(false);
    }, 3000);
    timeoutRef.current = setTimeout(() => {
      hideToolbar();
    }, 2000);
  };

  const hideToolbar = () => {
    clearAllTimeouts();
    setToolbarType(null);
    setActiveToolbarNodeId(null);
  };

  const delayedHide = (delay: number = 500) => {
    timeoutRef.current = setTimeout(() => {
      hideToolbar();
    }, delay);
  };

  const cancelHide = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const clearAllTimeouts = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const updatePosition = (x: number, y: number) => {
    if (isActive && toolbarType === 'operation') {
      setPosition({ x, y: y + 5 });
    }
  };

  useEffect(() => {
    return () => {
      clearAllTimeouts();
      if (disableOperationTimeoutRef.current) {
        clearTimeout(disableOperationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isActive) {
      setToolbarType(null);
    }
  }, [isActive]);

  return {
    toolbarType: isActive ? toolbarType : null,
    position,
    showOperationToolbar,
    showFormatToolbar,
    hideToolbar,
    delayedHide,
    cancelHide,
    updatePosition,
    isOperationDisabled,
  };
}

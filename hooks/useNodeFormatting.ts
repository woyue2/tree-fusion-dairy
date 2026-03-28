/**
 * [INPUT]:    nodeId, useTreeStore
 * [OUTPUT]:   格式化 hook（bold/italic/underline/highlight，renderMarkdown）
 * [POS]:      hooks/useNodeFormatting.ts
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import { useState, useCallback, useMemo, useRef } from 'react';
import { useTreeStore } from '@/hooks/useTreeStore';
import { renderMarkdown } from '@/lib/utils';

export function useNodeFormatting(nodeId: string) {
  const node = useTreeStore(s => s.nodes[nodeId]);
  const updateContent = useTreeStore(s => s.updateNodeContent);

  const selectionRangeRef = useRef<{ start: number; end: number } | null>(null);

  const renderFormattedText = useMemo(() => {
    return renderMarkdown(node?.content || '');
  }, [node?.content]);

  const storeSelection = useCallback((input: HTMLInputElement) => {
    if (!input) return;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;
    if (start !== end) {
      selectionRangeRef.current = { start, end };
    }
  }, []);

  const applyFormat = useCallback((format: 'bold' | 'italic' | 'underline' | 'highlight') => {
    const selectionRange = selectionRangeRef.current;
    if (!selectionRange || !node) return;

    const { start, end } = selectionRange;
    const before = node.content.substring(0, start);
    const selected = node.content.substring(start, end);
    const after = node.content.substring(end);

    let openTag = '';
    let closeTag = '';

    switch (format) {
      case 'bold':      openTag = '**'; closeTag = '**'; break;
      case 'italic':    openTag = '*';  closeTag = '*';  break;
      case 'underline': openTag = '<u>'; closeTag = '</u>'; break;
      case 'highlight': openTag = '=='; closeTag = '=='; break;
    }

    const isWrappedInner = selected.startsWith(openTag) && selected.endsWith(closeTag) && selected.length >= openTag.length + closeTag.length;
    const isWrappedOuter = before.endsWith(openTag) && after.startsWith(closeTag);

    let formatted = '';
    if (isWrappedInner) {
      formatted = before + selected.substring(openTag.length, selected.length - closeTag.length) + after;
    } else if (isWrappedOuter) {
      formatted = before.substring(0, before.length - openTag.length) + selected + after.substring(closeTag.length);
    } else {
      formatted = before + openTag + selected + closeTag + after;
    }

    updateContent(nodeId, formatted);
    selectionRangeRef.current = null;
  }, [node, nodeId, updateContent]);

  return { renderFormattedText, storeSelection, applyFormat };
}

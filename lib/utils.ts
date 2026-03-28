/**
 * [INPUT]:    text strings
 * [OUTPUT]:   sanitized HTML for safe rendering
 * [POS]:      lib/utils.ts - Markdown rendering utilities
 * [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md
 */

import DOMPurify from 'dompurify';

export function sanitizeHTML(html: string): string {
  if (typeof window === 'undefined') {
    return html;
  }
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['strong', 'em', 'mark', 'u', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['class'],
  });
}

export function renderMarkdown(text: string): string {
  if (!text) return '';

  let html = text;

  // 荧光笔 ==text==
  html = html.replace(/==(.+?)==/g, '<mark class="bg-yellow-200 dark:bg-yellow-900/50 px-1 rounded">$1</mark>');

  // 粗体 **text**
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

  // 斜体 *text* (避免匹配 **)
  html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

  return sanitizeHTML(html);
}

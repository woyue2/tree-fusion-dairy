// INPUT: 各工具函数的输入（见各函数签名）
// OUTPUT: 各工具函数的输出（纯函数，无副作用）
// POS: utils/index.ts — GEB L3 · 纯工具函数
// [PROTOCOL]: 变更时更新此头部，然后检查 CLAUDE.md

/** 生成带前缀的唯一 ID */
export function generateId(prefix = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

/** 格式化日期为可读字符串 */
export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('zh-CN', {
    year:  'numeric',
    month: '2-digit',
    day:   '2-digit',
  })
}

/** 安全截断字符串 */
export function truncate(str: string, max: number): string {
  return str.length <= max ? str : `${str.slice(0, max)}...`
}

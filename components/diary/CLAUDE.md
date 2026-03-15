# components/diary · L2 Member Manifest

> **[PROTOCOL]**: 本文档描述日记模块 UI 组件的协作关系。

---

## 成员清单 (Member List)

| 组件 | 角色 | 依赖 |
|---|---|---|
| `DiaryContainer.tsx` | 主容器 | `DiaryEditor`, `DiaryViewer`, `useDiaryStore` |
| `DiaryEditor.tsx` | 核心编辑器 | `ai.ts` (AI Actions), `useDiaryStore` |
| `DiaryViewer.tsx` | 沉浸式阅读器 | `DiaryEntry` 类型, `date-fns` |
| `DiarySidebar.tsx` | 侧边栏辅助 | `useDiaryStore` |
| `WeeklySummaryModal.tsx` | 周报弹窗 | `ai.ts`, `useMoodStore` |

---

## 交互逻辑
1. `DiaryContainer` 根据 `currentDiaryId` 切换列表与编辑器视图。
2. `DiaryEditor` 触发 `optimizeStructureAction` 或 `analyzeDiaryAction` 并将结果写回 Store。
3. `DiaryViewer` 作为固定容器 (`fixed inset-0`) 覆盖在基础 UI 之上提供阅读体验。

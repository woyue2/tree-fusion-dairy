# Todo Module Components

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，变更时更新此文件，然后检查根 CLAUDE.md。

## 职责

Todo 看板交互层。负责多视图任务拖拽、列管理、任务编辑与灵感快速录入。

## 成员清单

| 文件 | 职责 | 备注 |
|---|---|---|
| `BoardContainer.tsx` | Todo 看板主容器 | 负责 DnDContext、多视图切换、乐观更新与任务/列拖拽持久化 |
| `TodoColumn.tsx` | 看板列组件 | 渲染状态/上下文/日期列，承载列级拖拽、折叠、列动作菜单 |
| `TodoCard.tsx` | 任务卡片组件 | 渲染任务内容、颜色、标签、状态信息，并作为任务拖拽单元 |
| `TaskModal.tsx` | 任务编辑弹窗 | 创建/编辑任务，支持高饱和与低饱和两套背景色选择 |
| `IdeaModal.tsx` | 灵感录入弹窗 | 快速记录 idea，并联动 mood/app store 反馈 |

## 约束

- 任务拖拽持久化以整份任务快照为准，避免只更新单卡导致 `orderIndex` 漂移。
- 颜色选择保留两套背景色：低饱和（fusion-todo 原始淡色）+ 高饱和（当前鲜艳色）。
- 列内任务显示顺序依赖 `orderIndex`，读取时必须显式排序。

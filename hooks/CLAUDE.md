# hooks · L2 Member Manifest

> **[PROTOCOL]**: 本文档描述项目状态管理与同步引擎的状态分发逻辑。

---

## 成员清单 (Member List)

| Hook | 角色 | 职责 |
|---|---|---|
| `syncEngine.ts` | 同步中枢 | 编排 Initial Pull 与周期性 Background Push |
| `useAppStore.ts` | 基础设施状态 | 管理 `isOnline` 和 `syncStatus` |
| `useDiaryStore.ts` | 日记领域 Store | 维护日记 CRUD 状态、AI 中间态及同步标记 |
| `useMoodStore.ts` | 情绪领域 Store | 记录情绪分数、计算滚动平均、处理云端同步 |
| `useTodoStore.ts` | 任务领域 Store | 看板配置（Status/Context）与任务项的联合管理 |
| `useTreeStore.ts` | 知识树 Store | 层次化文档结构、节点移动、undo/redo 历史栈、离线变更追踪 |
| `useUnifiedToolbar.ts` | 工具栏状态 Hook | 操作栏/格式栏互斥显示控制 |
| `useNodeFormatting.ts` | 格式化 Hook | bold/italic/underline/highlight，renderMarkdown |
| `useFrogStore.ts` | 青蛙追踪 Store | 每日番茄钟增减、frogLogs 明细日志、跨模块统计 Todo 完成数 |

---

## 设计策略
1. **Zustand + Immer**: 使用 `zustand` 配合 `immer` 中间件以保证状态更新的不可变性与简洁感。
2. **Dexie Persistence**: 每个领域 Store 的 `load/add/set` 动作通过首选本地数据库 (Dexie) 操作，再由同步引擎镜像到云端。
3. **_dirty 标记**: 同步依赖于实体对象上的 `_dirty: 1` 标记及其对应的 `updatedAt` 时间轴。

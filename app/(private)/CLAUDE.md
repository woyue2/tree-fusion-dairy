# app/(private) · L2 Member Manifest

> **[PROTOCOL]**: 本文档为 GEB 分形文档 L2 层，描述 `app/(private)` 目录下成员的架构关系。

---

## 路由成员 (Route Items)

| 目录/文件 | 角色 | 输入/依赖 | 输出/功能 |
|---|---|---|---|
| `layout.tsx` | 内部私有总布局 | `useSyncEngine`, `useAppStore` | 全局侧边栏, 离线同步引擎初始化, 水和管理 |
| `diary/` | 结构化日记路由 | `useDiaryStore` | 日记列表展示, 沉浸式阅读器, AI 优化编辑 |
| `todo/` | Fusion Todo 路由 | `useTodoStore` | 多视图任务管理（看板/列表） |
| `tree/` | 知识树路由 | `useTreeStore`, `lib/db` | 分层文件夹管理, 知识切片, 脑网可视化 |
| `stats/` | 情绪统计路由 | `useMoodStore` | 情绪曲线走势, 数据可视化可视化分析 |
| `frogs/` | 青蛙没关系路由 | `useFrogStore`, `useTodoStore` | 每日高价值任务追踪, 番茄钟手动记录, 明细日志面板 |
| `settings/` | 应用设置路由 | `useAppStore` | 账户管理, 数据导入导出, 主题配置 |

---

## 核心契约 (Core Contracts)

### 1. 离线同步路径
- 所有 `(private)` 路由内的变更必须通过 `_dirty` 字段标记为 `1`。
- `layout.tsx` 挂载 `useSyncEngine` 以进行后台异步推送及挂载时初始化拉取。

### 2. Layout 职责
- **权限**: 继承自 `middleware.ts` 的 Auth 校验，内部无需再次检查 Session。
- **状态**: 维护侧边栏收缩状态 (`isCollapsed`)。
- **SEO**: 提供各子路由的基础页面标题模板。

---

## 质量红线
- 禁止在 `layout.tsx` 顶层使用 `require`（导致 Hydration 阻塞）。
- 路由组件必须配套 `loading.tsx`。
- 与 AI 相关的操作必须在 `DiaryEditor` 等具体组件内进行 Server Action 调用，不污染 Layout。

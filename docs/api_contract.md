# API & Server Actions Contract

> **[PROTOCOL]**: 本文档记录前端与服务端（Server Actions/Route Handlers）之间的通信契约。

---

## Server Actions (app/actions/)

### 离线同步 (sync.ts)
| 函数 | 描述 | 输入 | 响应 |
|---|---|---|---|
| `syncMoodAction` | 同步单条情绪记录 | `Mood` | `{ success: boolean }` |
| `syncTaskAction` | 同步单条任务记录 | `TodoTask` | `{ success: boolean }` |
| `syncDocAction` | 同步树形文档 | `TreeDocument` | `{ success: boolean }` |
| `syncDiaryAction` | 同步日记条目 | `DiaryEntry` | `{ success: boolean }` |
| `pullMoodsAction` | 从云端拉取情绪历史 | - | `Mood[]` |
| `pullDiariesAction` | 从云端拉取日记历史 | - | `DiaryEntry[]` |
| `fetchUserDataAction` | 全量初始化拉取 | - | `{ tasks, statuses, contexts }` |

### AI 智能 (ai.ts)
| 函数 | 描述 | 输入 | 响应 |
|---|---|---|---|
| `analyzeDiaryAction` | 情绪分析与标题生成 | `content: string` | `DiaryAnalysisResult` |
| `optimizeStructureAction` | 日记结构化建议 | `content: string` | `string` (Structured Markdown) |

---

## 数据格式规范
1. **UUID**: 核心标识符统一使用 UUID v4。
2. **Timestamps**: 统一使用 Unix Timestamp (ms) 进行本地比较，Supabase 端自动映射为 `timestamptz`。
3. **Dirty Flag**: 客户端实体必须包含 `_dirty: 0 | 1` 用于增量同步算法。

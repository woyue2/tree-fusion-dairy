# Evolution Log

# 2026-03-16

## 变动 补全看板配置同步逻辑，发布云端数据库 Schema
### 原因 满足全量数据（含列配置、上下文）云端同步的需求，保证新环境快速部署
### 影响 新增 `supabase_schema.sql`；补全 `statuses` / `contexts` 表同步逻辑；Server Actions 归类至 `app/actions/sync.ts`

# 2026-03-15

## 变动 实现离线优先同步引擎与灵感录入增强
### 原因 需要支持不稳定网络环境下的数据持久化，并满足心情记录与统计需求
### 影响 引入 Dexie.js (IndexedDB)；重构 useTodoStore 和 useMoodStore 逻辑；新增后台同步 worker；增强 IdeaModal 支持心情/任务双模式录制

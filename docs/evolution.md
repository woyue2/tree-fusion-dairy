<!--
[INPUT]:    Daily commit logs and major refactor summaries
[OUTPUT]:   Chronological project evolution record
[POS]:      docs/evolution.md - Project history and decision log
[PROTOCOL]: Update this log after every /git_commit
-->
# Evolution Log
 
## 2026-03-29
### [FEATURE] 青蛙没关系 (Frog Tracker) & Mood UI Refinement
- **Mood Heatmap**: Redesigned to exactly match prototype aesthetics (Vivid colors, aspect-ratio 1:1, dashed placeholders). Added rolling averages (7d, 30d, 60d, 180d).
- **Frog Tracker**: New module "/frogs" for tracking daily high-value tasks ("Frogs").
- **Integration**: Automated counting of `done` tasks from `fusion-todo` merged with manual Pomodoro increments.
- **Architecture**: Extended Lexie schema with `pomodoros` table; introduced `useFrogStore` for cross-module statistics extraction.

## 变动 青蛙明细日志系统上线
### 原因 日记需求要求表格右侧有可滚动明细 div，记录每次番茄增减历史（含自动任务联动）
### 影响 新增 LocalFrogLog 接口与 frogLogs Dexie 表 (version 2)；useFrogStore 新增 loadLogs/addTaskLog；FrogContainer 右侧增加 256px 明细面板，点击行切换日期实时刷新

# 2026-03-28

## 变动 修复全站 12+ 处非交互 UI 按钮并补齐 Store 接口
### 原因 最近的功能迁移导致部分按钮（撤销/保存/格式化）仅有样式而无逻辑绑定
### 影响 补齐 `TreeContainer` 的保存/撤销逻辑；激活 `DiaryEditor` 的加粗、链接、结构化提取等工具栏功能；为情绪热力图增加点击交互；同步完善 GEB L1-L3 文档契约

## 变动 移除知识树侧边栏删除能力并增强根节点保护
### 原因 用户反馈侧边栏（文档列表）应作为稳固导航区，不可随意删除；强化大纲根节点不可删逻辑以防结构崩溃
### 影响 移除 `TreeSidebar.tsx` 中活跃文档项的废纸篓图标；`OutlineNode.tsx` 动态隐藏根节点删除按钮；确保侧边栏作为纯导航区域的稳定性


# 2026-03-17

## 变动 知识树 (Tree) 与 日记本 (Diary) UI/UX 深度重构
### 原因 原有 UI 过于简陋且不符合原型设计；需要更专业的写作与回顾体验
### 影响 知识树实现 3 栏布局与无限大纲样式；日记本重构为分栏布局并集成 AI 分析侧边栏；统一全站 UI 风格至高质感标准

## 变动 日记模块深度集成 Zhipu AI 分析与结构化能力
### 原因 提供超出普通记录的情感价值提取与回顾能力
### 影响 新增 `analyzeDiaryAction` (情感分析) 与 `optimizeStructureAction` (结构化)；新增 AI 仪表盘 UI；支持智能周报生成预览

## 变动 修复数据同步导致的页面崩溃与 404 资源错误
### 原因 异步状态竞争导致 destructing undefined；Next.js 缓存与多端口冲突引起资源加载失败
### 影响 增强 `useTreeStore` 防御性检查；清理 `.next` 缓存并重启服务至可用状态；完善 GEB L2/L3 文档以防范代码异味

## 变动 统一全项目身份标识 (userId) 并清理 UI 冗余
### 原因 降低本地开发同步复杂度；消除 CSS 历史债务
### 影响 统一 `userId` 为 `default-user`；重构拖拽视觉效果；大幅缩减 `globals.css` 体积至核心样式

# 2026-03-16

## 变动 补全看板配置同步逻辑，发布云端数据库 Schema
### 原因 满足全量数据（含列配置、上下文）云端同步的需求，保证新环境快速部署
### 影响 新增 `supabase_schema.sql`；补全 `statuses` / `contexts` 表同步逻辑；Server Actions 归类至 `app/actions/sync.ts`

## 变动 集成知识树 (Knowledge Tree) 大纲模块，实现离线同步
### 原因 移植原项目核心逻辑，提供层级化结构笔记能力，并支持离线优先体验
### 影响 新增 `OutlineTree` / `OutlineNode` 组件；实现 `useTreeStore` 大纲逻辑；Dexie 和 Supabase 增加 `documents` 表支持；支持 Tab/Enter 等大纲快捷交互

# 2026-03-15

## 变动 实现离线优先同步引擎与灵感录入增强
### 原因 需要支持不稳定网络环境下的数据持久化，并满足心情记录与统计需求
### 影响 引入 Dexie.js (IndexedDB)；重构 useTodoStore 和 useMoodStore 逻辑；新增后台同步 worker；增强 IdeaModal 支持心情/任务双模式录制

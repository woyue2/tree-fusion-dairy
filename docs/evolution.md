# Evolution Log

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

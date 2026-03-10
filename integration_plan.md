# Tree-Fusion-Diary (三位一体) 集成开发计划书 V3.0 (最终蓝图版)

## 1. 项目愿景 (Vision)
构建一个以 **Next.js 14** 为底座，深度融合 **Action (Todo)**, **Thought (Tree)**, **Narrative (Diary)** 的单一全栈应用。实现“登录即全能、离线亦可用、云端永同步”的终极体验。

---

## 2. 核心架构与环境对齐 (Infrastructure Alignment)

### 2.1 依赖与框架准则 (Standards)
- **基准环境**: Next.js 14.2.x (App Router) + React 18.3.x。
- **样式规范**: Tailwind CSS v3.4。
  - 建立 `styles/theme.css` 统一管理 CSS Variables（如 `--app-primary`, `--sidebar-bg`），解决三个项目色彩空间不一致的问题。
- **工程红线**: `fusion-todo` 必须进行 React 19 -> 18 的降级重构（移除 `useActionState` 等新特性）。

---

## 3. 跨沙盒数据迁移方案 (Data Migration Path)

### 3.1 客户端导入策略 (Client-Side Importer)
由于 `diary-app` 数据存储于用户本地 File System，后端脚本无法访问。
- **解决方案**: 在 `/settings/import` 路由下开发一个 **"Legacy Data Importer"** 组件。
- **流程**: 
  1. 用户在浏览器中手动选定旧版 `MyDiary` 文件夹。
  2. 前端 JS 利用 `window.showDirectoryHandle` 递归读取 `.json` 和图片。
  3. **用户 ID 绑定**: 在前端读取 Session 后，将数据逐条通过 Supabase Client 批量 Upsert，自动注入当前登录用户的 `user_id`。
- **Todo 数据**: 针对 `todo.db` (SQLite)，提供一个文件上传入口，在 Server Action 中使用 `better-sqlite3` 解析并同步到 PostgreSQL。

---

## 4. 状态管理范式收拢 (State Management Paradigm)

### 4.1 统一流派: Zustand + Dexie (Offline-First)
为了消除 `SWR` 与 `Dexie` 的心智冲突，全平台统一采用以下流派：
- **Ground Truth (事实来源)**: 浏览器本地的 **Dexie.js (IndexedDB)**。
- **UI 绑定**: 使用 **Zustand** 订阅 Dexie 的变化（通过 `useLiveQuery`）。
- **同步引擎 (Sync Engine)**: 
  - 放弃 `SWR/React Query`。
  - 开发通用的 `useSyncWorker`。当用户操作（如创建 Todo 或日记）时，先写 Dexie 并标记 `_dirty: true`。
  - 背景进程（Background Sync）负责将 `_dirty` 记录推送到 Supabase，并在成功后清除标记。
  - **优势**: 实现真正的 0 延迟 UI 反馈，且完美适配 `tree-index` 现有的树形复杂状态。

---

## 5. 多媒体与存储架构 (Media Storage)

### 5.1 统一对象存储
- **服务**: Supabase Storage (`user-assets` 桶)。
- **路径规范**: `/{user_id}/{module_name}/{year}/{file_name}`。
- **转换逻辑**: 迁移时，所有 `<img>` 标签的 `src` 需从本地绝对路径替换为 Supabase 的公共 URL。

---

## 6. 全局布局与交互底座 (Unified UI Shell)

### 6.1 App Shell 设计
- **Root Layout**: 包含全局 `AuthContextProvider`。
- **SideNav (侧边导航)**: 
  - 顶部: 模块切换 (Todo | Tree | Diary)。
  - 中部: 当前模块的快捷分类（如 Todo 的 Contexts、Tree 的收藏节点）。
  - 底部: 用户头像、同步状态指示灯、设置。
- **动态样式保护**: 为每个模块定义独立的容器 Class (如 `.fusion-theme`, `.tree-theme`)，通过外层注入变量防止 CSS 污染。

---

## 7. 部署与数据库维护 (Deployment & DB)

### 7.1 数据库实例策略
- **策略**: **复用 `tree-index` 现有的 Supabase 项目**。
- **原因**: 避免 Auth 用户表迁移 (`auth.users`) 的密码加密兼容性风险，并直接继承已有的 AI 配置和环境变量。
- **操作**: 通过 SQL 控制台运行 `modules/todo/schema.sql` 和 `modules/diary/schema.sql` 增量建表。

---

## 8. 重构红线与 DoD (Definition of Done)
1. **禁止原生 DOM**: 彻底移除 `diary-app` 的所有 `document.getElementById`。
2. **统一图标**: 全平台强制使用 `lucide-react`。
3. **安全准则**: 每一个新 API 路由必须包含 `createRouteHandlerClient` 校验，严防未授权访问。

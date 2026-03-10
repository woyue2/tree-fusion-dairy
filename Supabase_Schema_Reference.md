# Tree-Fusion-Diary · Supabase 数据库设计参考 (Schema Reference)

> **目标**: 为 Next.js + Supabase 架构提供统一的数据库表结构参考。
> **基准**: 结合了 fusion-todo, tree-index, diary-app，并独立化了 Life-Coach-AI 衍生出的「情绪统计 (Mood Stats)」模块。
> **策略**: 采用关系型与 JSONB 混合的方式。结构化用于核心查询，JSONB 用于高频变动或灵活拓展的内容（如大纲节点、特定元数据）。

---

## 核心设计原则

1. **Row Level Security (RLS)**: 所有表必须开启 RLS，通过 `auth.uid()` 绑定所属用户，确保多用户数据隔离。
2. **Offline-First 兼容**: 客户端（如 Dexie.js）会产生数据，所有表的主键应使用 `uuid` 并且支持客户端生成。需要带有 `updated_at` 字段以支持增量同步。
3. **软删除 (Soft Delete)**: 重要数据（如日记、文档）采用软删除 `deleted_at`（或 `is_deleted`），避免误操作。

---

## 1. 情绪统计模块 (Mood Stats)

作为独立抽出的核心数据模块，重点用于快速生成日历热力图和滚动均值。此模块不再耦合日记表，以支持「只记录心情不想写日记」的极简场景。

```sql
-- 表名: moods
CREATE TABLE moods (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  date DATE NOT NULL,              -- 记录日期 (YYYY-MM-DD)，通常一个用户一天只需一条记录
  score SMALLINT NOT NULL CHECK (score >= 1 AND score <= 10), -- 情绪得分 1-10
  note VARCHAR(255),               -- 一句话记录/备注
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, date)            -- 确保同一用户同一天只有一条最终状态的情绪记录
);

-- 优化建议:
-- 为 (user_id, date) 建立索引，这对热力图按月份范围 (range) 查询极其高效。
```

---

## 2. Todo 模块 (Fusion Todo)

Todo 模块分为 任务卡片、看板状态(Status) 和 看板上下文(Context)。在这里，**表之间的联动尤为重要**。Fusion-todo 允许自定义 Status 和 Context 列，并且支持卡片在这些列之间拖拽，以及列本身的拖拽重排和折叠。

### 核心联动规则 (Interlocking Rules)
*   **状态与上下文的独立生命周期**: 任务 (`Task`) 必须归属于一个状态 (`Status`) 和一个上下文 (`Context`)。
*   **外键约束**: `todo_tasks.status_id` 和 `todo_tasks.context_id` 必须作为外键，分别指向 `todo_statuses.id` 和 `todo_contexts.id`。
*   **级联删除预防**: 如果删除了一个 Status 或 Context，必须妥善处理关联的任务（例如，禁止删除有任务的列，或者将任务转移到默认列，或者级联软删除）。在 fusion-todo 的设计中，通常不允许直接删除非空的列。
*   **排序联动**: 卡片的纵向排序（`todo_tasks.order_index`）和列的横向排序（`todo_statuses.order_index`, `todo_contexts.order_index`）需要在客户端严格维护，并在同步时保证最终一致性。

```sql
-- 表名: todo_statuses (状态/进度列配置)
CREATE TABLE todo_statuses (
  id TEXT PRIMARY KEY,                   -- 明确的主键 (如 'todo', 'doing', 'done')
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,                   -- 列标题
  collapsed BOOLEAN DEFAULT FALSE,       -- 用户个人的列折叠状态
  below_of TEXT,                         -- 暂时保留兼容可能的设计，通常用 order_index
  order_index REAL,                      -- 横向排序权重
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, id)                    -- 确保用户空间内 ID 唯一
);

-- 表名: todo_contexts (上下文/场景列配置)
CREATE TABLE todo_contexts (
  id TEXT PRIMARY KEY,                   -- (如 'c1', 'c2')
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,
  color TEXT,                            -- 该场景的标志色
  collapsed BOOLEAN DEFAULT FALSE,
  below_of TEXT,
  order_index REAL,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, id)
);

-- 表名: todo_tasks
CREATE TABLE todo_tasks (
  id UUID PRIMARY KEY,                   -- 客户端 Dexie/Uuid 生成
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,                   -- 任务描述
  status_id TEXT NOT NULL REFERENCES todo_statuses(id) ON DELETE RESTRICT,  -- 强关联：列不能随意删除
  context_id TEXT NOT NULL REFERENCES todo_contexts(id) ON DELETE RESTRICT, -- 强关联
  
  color TEXT,                            -- 优先级颜色 (如 '#ff5252')
  tags TEXT[],                           -- 标签数组
  
  order_index REAL,                      -- 卡片在列内的排序权重
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- 软删除标记
);

-- 联动优化 (Indexes for Interlocking):
-- 为了支持快速拉取单个列的所有任务，以及联表查询
CREATE INDEX idx_todo_tasks_status ON todo_tasks(user_id, status_id);
CREATE INDEX idx_todo_tasks_context ON todo_tasks(user_id, context_id);
```

---

## 3. 日记模块 (Diary App)

日记模块包含富文本内容、提取的纯文本、结构化分析版本以及关联的媒体资源。

```sql
-- 表名: diaries
CREATE TABLE diaries (
  id UUID PRIMARY KEY,                   -- 客户端生成的 UUID
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  date DATE NOT NULL,                    -- 所属日期
  title TEXT NOT NULL,                   -- 日记标题
  preview TEXT,                          -- 列表页展示的简介 (可由 content 截取生成，或单独存储)
  
  content TEXT,                          -- 用户手写的原始内容 (对应 js 中的 content)
  original_content TEXT,                 -- (可选) 在 AI 结构化之前保存的纯净原文备份
  structured_version TEXT,               -- AI 结构化优化后的内容
  final_version TEXT,                    -- 用户最终确定的内容 (对应 js 中的 finalVersion)
  
  images TEXT[],                         -- 头图图片 URL 数组
  footer_images TEXT[],                  -- 尾注图片 URL 数组
  
  ai_analysis JSONB,                     -- 情感色彩分析、标签、一句话总结等 JSON 结构 (对应 js 中的 analysis)
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- 软删除标记
);

-- 表名: weekly_summaries (周记模块)
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY,                   -- (例如 'weekly_171...'，建议后续向 UUID 改造)
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  start_date DATE NOT NULL,              -- 对应 startDate
  end_date DATE NOT NULL,                -- 对应 endDate
  title TEXT NOT NULL,
  summary TEXT NOT NULL,                 -- AI 生成的周记主体内容
  
  diary_ids UUID[],                      -- (建议) 归档到该周记的基础日记 ID 列表，源码暂未强依赖但推荐后续加入
  images TEXT[],                         -- 周记头图
  footer_images TEXT[],                  -- 周记尾图
  regenerations INTEGER DEFAULT 0,       -- 对应源码中的 regenerations 计数
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. 知识树模块 (Tree Index)

知识树具备无限层级。传统的父子指针查询整棵树在关系数据库中较慢，但考虑到文档粒度，推荐 **将一整棵树作为一个文档进行存储，节点数据序列化为 JSONB**，或者采用传统的 adjacency list (邻接表) 并配合客户端内存构建。

鉴于本应用采用 Zustand + Dexie 优先的架构，建议**后端采用 JSONB 重块存储**，以此最大化同步效率并避免极高的递归查询开销。

```sql
-- 表名: tree_documents (知识树主文档)
CREATE TABLE tree_documents (
  id UUID PRIMARY KEY,                   -- 对应 BaseOutlineNode 的 id
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,                   -- 文档名称 (对应 SidebarItem 的 title)
  icon TEXT,                             -- emoji 图标
  
  nodes JSONB NOT NULL,                  -- [核心设计] 存放整棵大纲树的序列化数据 (Flattened Tree)
                                         -- 取代原来分散的 OutlineNode 每行一条记录，解决 IndexedDB 与 Supabase 之间的同步黑洞。
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- 软删除（进入回收站，对应 metadata.deletedAt）
);

/* 
  nodes 字段内 JSONB 结构参考 (完全对齐 tree-index /types/index.ts 的 StoredOutlineNode):
  {
    "root_id": { 
      "id": "root_id", 
      "parentId": null, 
      "content": "...", 
      "level": 0,
      "children": ["n1", "n2"], 
      "images": [...], 
      "collapsed": false,
      "isHeader": false,
      "isSubHeader": false,
      "isItalic": false,
      "tags": ["..."],
      "icon": "..."
    },
    ...
  }
*/
```

---

## 总结优化与对齐思考

1. **分离与正交**:
   * **心情(Mood) vs 日记(Diary)**: 将 `moods` 从 `diaries` 分离。用户可以在看板直接评 8 分并写下一句话备注，而不需要强迫他打开大日记编辑器。日历热力图只需 SELECT `moods` 表，性能开销极小。
2. **Offline-First 同步友好**:
   * 所有表的主键 ID，除了 `moods` 可以让后端默认生成外，其他表（Task, Diary, Document）尽量支持**客户端在离线时生成 UUID/Nanoid 并插入本地 Dexie**。当恢复在线网络时，以带唯一 ID 的 Upsert (`ON CONFLICT (id) DO UPDATE`) 模式推送到 Supabase。
3. **存储策略**:
   * 图片不要以 Base64 存放在以上表中，应该一律使用 **Supabase Storage**，在以上表中只存放对应的 **Public URL 字符串**。

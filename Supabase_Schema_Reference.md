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

Todo 模块分为 任务卡片、看板状态(Status) 和 看板上下文(Context)。

```sql
-- 表名: todo_tasks
CREATE TABLE todo_tasks (
  id UUID PRIMARY KEY,                   -- 客户端生成的 UUID
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,                   -- 任务描述/标题
  status_id TEXT NOT NULL,               -- 关联的状态列 ID (如 'todo', 'doing')
  context_id TEXT NOT NULL,              -- 关联的上下文/清单 ID (如 'c1', 'c2')
  
  color TEXT,                            -- 卡片优先级颜色 (如 '#ff5252')
  tags TEXT[],                           -- 标签数组
  
  order_index REAL,                      -- 客户端双向链表/分数排序用的权重字段，处理拖拽重排
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_deleted BOOLEAN DEFAULT FALSE
);

-- 注意：如果 Status 和 Context 允许用户完全自定义，可以建立独立的列配置表：
-- 表名: todo_boards (配置看板的列头排序和颜色等)
CREATE TABLE todo_boards (
  id TEXT PRIMARY KEY,                   -- 例如 'status_todo', 'context_work'
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type VARCHAR(20) NOT NULL,             -- 'status' 或 'context'
  title TEXT NOT NULL,
  color TEXT,
  order_index REAL,                      -- 列的左右拖拽重排
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. 日记模块 (Diary App)

日记模块包含富文本内容、提取的纯文本、结构化分析版本以及关联的媒体资源。

```sql
-- 表名: diaries
CREATE TABLE diaries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  date DATE NOT NULL,                    -- 所属日期
  title TEXT NOT NULL,                   -- 日记标题
  preview TEXT,                          -- 列表页展示的简介 (前几十个字)
  
  content TEXT,                          -- 用户手写的原始内容
  structured_version TEXT,               -- AI 结构化优化后的内容
  final_version TEXT,                    -- 用户最终确定的内容 (可能与 content 一样)
  
  images TEXT[],                         -- 头图图片 URL 数组
  footer_images TEXT[],                  -- 尾注图片 URL 数组
  
  ai_analysis JSONB,                     -- AI 给出的建议、标签或情感色彩分析
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- 软删除标记
);

-- 表名: weekly_summaries (周记模块)
CREATE TABLE weekly_summaries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,                 -- AI 生成的周记内容
  
  diary_ids UUID[],                      -- 归档到该周记的基础日记 ID 列表
  images TEXT[],
  
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
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  
  title TEXT NOT NULL,                   -- 侧边栏展示的文档名称
  icon TEXT,                             -- emoji 图标
  
  nodes JSONB NOT NULL,                  -- [核心设计] 存放整棵大纲树的序列化数据 (Flattened Tree 或嵌套结构)
                                         -- 取代原来分散的 OutlineNode 每行一条记录
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ                 -- 软删除（进入回收站）
);

/* 
  nodes 字段内 JSONB 结构参考 (Flatten 模式更利于拖拽同步):
  {
    "root_id": { "id":"root_id", "content":"...", "parentId": null, "children":["n1", "n2"], "collapsed": false },
    "n1": { "id":"n1", "content":"...", "parentId": "root_id", "children":[] }
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

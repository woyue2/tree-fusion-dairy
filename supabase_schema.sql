-- [POS]: 根目录 / supabase_schema.sql
-- [DESC]: 用于在 Supabase SQL Editor 中运行以创建所有必需的表和 RLS 策略

-- 1. 开启必要扩展
create extension if not exists "uuid-ossp";

-- 2. 情绪表
create table if not exists moods (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  date date not null,
  score int2 not null,
  note text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. 任务表
create table if not exists todo_tasks (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  status_id text,
  context_id text,
  tags text[],
  color text,
  order_index int4,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 4. 树形文档表
create table if not exists tree_documents (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  title text not null,
  icon text,
  nodes jsonb default '[]'::jsonb,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 5. 看板状态表
create table if not exists todo_statuses (
  id text primary key, -- 允许自定义 ID 如 'todo', 'doing'
  user_id text not null,
  title text not null,
  color text,
  collapsed boolean default false,
  order_index int4,
  updated_at timestamptz default now()
);

-- 6. 看板上下文表
create table if not exists todo_contexts (
  id text primary key, 
  user_id text not null,
  title text not null,
  color text,
  collapsed boolean default false,
  order_index int4,
  updated_at timestamptz default now()
);

-- 7. 日记表
create table if not exists diaries (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  date date not null,
  title text,
  content jsonb default '{}'::jsonb, -- 包含 original, structured, final 等版本
  images text[],
  analysis jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz
);

-- 8. (可选) RLS 策略
-- alter table moods enable row level security;
-- create policy "Users can only access their own moods" on moods for all using (true);
-- 同理应用到其他表...

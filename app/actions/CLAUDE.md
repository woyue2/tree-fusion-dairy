# app/actions · L2 Member Manifest

> **[PROTOCOL]**: 本文档描述服务端 Actions 的分工契约。

---

## 成员清单 (Actions List)

| 文件 | 角色 | 涉及表/实体 | 功能描述 |
|---|---|---|---|
| `sync.ts` | 核心同步 Actions | `moods`, `todo_*`, `tree_*`, `diaries` | 处理 Dexie 与 Supabase 之间的全量拉取 (Fetch) 与增量同步 (Upsert) |
| `ai.ts` | AI 智能加工 | - | 封装 ZhipuAI (GLM-4) 接口，提供情绪分析、日记结构优化及文案建议 |
| `tree.ts` | 知识树专有变更 | `tree_documents` | 处理复杂的树形结构节点变动（非同步引擎覆盖的特殊操作） |

---

## 交互契约
1. **'use server'**: 所有文件必须以该指令开头，确保逻辑在服务器端运行。
2. **鉴权**: 内部应调用 `lib/supabase-server.ts` 获取鉴权后的客户端，禁止在 action 层明文处理用户凭证。
3. **响应**: 统一通过 Try/Catch 捕获异常，并返回标准化的错误信息供前端 Toast 消费。
